// --- CONFIGURATION & STATE ---
const CONFIG = {
    advanceAmount: 499
};

// MOCK DATA (So the site works without a backend server)
const products = [
    {
        id: 1,
        name: "iPhone 15 Pro Max",
        price: 159900,
        originalPrice: 169900,
        image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-max-natural-titanium-select-202309?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1693510919611",
        description: "The first iPhone to feature an aerospace-grade titanium design, using the same alloy that spacecraft use for missions to Mars.",
        variants: {
            storage: ["256GB", "512GB", "1TB"],
            colors: ["Natural Titanium", "Blue Titanium", "White Titanium", "Black Titanium"]
        }
    },
    {
        id: 2,
        name: "iPhone 15",
        price: 79900,
        originalPrice: 89900,
        image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-blue-select-202309?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692924328228",
        description: "New camera. New design. Newphoria. Dynamic Island bubbles up alerts and Live Activities — so you don’t miss them while you’re doing something else.",
        variants: {
            storage: ["128GB", "256GB", "512GB"],
            colors: ["Blue", "Pink", "Yellow", "Green", "Black"]
        }
    },
    {
        id: 3,
        name: "iPhone 14",
        price: 69900,
        originalPrice: 79900,
        image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-14-purple-select-202209?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1661027931055",
        description: "A magical new way to interact with iPhone. Groundbreaking safety features designed to save lives. An innovative 48MP camera for mind-blowing detail.",
        variants: {
            storage: ["128GB", "256GB", "512GB"],
            colors: ["Purple", "Blue", "Midnight", "Starlight", "Red"]
        }
    },
    {
        id: 4,
        name: "iPhone 13",
        price: 59900,
        originalPrice: 69900,
        image: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-13-starlight-select-2021?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1629907844000",
        description: "Super Retina XDR display. A15 Bionic chip. Superfast 5G. Durable design. And a huge leap in battery life.",
        variants: {
            storage: ["128GB", "256GB", "512GB"],
            colors: ["Starlight", "Midnight", "Blue", "Pink", "Green"]
        }
    },
     {
        id: 5,
        name: "iPhone 16 Pro Max",
        price: 169900,
        originalPrice: 179900,
        image: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-16-pro-desert-titanium-select-202409?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1725567752408",
        description: "Built for Apple Intelligence. A18 Pro chip. Camera Control. And a huge leap in battery life.",
        variants: {
            storage: ["256GB", "512GB", "1TB"],
            colors: ["Desert Titanium", "Natural Titanium", "White Titanium", "Black Titanium"]
        }
    },
    {
        id: 6,
        name: "iPhone 16",
        price: 79900,
        originalPrice: 89900,
        image: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-16-ultramarine-select-202409?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1725567363404",
        description: "Built for Apple Intelligence. A18 chip. Camera Control. Action button. And a huge leap in battery life.",
        variants: {
            storage: ["128GB", "256GB", "512GB"],
            colors: ["Ultramarine", "Teal", "Pink", "White", "Black"]
        }
    }
];

// Initialize Cart from LocalStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    
    // Router Logic based on which element exists on the page
    if (document.getElementById('product-list')) {
        renderProductList();
    } else if (document.getElementById('detail-container')) {
        loadProductDetails();
    } else if (document.getElementById('cart-items')) {
        renderCartPage();
    } else if (document.getElementById('payment-section')) {
        setupPaymentPage();
    }
});

// --- CORE FUNCTIONS ---

