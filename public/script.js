// Basic state management
const cart = JSON.parse(localStorage.getItem('cart')) || [];
const CONFIG = {
    advanceAmount: 499
};

function updateCartCount() {
    const countElement = document.getElementById('cart-count');
    if (countElement) {
        countElement.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }
}

function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();

    // Custom notification
    const btn = event.target;
    const originalText = btn.innerText;
    btn.innerText = 'Added';
    btn.style.background = '#4CAF50';
    setTimeout(() => {
        btn.innerText = originalText;
        btn.style.background = '';
    }, 1500);
}

// Handle Variant Selection and Price Update
function updateDetailsPrice(btn, basePrice, type, value) {
    // Visual Update
    const parent = btn.parentElement;
    Array.from(parent.children).forEach(child => {
        child.classList.remove('selected');
        child.style.background = 'white';
        child.style.color = '#1d1d1f';
        child.style.borderColor = '#d2d2d7';
    });
    btn.classList.add('selected');
    btn.style.background = '#eff6ff';
    btn.style.color = '#0071e3';
    btn.style.borderColor = '#0071e3';

    // Calculate New Price
    const allSelected = {};
    document.querySelectorAll('.variant-btn.selected').forEach(b => {
        allSelected[b.dataset.type.toLowerCase()] = b.dataset.value;
    });

    // Helper needs product object - retrieve from data attribute on a hidden element for simplicity
    const productDataEl = document.getElementById('product-data');
    if (productDataEl) {
        const product = JSON.parse(productDataEl.dataset.product);
        const newPrice = calculatePrice(basePrice, product, allSelected.storage, allSelected.ram);

        // Update Price Text
        const priceEl = document.getElementById('dynamic-price-display');
        if (priceEl) {
            const originalPrice = product.originalPrice ? `<span style="text-decoration: line-through; color: #888; font-size: 20px; margin-right: 10px;">₹${(product.originalPrice * 0.4).toLocaleString('en-IN')}</span>` : '';
            priceEl.innerHTML = `${originalPrice}₹${newPrice.toLocaleString('en-IN')}`;
        }
    }
}

function addToCartCurrent() {
    const productDataEl = document.getElementById('product-data');
    if (!productDataEl) return;

    const product = JSON.parse(productDataEl.dataset.product);

    // Collect variants
    const selectedVariants = {};
    document.querySelectorAll('.variant-btn.selected').forEach(btn => {
        selectedVariants[btn.dataset.type.toLowerCase()] = btn.dataset.value;
    });

    const price = calculatePrice(product.price, product, selectedVariants.storage, selectedVariants.ram);

    const variantString = Object.values(selectedVariants).join(' / ');
    const productName = variantString ? `${product.name} (${variantString})` : product.name;
    const compositeId = `${product.id}-${Object.values(selectedVariants).join('-')}`;

    addToCart({
        id: compositeId,
        name: productName,
        price: price,
        image: product.image,
        originalId: product.id
    });
}

// Handle Variant Selection
function selectVariant(btn) {
    const parent = btn.parentElement;
    // Remove selected class from siblings
    Array.from(parent.children).forEach(child => {
        child.classList.remove('selected');
        child.style.background = 'white';
        child.style.color = '#1d1d1f';
        child.style.borderColor = '#d2d2d7';
    });
    // Add selected class to clicked button
    btn.classList.add('selected');
    btn.style.background = '#eff6ff';
    btn.style.color = '#0071e3';
    btn.style.borderColor = '#0071e3';
}

function addToCartWithOptions(id, name, price, image) {
    // Collect selected variants
    const selectedVariants = {};
    document.querySelectorAll('.variant-btn.selected').forEach(btn => {
        selectedVariants[btn.dataset.type] = btn.dataset.value;
    });

    const variantString = Object.values(selectedVariants).join(' / ');
    const productName = variantString ? `${name} (${variantString})` : name;

    // Create a unique ID based on variants so same product with different variants are separate items
    const compositeId = `${id}-${Object.values(selectedVariants).join('-')}`;

    addToCart({
        id: compositeId,
        name: productName,
        price: price,
        image: image,
        originalId: id // Keep ref to original
    });
}

