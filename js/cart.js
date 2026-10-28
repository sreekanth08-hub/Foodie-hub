/**
 * FoodieHub - Shopping Cart Logic (cart.js)
 * -------------------------------------------------------------
 * Powers the complete shopping cart:
 * 1. getCart() / saveCart() with LocalStorage persistence
 * 2. renderCart() - switches between empty state and item list
 * 3. Quantity controls: increaseQuantity() / decreaseQuantity()
 * 4. Item removal: removeFromCart() & clearCart()
 * 5. Price calculations: calculateSubtotal() & calculateTotal()
 * 6. Promo code handling (FOODIE50 for flat ₹50 OFF)
 */

// Delivery fee constant in INR
const DELIVERY_FEE = 40;

// Active discount state
let activeDiscount = 0;
let appliedPromoCode = '';

// Run once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initCartPage();
});

/**
 * Initialize Cart Page
 */
function initCartPage() {
  // Restore any previously applied promo from session
  const savedPromo = sessionStorage.getItem('appliedPromo');
  if (savedPromo === 'FOODIE50') {
    activeDiscount = 50;
    appliedPromoCode = 'FOODIE50';
  }

  // Render cart content and totals
  renderCart();

  // Attach event delegation for items list (+, -, remove)
  initCartListEvents();

  // Setup Clear Cart button
  initClearCartButton();

  // Setup Promo Code form
  initPromoCodeForm();
}

/**
 * 1. Storage Helpers
 */
function getCart() {
  try {
    return JSON.parse(localStorage.getItem('cart')) || [];
  } catch (err) {
    console.error('Error reading cart from localStorage:', err);
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
    // Synchronize navbar badge counter
    if (typeof updateCartBadge === 'function') {
      updateCartBadge();
    }
  } catch (err) {
    console.error('Error saving cart to localStorage:', err);
  }
}

/**
 * 2. Calculation Functions
 */