function updateCartCount() {
    const countElement = document.getElementById('cart-count');
    if (countElement) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        countElement.textContent = totalItems;
        // Hide badge if 0
        countElement.style.display = totalItems > 0 ? 'flex' : 'none'; 
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function addToCart(product) {
    // Check for duplicates
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCart();
    alert("Item added to bag!");
}

// --- HOME PAGE LOGIC ---

function renderProductList() {
    const grid = document.getElementById('product-list');
    
    grid.innerHTML = products.map(p => {
        // Calculate Discount
        const discountPercent = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
        
        return `
        <div class="product-card">
            <div style="position: absolute; top: 10px; left: 10px; display: flex; flex-direction: column; gap: 5px; z-index: 2;">
                <div class="product-new-badge" style="color: #d32f2f; background: #ffebee; padding: 4px 8px; border-radius: 4px; font-weight: 600; font-size: 10px;">
                    ${discountPercent}% OFF
                </div>
                <div style="background: #e8f5e9; color: #2e7d32; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; text-transform: uppercase;">
                    <i class="fas fa-check-circle"></i> Certified Refurbished
                </div>
            </div>

            <img src="${p.image}" alt="${p.name}" class="product-image" onclick="window.location.href='product.html?id=${p.id}'" style="cursor: pointer;">
            
            <h3 class="product-title">${p.name}</h3>
            <div class="product-price">
                <span style="color: #d63030;">From ₹${p.price.toLocaleString('en-IN')}</span>
                <span style="text-decoration: line-through; color: #888; font-size: 12px; margin-left: 5px;">₹${p.originalPrice.toLocaleString('en-IN')}</span>
            </div>

            <div class="product-actions">
                <button class="btn-buy" onclick="window.location.href='product.html?id=${p.id}'">Buy Now</button>
                <button class="btn-cart" onclick="quickAdd(${p.id})">Add to Cart</button>
            </div>
        </div>
    `}).join('');
}

function quickAdd(id) {
    const product = products.find(p => p.id === id);
    if(product) {
        // For Quick Add, we select defaults (first options)
        const defaultVariant = {
            storage: product.variants?.storage?.[0] || '',
            color: product.variants?.colors?.[0] || ''
        };
        
        // Calculate basic price based on defaults
        const finalPrice = calculatePrice(product.price, product, defaultVariant.storage);
        
        // Create ID
        const compositeId = `${product.id}-${defaultVariant.storage}-${defaultVariant.color}`;
        
        addToCart({
            id: compositeId,
            name: `${product.name} (${defaultVariant.color}/${defaultVariant.storage})`,
            price: finalPrice,
            image: product.image,
            originalId: product.id,
            quantity: 1
        });
    }
}

// --- PRODUCT DETAIL PAGE LOGIC ---

function loadProductDetails() {
    const params = new URLSearchParams(window.location.search);
    const productId = parseInt(params.get('id'));
    
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        document.getElementById('detail-container').innerHTML = '<h2>Product not found</h2>';
        return;
    }

    // Default Selections
    const currentSelection = {
        storage: product.variants?.storage ? product.variants.storage[0] : null,
        color: product.variants?.colors ? product.variants.colors[0] : null
    };

    // Helper to create variant buttons
    const createSelector = (label, options, type) => `
        <div style="margin-bottom: 20px;">
            <label style="display: block; font-size: 14px; color: #86868b; margin-bottom: 8px; font-weight: 600;">${label}</label>
            <div class="variant-options" style="display: flex; gap: 10px; flex-wrap: wrap;">
                ${options.map(opt => `
                    <button class="variant-btn ${opt === currentSelection[type] ? 'selected' : ''}" 
                        onclick="updateDetailsPrice(this, '${type}', '${opt}')" 
                        data-type="${type}" data-value="${opt}"
                        style="padding: 10px 20px; border: 1px solid ${opt === currentSelection[type] ? '#0071e3' : '#d2d2d7'}; border-radius: 12px; background: ${opt === currentSelection[type] ? '#eff6ff' : 'white'}; color: ${opt === currentSelection[type] ? '#0071e3' : '#1d1d1f'}; cursor: pointer;">
                        ${opt}
                    </button>
                `).join('')}
            </div>
        </div>
    `;

    // Render HTML
    const container = document.getElementById('detail-container');
    container.innerHTML = `
        <div class="product-detail-wrapper" style="display: flex; flex-wrap: wrap; gap: 40px; justify-content: center;">
            <div class="detail-image" style="flex: 1; min-width: 300px; text-align: center;">
                <img src="${product.image}" alt="${product.name}" style="width: 100%; max-width: 400px; border-radius: 20px;">
            </div>
            
            <div class="detail-info" style="flex: 1; min-width: 300px;">
                <h1 style="font-size: 40px; margin-bottom: 10px;">${product.name}</h1>
                <div id="dynamic-price-display" style="font-size: 28px; font-weight: 500; margin-bottom: 20px;">
                    ₹${product.price.toLocaleString('en-IN')}
                </div>
                
                <p style="font-size: 17px; line-height: 1.5; color: #666; margin-bottom: 30px;">
                    ${product.description}
                </p>

                ${product.variants?.colors ? createSelector('Color', product.variants.colors, 'color') : ''}
                ${product.variants?.storage ? createSelector('Storage', product.variants.storage, 'storage') : ''}

                <div id="product-data" style="display:none;" data-id="${product.id}"></div>

                <button class="btn-primary" style="width: 100%; padding: 18px; margin-top: 20px; border-radius: 12px;" onclick="addToCartFromDetails()">
                    Add to Bag
                </button>
            </div>
        </div>
    `;
}