async function fetchProducts() {
    try {
        const response = await fetch('http://localhost:3000/api/products');
        if (!response.ok) throw new Error('Failed to fetch');
        const products = await response.json();
        renderProducts(products);
    } catch (error) {
        console.error('Backend not available', error);
        document.getElementById('product-list').innerHTML = '<p style="text-align:center; padding: 40px;">Unable to load products. Please ensure server is running.</p>';
    }
}

// Helper to calculate price based on variants
function calculatePrice(basePrice, product, storage, ram) {
    if (!product.variants) return basePrice;

    let price = basePrice;

    // Logic: product.price is the MAX price (Highest Spec)
    // We deduct for lower specs

    if (product.variants.storage && storage) {
        const specs = product.variants.storage; // e.g., ["128GB", "256GB", "512GB"]
        const maxIndex = specs.length - 1;
        const selectedIndex = specs.indexOf(storage);
        if (selectedIndex > -1) {
            const steps = maxIndex - selectedIndex;
            price -= (steps * 3000); // Deduct 3000 per storage step
        }
    }

    if (product.variants.ram && ram) {
        const specs = product.variants.ram;
        const maxIndex = specs.length - 1;
        const selectedIndex = specs.indexOf(ram);
        if (selectedIndex > -1) {
            const steps = maxIndex - selectedIndex;
            price -= (steps * 2000); // Deduct 2000 per RAM step
        }
    }

    return price < 0 ? 0 : price;
}

function renderProducts(products) {
    const grid = document.getElementById('product-list');
    grid.innerHTML = products.map(p => {
        // Calculate Minimum Price string
        let minPrice = p.price;
        if (p.variants) {
            const minStorage = p.variants.storage ? p.variants.storage[0] : null;
            const minRam = p.variants.ram ? p.variants.ram[0] : null;
            minPrice = calculatePrice(p.price, p, minStorage, minRam);
        }

        let priceDisplay = `From ₹${minPrice.toLocaleString('en-IN')}`;

        // Discount Calc (using original vs min price for display impact?)
        // Let's keep original badge logic but maybe adjust base? 
        // For simplicity, badge relies on p.price vs p.originalPrice (High spec comparison)
        let discountBadge = '';
        if (p.originalPrice) {
            const discountPercent = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
            discountBadge = `
                <div style="position: absolute; top: 10px; left: 10px; display: flex; flex-direction: column; gap: 5px;">
                    <div class="product-new-badge" style="color: #d32f2f; background: #ffebee; padding: 4px 8px; border-radius: 4px; font-weight: 600;">
                        ${discountPercent >= 60 ? '70% OFF' : '50% OFF'}
                    </div>
                    <div style="background: #e8f5e9; color: #2e7d32; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; text-transform: uppercase;">
                        <i class="fas fa-check-circle"></i> Certified Refurbished
                    </div>
                </div>
            `;
            // Show range or just "From"
            priceDisplay = `
                <span style="font-size: 14px; color: #666; font-weight: 400;">From</span>
                <span style="color: #d32f2f; font-weight: 700; font-size: 1.2em;">₹${minPrice.toLocaleString('en-IN')}</span>
                <span style="text-decoration: line-through; color: #aaa; font-size: 0.8em; margin-left: 5px;">₹${(p.originalPrice * 0.4).toLocaleString('en-IN')}</span>
            `;
        }

        return `
        <div class="product-card" onclick="window.location.href='product.html?id=${p.id}'" style="position: relative;">
            ${discountBadge}
            <div class="product-image-container">
                <img src="${p.image}" alt="${p.name}" class="product-image">
            </div>
            <div class="product-info">
                <div class="product-title">${p.name}</div>
                <div class="product-price">${priceDisplay}</div>
            </div>
            <div class="product-actions">
                <button class="btn-buy" onclick="event.stopPropagation(); window.location.href='product.html?id=${p.id}'">View Options</button>
            </div>
        </div>
    `}).join('');
}

