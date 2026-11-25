// Product information provided in the assignment PDF (static array of objects).
const products = [
    {
        id: 1,
        name: "Wireless Headphones",
        price: 2499,
        originalPrice: 3499,
        discount: 29,
        description: "Comfortable wireless headphones with clear sound and deep bass.",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        category: "Electronics",
        rating: 4.5,
        inStock: true
    },
    {
        id: 2,
        name: "Smart Watch",
        price: 1999,
        originalPrice: 2999,
        discount: 33,
        description: "A stylish smartwatch for fitness tracking and daily use.",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
        category: "Accessories",
        rating: 4.2,
        inStock: true
    },
    {
        id: 3,
        name: "Running Shoes",
        price: 1799,
        originalPrice: 2499,
        discount: 28,
        description: "Lightweight running shoes designed for comfort and everyday workouts.",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
        category: "Footwear",
        rating: 4.4,
        inStock: true
    },
    {
        id: 4,
        name: "Travel Backpack",
        price: 1299,
        originalPrice: 1999,
        discount: 35,
        description: "A spacious backpack suitable for college, office, and travel.",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
        category: "Bags",
        rating: 4.3,
        inStock: true
    },
    {
        id: 5,
        name: "Digital Camera",
        price: 15999,
        originalPrice: 18999,
        discount: 16,
        description: "Capture memorable moments with a compact digital camera.",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500",
        category: "Electronics",
        rating: 4.6,
        inStock: true
    },
    {
        id: 6,
        name: "Sunglasses",
        price: 899,
        originalPrice: 1499,
        discount: 40,
        description: "Modern sunglasses with a stylish frame for everyday wear.",
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500",
        category: "Fashion",
        rating: 4.1,
        inStock: true
    },
    {
        id: 7,
        name: "Coffee Maker",
        price: 3499,
        originalPrice: 4499,
        discount: 22,
        description: "Prepare fresh coffee at home with this easy-to-use coffee maker.",
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500",
        category: "Home Appliances",
        rating: 4.4,
        inStock: false
    }
];

// Cart stores product ID and quantity. Same product is never duplicated.
const cart = new Map();

const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartItemCount = document.getElementById("cartItemCount");
const summaryQuantity = document.getElementById("summaryQuantity");
const grandTotal = document.getElementById("grandTotal");
const checkoutButton = document.getElementById("checkoutButton");
const toastMessage = document.getElementById("toastMessage");
const cartPanel = document.getElementById("cartPanel");
const cartOverlay = document.getElementById("cartOverlay");

let toastTimer;

function formatPrice(amount) {
    return "₹" + amount.toLocaleString("en-IN");
}

