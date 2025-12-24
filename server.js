const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increased limit for image uploads
app.use(express.static(path.join(__dirname, 'public')));

// Data Route
app.get('/api/products', (req, res) => {
    fs.readFile(path.join(__dirname, 'data', 'products.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to load products' });
        }
        res.json(JSON.parse(data));
    });
});

app.get('/api/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    fs.readFile(path.join(__dirname, 'data', 'products.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to load products' });
        }
        const products = JSON.parse(data);
        const product = products.find(p => p.id === productId);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    });
});

// Helper to read/write orders
const ORDERS_FILE = path.join(__dirname, 'data', 'orders.json');

const getOrders = () => {
    if (!fs.existsSync(ORDERS_FILE)) return [];
    const data = fs.readFileSync(ORDERS_FILE);
    return JSON.parse(data);
};

const saveOrder = (order) => {
    const orders = getOrders();
    orders.push(order);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
};

// Site Config
app.get('/api/config', (req, res) => {
    res.json({
        advanceAmount: 499,
        upiId: 'anurag.luhar@okaxis', // Replace with user's actual UPI if provided, else placeholder
        siteName: 'Apple Store'
    });
});

// Admin Route - Get All Orders
app.get('/api/admin/orders', (req, res) => {
    try {
        const orders = getOrders();
        res.json(orders.reverse()); // Newest first
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Track Individual Order
app.get('/api/orders/:orderId', (req, res) => {
    try {
        const orders = getOrders();
        const order = orders.find(o => o.orderId === req.params.orderId);
        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ error: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Error' });
    }
});

// Process Deferred Payment (999)
app.post('/api/orders/:orderId/pay-deferred', (req, res) => {
    const { orderId } = req.params;
    const { amount } = req.body; // Should be 999

    try {
        const orders = getOrders();
        const index = orders.findIndex(o => o.orderId === orderId);

        if (index === -1) return res.status(404).json({ error: 'Order not found' });

        const order = orders[index];

        // Update Payment Info
        order.amounts.paid += amount;
        order.amounts.due -= amount;
        order.paymentStatus = order.amounts.due <= 0 ? 'PAID' : 'PARTIAL_PAID';

        // Log the transaction
        if (!order.transactions) order.transactions = [];
        order.transactions.push({
            date: new Date().toISOString(),
            amount: amount,
            type: 'DEFERRED_PAYMENT'
        });

        // Save back to file
        orders[index] = order;
        fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));

        res.json({ success: true, message: 'Payment recorded', order });
    } catch (error) {
        console.error('Deferred Payment Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update Order Status (Admin)
app.patch('/api/orders/:orderId/status', (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    try {
        const orders = getOrders();
        const index = orders.findIndex(o => o.orderId === orderId);

        if (index === -1) return res.status(404).json({ error: 'Order not found' });

        orders[index].status = status; // Add explicit status field

        fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
        res.json({ success: true, message: 'Status updated', status });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// Delete Order (Admin)
app.delete('/api/orders/:orderId', (req, res) => {
    const { orderId } = req.params;
    try {
        let orders = getOrders();
        const initialLength = orders.length;
        orders = orders.filter(o => o.orderId !== orderId);

        if (orders.length === initialLength) {
            return res.status(404).json({ error: 'Order not found' });
        }

        fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
        res.json({ success: true, message: 'Order deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete order' });
    }
});

// Detailed Order processing
app.post('/api/orders', (req, res) => {
    const { cart, amount, paymentType, customerDetails, paymentScreenshot, transactionId: txnId } = req.body; // paymentScreenshot added

    // Simulate processing delay
    setTimeout(() => {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = 0; // No extra tax added on top
        const total = subtotal;

        // Logic for Advance Payment
        const isAdvancePayment = paymentType === 'ONLINE' && (amount == 499 || amount == 999);
        const paymentStatus = isAdvancePayment ? 'PARTIAL_PAID' : (paymentType === 'COD' ? 'PENDING' : 'PAID');

        const orderId = 'ORD-' + Math.floor(Math.random() * 1000000);
        const transactionId = txnId || (paymentType === 'COD' ? 'PENDING-COD' : 'TXN-' + Date.now().toString(36).toUpperCase());

        const newOrder = {
            orderId,
            transactionId,
            date: new Date().toISOString(),
            items: cart,
            amounts: {
                subtotal,
                tax,
                total,
                paid: amount,
                due: total - amount
            },
            paymentType,
            paymentStatus,
            paymentScreenshot: paymentScreenshot || null, // Save screenshot
            customerDetails: customerDetails || {}
        };

        try {
            saveOrder(newOrder);
            console.log(`Order Processed: ${orderId} | Type: ${paymentType} | Status: ${paymentStatus}`);

            res.json({
                success: true,
                orderId: orderId,
                transactionId: transactionId,
                message: isAdvancePayment ? 'Advance Payment Received' : 'Order Placed Successfully',
                details: {
                    total: total,
                    paid: amount,
                    due: total - amount,
                    date: new Date().toLocaleString()
                }
            });
        } catch (error) {
            console.error('Error saving order:', error);
            res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    }, 1500);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