function calculateSubtotal(cart) {
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function calculateTotal(subtotal, deliveryFee, discount) {
  if (subtotal === 0) return 0;
  return Math.max(0, subtotal + deliveryFee - discount);
}

/**
 * 3. Render Cart
 */
function renderCart() {
  const cart = getCart();
  const emptyView = document.getElementById('cart-empty-view');
  const populatedView = document.getElementById('cart-populated-view');
  const itemsList = document.getElementById('cart-items-list');
  const headerCount = document.getElementById('cart-header-count');

  if (!emptyView || !populatedView) return;

  // Empty cart view
  if (!cart || cart.length === 0) {
    emptyView.style.display = 'block';
    populatedView.style.display = 'none';
    // Clear any promo if cart emptied
    activeDiscount = 0;
    appliedPromoCode = '';
    sessionStorage.removeItem('appliedPromo');
    return;
  }

  // Populated cart view
  emptyView.style.display = 'none';
  populatedView.style.display = 'grid';

  // Total items count
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (headerCount) {
    headerCount.textContent = `(${totalItemCount} item${totalItemCount > 1 ? 's' : ''})`;
  }

  // Render items markup
  if (itemsList) {
    itemsList.innerHTML = cart.map(item => {
      const itemTotal = item.price * item.quantity;
      const dietClass = item.isVeg ? 'veg' : 'non-veg';

      return `
        <div class="cart-item" data-id="${item.id}">
          <!-- Thumbnail -->
          <div class="cart-item-media">
            <span class="food-diet-badge ${dietClass}" style="top: 6px; left: 6px; width: 18px; height: 18px;"></span>
            <img 
              src="${item.image}" 
              alt="${item.name}" 
              class="cart-item-img"
              onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80';"
            >
          </div>

          <!-- Info -->
          <div class="cart-item-info">
            <h3 class="cart-item-title">${item.name}</h3>
            <div class="cart-item-meta">
              <span>${item.category || 'Dish'}</span>
              <span>•</span>
              <span class="cart-item-unit-price">₹${item.price} each</span>
            </div>
          </div>

          <!-- Quantity Control -->
          <div class="cart-qty-control">
            <button class="cart-qty-btn btn-qty-dec" data-id="${item.id}" aria-label="Decrease quantity">
              <i class="fa-solid fa-minus"></i>
            </button>
            <span class="cart-qty-val">${item.quantity}</span>
            <button class="cart-qty-btn btn-qty-inc" data-id="${item.id}" aria-label="Increase quantity">
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>

          <!-- Item Total -->
          <div class="cart-item-total">
            ₹${itemTotal}
          </div>

          <!-- Remove Action -->
          <button class="btn-remove-item" data-id="${item.id}" title="Remove ${item.name} from cart">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      `;
    }).join('');
  }

  // Update order summary calculations
  updateOrderSummary(cart);
}

/**
 * Updates the right-side summary calculations card
 */
function updateOrderSummary(cart) {
  const subtotalEl = document.getElementById('cart-subtotal');
  const deliveryEl = document.getElementById('cart-delivery-fee');
  const discountRow = document.getElementById('row-discount');
  const discountEl = document.getElementById('cart-discount');
  const grandTotalEl = document.getElementById('cart-grand-total');

  const subtotal = calculateSubtotal(cart);
  const deliveryFee = subtotal > 0 ? DELIVERY_FEE : 0;
  const grandTotal = calculateTotal(subtotal, deliveryFee, activeDiscount);

  if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
  if (deliveryEl) deliveryEl.textContent = `₹${deliveryFee}`;

  if (discountRow && discountEl) {
    if (activeDiscount > 0) {
      discountRow.style.display = 'flex';
      discountEl.textContent = `-₹${activeDiscount}`;
    } else {
      discountRow.style.display = 'none';
    }
  }

  if (grandTotalEl) grandTotalEl.textContent = `₹${grandTotal}`;
}

/**
 * 4. Cart List Interactions (Event Delegation)
 */
function initCartListEvents() {
  const itemsList = document.getElementById('cart-items-list');
  if (!itemsList) return;

  itemsList.addEventListener('click', (e) => {
    // Increase quantity button
    const incBtn = e.target.closest('.btn-qty-inc');
    if (incBtn) {
      const id = parseInt(incBtn.dataset.id, 10);
      increaseQuantity(id);
      return;
    }

    // Decrease quantity button
    const decBtn = e.target.closest('.btn-qty-dec');
    if (decBtn) {
      const id = parseInt(decBtn.dataset.id, 10);
      decreaseQuantity(id);
      return;
    }

    // Remove item button
    const removeBtn = e.target.closest('.btn-remove-item');
    if (removeBtn) {
      const id = parseInt(removeBtn.dataset.id, 10);
      removeFromCart(id);
      return;
    }
  });
}

/**
 * Increases quantity of an item by 1
 */
function increaseQuantity(id) {
  let cart = getCart();
  const index = cart.findIndex(item => item.id === id);

  if (index > -1) {
    if (cart[index].quantity < 20) {
      cart[index].quantity++;
      saveCart(cart);
      renderCart();
    } else {
      showToast('Maximum quantity of 20 reached for this item.');
    }
  }
}

/**
 * Decreases quantity of an item by 1 (removes if reduced from 1)
 */
function decreaseQuantity(id) {
  let cart = getCart();
  const index = cart.findIndex(item => item.id === id);

  if (index > -1) {
    if (cart[index].quantity > 1) {
      cart[index].quantity--;
      saveCart(cart);
      renderCart();
    } else {
      // Prompt user or remove if quantity reaches 0
      removeFromCart(id);
    }
  }
}

/**
 * Removes an item completely from the cart
 */
function removeFromCart(id) {
  let cart = getCart();
  const itemToRemove = cart.find(item => item.id === id);

  cart = cart.filter(item => item.id !== id);
  saveCart(cart);
  renderCart();

  if (itemToRemove) {
    showToast(`Removed ${itemToRemove.name} from cart.`);
  }
}

/**
 * Clears the entire cart
 */
function clearCart() {
  saveCart([]);
  activeDiscount = 0;
  appliedPromoCode = '';
  sessionStorage.removeItem('appliedPromo');
  renderCart();
  showToast('Cart cleared.');
}

function initClearCartButton() {
  const clearBtn = document.getElementById('btn-clear-cart');
  if (!clearBtn) return;

  clearBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  });
}

/**
 * 5. Promo Code Handler
 */
function initPromoCodeForm() {
  const form = document.getElementById('promo-form');
  const input = document.getElementById('promo-code-input');
  const message = document.getElementById('promo-message');

  if (!form || !input || !message) return;

  // Restore input value if previously applied
  if (appliedPromoCode) {
    input.value = appliedPromoCode;
    message.className = 'promo-message success';
    message.textContent = '🎉 Coupon FOODIE50 applied (₹50 OFF)!';
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = input.value.trim().toUpperCase();

    if (!code) {
      message.className = 'promo-message error';
      message.textContent = 'Please enter a promo code.';
      return;
    }

    const cart = getCart();
    const subtotal = calculateSubtotal(cart);

    if (code === 'FOODIE50') {
      if (subtotal < 199) {
        message.className = 'promo-message error';
        message.textContent = 'Coupon FOODIE50 requires a minimum order of ₹199.';
        return;
      }

      activeDiscount = 50;
      appliedPromoCode = 'FOODIE50';
      sessionStorage.setItem('appliedPromo', 'FOODIE50');

      message.className = 'promo-message success';
      message.textContent = '🎉 Coupon FOODIE50 applied! Flat ₹50 OFF saved.';
      showToast('Coupon applied: ₹50 discount added!');
      renderCart();
    } else {
      activeDiscount = 0;
      appliedPromoCode = '';
      sessionStorage.removeItem('appliedPromo');

      message.className = 'promo-message error';
      message.textContent = 'Invalid promo code. Try "FOODIE50"';
      renderCart();
    }
  });
}

/**
 * Toast notification helper
 */
function showToast(text) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <i class="fa-solid fa-circle-check" style="color: var(--secondary);"></i>
    <span>${text}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-remove');
    setTimeout(() => toast.remove(), 300);
  }, 2700);
}