// Logic for Product Details Page
async function loadProductDetails() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));
    if (!id) return;

    try {
        const response = await fetch(`http://localhost:3000/api/products/${id}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const product = await response.json();

        // Default to Lowest Spec
        const currentSelection = {
            storage: product.variants?.storage ? product.variants.storage[0] : null,
            ram: product.variants?.ram ? product.variants.ram[0] : null,
            color: product.variants?.colors ? product.variants.colors[0] : null
        };

        // Render Variants
        let variantsHtml = '';
        if (product.variants) {
            const createSelector = (label, options, type) => `
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-size: 14px; color: #86868b; margin-bottom: 8px; font-weight: 600;">${label}</label>
                    <div class="variant-options" style="display: flex; gap: 10px; flex-wrap: wrap;">
                        ${options.map((opt, idx) => `
                            <button class="variant-btn ${opt === currentSelection[type] ? 'selected' : ''}" 
                                onclick="updateDetailsPrice(this, ${product.price}, '${type}', '${opt}')" 
                                data-type="${type}" data-value="${opt}" 
                            style="padding: 10px 20px; border: 1px solid ${opt === currentSelection[type] ? '#0071e3' : '#d2d2d7'}; border-radius: 12px; background: ${opt === currentSelection[type] ? '#eff6ff' : 'white'}; color: ${opt === currentSelection[type] ? '#0071e3' : '#1d1d1f'}; cursor: pointer; transition: all 0.2s;">
                                ${opt}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;

            if (product.variants.colors) variantsHtml += createSelector('Color', product.variants.colors, 'color');
            if (product.variants.storage) variantsHtml += createSelector('Storage', product.variants.storage, 'storage');
            if (product.variants.ram) variantsHtml += createSelector('RAM', product.variants.ram, 'ram');
        }

        // Initial Price Calculation
        const currentPrice = calculatePrice(product.price, product, currentSelection.storage, currentSelection.ram);

        document.getElementById('detail-container').innerHTML = `
            <div class="detail-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: start;">
                <div class="detail-image-container">
                    <img src="${product.image}" class="detail-image" alt="${product.name}" style="width: 100%; max-width: 500px; margin: 0 auto; display: block; border-radius: 20px;">
                </div>
                <div class="detail-info">
                     <div style="background: #e8f5e9; color: #2e7d32; display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 15px;">
                        <i class="fas fa-check-circle"></i> APPLE CERTIFIED REFURBISHED
                    </div>

                    <h1 style="font-size: 40px; margin-bottom: 10px;">${product.name}</h1>
                    <div class="detail-price" id="dynamic-price-display" style="font-size: 28px; font-weight: 500; margin-bottom: 20px;">
                         ${product.originalPrice ? `<span style="text-decoration: line-through; color: #888; font-size: 20px; margin-right: 10px;">₹${(product.originalPrice * 0.4).toLocaleString('en-IN')}</span>` : ''}
                        ₹${currentPrice.toLocaleString('en-IN')}
                    </div>
                    
                    <p class="description" style="font-size: 17px; line-height: 1.5; color: #515154; margin-bottom: 30px;">${product.description}</p>

                    <!-- Variants Section -->
                    <div id="product-variants">
                        ${variantsHtml}
                    </div>
                    <div id="product-data" style="display:none;" data-base-price="${product.price}" data-product='${JSON.stringify(product).replace(/'/g, "&#39;")}'></div>

                    <!-- Quality Verification Section -->
                    <div style="background: #fbfbfd; border: 1px solid #d2d2d7; border-radius: 16px; padding: 24px; margin-bottom: 30px;">
                        <h3 style="margin-bottom: 15px; font-size: 14px; text-transform: uppercase; color: #86868b; letter-spacing: 0.5px;">Quality Verification</h3>
                        <ul style="list-style: none; padding: 0;">
                            <li style="margin-bottom: 12px; display: flex; align-items: center; gap: 12px; font-size: 15px;">
                                <i class="fas fa-check-circle" style="color: #0071e3;"></i> <span>Genuine Apple Parts</span>
                            </li>
                            <li style="margin-bottom: 12px; display: flex; align-items: center; gap: 12px; font-size: 15px;">
                                <i class="fas fa-check-circle" style="color: #0071e3;"></i> <span>New Battery & Outer Shell</span>
                            </li>
                            <li style="margin-bottom: 12px; display: flex; align-items: center; gap: 12px; font-size: 15px;">
                                <i class="fas fa-check-circle" style="color: #0071e3;"></i> <span>Fully Tested & Cleaned</span>
                            </li>
                            <li style="display: flex; align-items: center; gap: 12px; font-size: 15px;">
                                <i class="fas fa-shield-alt" style="color: #0071e3;"></i> <span>1 Year Warranty Included</span>
                            </li>
                        </ul>
                    </div>

                    <button class="btn-buy" style="width: 100%; padding: 18px; font-size: 18px; border-radius: 12px;" onclick="addToCartCurrent()">Add to Bag</button>
                </div>
            </div>
        `;

    } catch (error) {
        console.error('Error loading product details', error);
    }
}

// Logic for Cart Page
function renderCart() {
    const container = document.getElementById('cart-items');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '<div style="text-align:center; py-5"><h2 style="margin-bottom: 20px;">Your bag is empty.</h2><a href="index.html" class="btn-link" style="justify-content:center;">Start Shopping</a></div>';
        document.getElementById('cart-total').textContent = '0';
        document.getElementById('checkout-btn').style.display = 'none';
        return;
    }

    let total = 0;
    container.innerHTML = cart.map(item => {
        total += item.price * item.quantity;
        return `
            <div class="cart-item" style="padding: 30px 0; border-bottom: 1px solid #d2d2d7; display: flex; align-items: center; gap: 30px;">
                <img src="${item.image}" alt="${item.name}" style="width: 100px; height: 100px; object-fit: contain;">
                <div style="flex-grow: 1;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <h3 style="font-size: 24px;">${item.name}</h3>
                        <div style="font-size: 20px; font-weight: 600;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 20px;">
                        <div class="quantity-controls" style="display: flex; align-items: center; gap: 10px;">
                            <button onclick="updateQuantity('${item.id}', -1)" style="width: 28px; height: 28px; border-radius: 50%; border: 1px solid #ccc; background: white; cursor: pointer;">-</button>
                            <span style="font-size: 17px;">${item.quantity}</span>
                            <button onclick="updateQuantity('${item.id}', 1)" style="width: 28px; height: 28px; border-radius: 50%; border: 1px solid #ccc; background: white; cursor: pointer;">+</button>
                        </div>
                        <button onclick="removeFromCart('${item.id}')" style="color: #0071e3; background: none; border: none; font-size: 15px; cursor: pointer;">Remove</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('cart-total').textContent = total.toLocaleString('en-IN');
    document.getElementById('checkout-btn').style.display = 'inline-block';
}

function updateQuantity(id, change) {
    // Use loose equality to match number/string IDs
    const item = cart.find(i => i.id == id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(id);
            return;
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
        updateCartCount();
    }
}

function removeFromCart(id) {
    const index = cart.findIndex(i => i.id == id);
    if (index > -1) {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
        updateCartCount();
    }
}

// Logic for Payment Page
function setupPayment() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (document.getElementById('summary-total')) {
        document.getElementById('summary-total').innerText = '₹' + total.toLocaleString('en-IN');
        document.getElementById('summary-subtotal').innerText = '₹' + total.toLocaleString('en-IN');
    }
    // Update Pay Amount
    if (document.getElementById('pay-amount')) {
        document.getElementById('pay-amount').innerText = CONFIG.advanceAmount;
    }
}

// Initialize based on page
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    if (document.getElementById('product-list')) {
        fetchProducts();
    } else if (document.getElementById('detail-container')) {
        loadProductDetails();
    } else if (document.getElementById('cart-items')) {
        renderCart();
    } else if (document.getElementById('payment-section')) {
        setupPayment();
    }
});