function populateCategories() {
    const categories = [...new Set(products.map(product => product.category))];

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

function renderProducts() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedCategory = categoryFilter.value;

    const filteredProducts = products.filter(product => {
        const matchesSearch =
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm);

        const matchesCategory =
            selectedCategory === "All" || product.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    productGrid.innerHTML = "";
    document.getElementById("productCount").textContent = filteredProducts.length;
    document.getElementById("noResults").classList.toggle("d-none", filteredProducts.length !== 0);

    filteredProducts.forEach(product => {
        const card = document.createElement("article");
        card.className = "product-card";

        card.innerHTML = `
            <div class="product-image-wrap">
                <img class="product-image" src="${product.image}"
                     alt="${product.name}" loading="lazy">
                <span class="discount-badge">${product.discount}% OFF</span>
                ${product.inStock ? "" : '<div class="stock-badge"><span>OUT OF STOCK</span></div>'}
            </div>
            <div class="product-content">
                <div class="product-category">${product.category}</div>
                <div class="product-title-row">
                    <h3 class="product-title">${product.name}</h3>
                    <span class="rating">★ ${product.rating.toFixed(1)}</span>
                </div>
                <p class="product-description">${product.description}</p>
                <div class="price-row">
                    <span class="product-price">${formatPrice(product.price)}</span>
                    <span class="original-price">${formatPrice(product.originalPrice)}</span>
                </div>
                <button class="add-button" type="button" data-add-id="${product.id}"
                    ${product.inStock ? "" : "disabled"}>
                    ${product.inStock ? "Add to Cart" : "Out of Stock"}
                </button>
            </div>
        `;

        // If an image URL fails, show a clean placeholder rather than a broken image.
        const image = card.querySelector("img");
        image.addEventListener("error", () => {
            image.src = "https://placehold.co/600x400/f0f4f1/65756a?text=Product";
        }, { once: true });

        productGrid.appendChild(card);
    });
}

function addToCart(productId) {
    const product = products.find(item => item.id === productId);
    if (!product || !product.inStock) {
        showToast("This product is currently out of stock.");
        return;
    }

    const currentItem = cart.get(productId);
    if (currentItem) {
        currentItem.quantity += 1;
    } else {
        cart.set(productId, { productId, quantity: 1 });
    }

    renderCart();
    showToast(product.name + " added to cart");
}

function changeQuantity(productId, change) {
    const item = cart.get(productId);
    if (!item) return;

    const product = products.find(item => item.id === productId);
    const nextQuantity = item.quantity + change;

    if (nextQuantity <= 0) {
        cart.delete(productId);
    } else if (product && product.inStock && nextQuantity <= 99) {
        item.quantity = nextQuantity;
    } else {
        showToast("Maximum quantity reached.");
    }

    renderCart();
}

function removeFromCart(productId) {
    cart.delete(productId);
    renderCart();
    showToast("Product removed from cart");
}

function renderCart() {
    cartItems.innerHTML = "";

    let totalQuantity = 0;
    let totalPrice = 0;

    if (cart.size === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <div class="empty-bag">🛍️</div>
                <h3>Your cart is empty</h3>
                <p>Add something you like to get started.</p>
            </div>
        `;
    } else {
        cart.forEach(item => {
            const product = products.find(product => product.id === item.productId);
            if (!product) return;

            const subtotal = product.price * item.quantity;
            totalQuantity += item.quantity;
            totalPrice += subtotal;

            const row = document.createElement("div");
            row.className = "cart-item";
            row.innerHTML = `
                <img class="cart-item-image" src="${product.image}" alt="${product.name}">
                <div>
                    <h3 class="cart-item-name">${product.name}</h3>
                    <div class="cart-item-price">${formatPrice(product.price)}</div>
                    <div class="cart-item-subtotal">Subtotal: ${formatPrice(subtotal)}</div>
                    <div class="cart-item-controls">
                        <div class="quantity-control" aria-label="Quantity controls">
                            <button type="button" data-quantity-id="${product.id}" data-change="-1"
                                aria-label="Decrease quantity">−</button>
                            <span>${item.quantity}</span>
                            <button type="button" data-quantity-id="${product.id}" data-change="1"
                                aria-label="Increase quantity">+</button>
                        </div>
                        <button class="remove-button" type="button" data-remove-id="${product.id}">Remove</button>
                    </div>
                </div>
            `;
            cartItems.appendChild(row);
        });
    }

    cartCount.textContent = totalQuantity;
    cartItemCount.textContent = totalQuantity;
    summaryQuantity.textContent = totalQuantity;
    grandTotal.textContent = formatPrice(totalPrice);
    checkoutButton.disabled = totalQuantity === 0;
}

function showToast(message) {
    toastMessage.textContent = message;
    toastMessage.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastMessage.classList.remove("show"), 2200);
}

function openCart() {
    cartPanel.classList.add("cart-open");
    cartOverlay.classList.add("show");
    document.body.style.overflow = "hidden";
}

function closeCart() {
    cartPanel.classList.remove("cart-open");
    cartOverlay.classList.remove("show");
    document.body.style.overflow = "";
}

// Event delegation: handle product/cart buttons using one listener per container.
productGrid.addEventListener("click", event => {
    const button = event.target.closest("[data-add-id]");
    if (button) addToCart(Number(button.dataset.addId));
});

cartItems.addEventListener("click", event => {
    const quantityButton = event.target.closest("[data-quantity-id]");
    const removeButton = event.target.closest("[data-remove-id]");

    if (quantityButton) {
        changeQuantity(
            Number(quantityButton.dataset.quantityId),
            Number(quantityButton.dataset.change)
        );
    }

    if (removeButton) {
        removeFromCart(Number(removeButton.dataset.removeId));
    }
});

searchInput.addEventListener("input", renderProducts);
categoryFilter.addEventListener("change", renderProducts);
document.getElementById("mobileCartButton").addEventListener("click", openCart);
document.getElementById("closeCartButton").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

checkoutButton.addEventListener("click", () => {
    if (cart.size === 0) return;
    showToast("Checkout demo: your cart total is " + grandTotal.textContent);
});

populateCategories();
renderProducts();
renderCart();