// Handle Variant Clicks
function updateDetailsPrice(btn, type, value) {
    // 1. Update Visuals
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

    // 2. Recalculate Price
    const productId = document.getElementById('product-data').dataset.id;
    const product = products.find(p => p.id == productId);
    
    // Find currently selected storage
    let selectedStorage = null;
    document.querySelectorAll('.variant-btn.selected').forEach(b => {
        if(b.dataset.type === 'storage') selectedStorage = b.dataset.value;
    });

    const newPrice = calculatePrice(product.price, product, selectedStorage);
    document.getElementById('dynamic-price-display').innerText = `₹${newPrice.toLocaleString('en-IN')}`;
}

// Add to Cart from Details Page
function addToCartFromDetails() {
    const productId = document.getElementById('product-data').dataset.id;
    const product = products.find(p => p.id == productId);

    const selectedVariants = {};
    document.querySelectorAll('.variant-btn.selected').forEach(btn => {
        selectedVariants[btn.dataset.type] = btn.dataset.value;
    });

    const finalPrice = calculatePrice(product.price, product, selectedVariants.storage);
    const variantString = Object.values(selectedVariants).join(' / ');
    const compositeId = `${product.id}-${Object.values(selectedVariants).join('-')}`;

    addToCart({
        id: compositeId,
        name: `${product.name} (${variantString})`,
        price: finalPrice,
        image: product.image,
        originalId: product.id,
        quantity: 1
    });
    
    window.location.href = 'cart.html';
}

// Helper: Calculate Price based on Storage (Mock Logic: Subtract price for lower storage)
function calculatePrice(basePrice, product, storage) {
    if (!product.variants?.storage || !storage) return basePrice;
    
    const specs = product.variants.storage;
    const maxIndex = specs.length - 1; // Highest spec is base price
    const selectedIndex = specs.indexOf(storage);
    
    if (selectedIndex > -1) {
        // Deduct 5000 for each step down in storage
        const steps = maxIndex - selectedIndex;
        return basePrice - (steps * 5000);
    }
    return basePrice;
}


// --- CART PAGE LOGIC ---

function renderCartPage() {
    const container = document.getElementById('cart-items');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding: 50px 0;">
                <h2 style="margin-bottom: 20px;">Your bag is empty.</h2>
                <a href="index.html" class="btn-primary" style="display:inline-block; width: auto;">Start Shopping</a>
            </div>`;
        document.getElementById('checkout-section').style.display = 'none';
        return;
    }

    document.getElementById('checkout-section').style.display = 'block';
    let total = 0;

    container.innerHTML = cart.map(item => {
        total += item.price * item.quantity;
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <img src="${item.image}" alt="${item.name}">
                    <div>
                        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 5px;">${item.name}</h3>
                        <div class="qty-controls">
                            <button class="qty-btn" onclick="updateQty('${item.id}', -1)">-</button>
                            <span style="font-size: 16px; width: 20px; text-align: center;">${item.quantity}</span>
                            <button class="qty-btn" onclick="updateQty('${item.id}', 1)">+</button>
                        </div>
                        <div class="remove-btn" onclick="removeItem('${item.id}')">Remove</div>
                    </div>
                </div>
                <div class="cart-item-price">
                    ₹${(item.price * item.quantity).toLocaleString('en-IN')}
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('cart-total').textContent = total.toLocaleString('en-IN');
}

function updateQty(id, change) {
    const item = cart.find(i => i.id == id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeItem(id);
            return;
        }
        saveCart();
        renderCartPage();
    }
}

function removeItem(id) {
    cart = cart.filter(i => i.id != id);
    saveCart();
    renderCartPage();
}

// --- PAYMENT PAGE LOGIC ---

function setupPaymentPage() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Inject Cart Items into Summary
    const summaryContainer = document.getElementById('cart-items-summary');
    if(summaryContainer) {
        summaryContainer.innerHTML = cart.map(item => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px;">
                <span>${item.name} <span style="color:#888">x${item.quantity}</span></span>
                <span>₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
            </div>
        `).join('');
    }

    document.getElementById('summary-subtotal').innerText = '₹' + total.toLocaleString('en-IN');
    document.getElementById('summary-total').innerText = '₹' + total.toLocaleString('en-IN');
    
    // Update Advance Amount texts
    document.querySelectorAll('.advance-amount-display').forEach(el => {
        el.innerText = '₹' + CONFIG.advanceAmount;
    });
}
