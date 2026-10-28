/**
 * FoodieHub - Checkout Page Logic (checkout.js)
 * -------------------------------------------------------------
 * Powers the checkout pipeline:
 * 1. Cart validation & order preview rendering
 * 2. Real-time form validation (Name, Email, Phone, Address, Pincode)
 * 3. Payment method selector interactions
 * 4. Order object creation & LocalStorage persistence
 * 5. Cart clearance and transition to Order Tracking
 */

const DELIVERY_FEE = 40;
let checkoutCart = [];
let checkoutDiscount = 0;

// Run on page load
document.addEventListener('DOMContentLoaded', () => {
  initCheckoutPage();
});

/**
 * Initialize Checkout Page
 */
function initCheckoutPage() {
  // 1. Verify Cart State
  checkoutCart = getCart();
  const emptyGuard = document.getElementById('checkout-empty-guard');
  const mainLayout = document.getElementById('checkout-main-layout');

  if (!checkoutCart || checkoutCart.length === 0) {
    if (emptyGuard) emptyGuard.style.display = 'block';
    if (mainLayout) mainLayout.style.display = 'none';
    return;
  }

  if (emptyGuard) emptyGuard.style.display = 'none';
  if (mainLayout) mainLayout.style.display = 'grid';

  // 2. Read any active promo discount
  const appliedPromo = sessionStorage.getItem('appliedPromo');
  if (appliedPromo === 'FOODIE50') {
    checkoutDiscount = 50;
  }

  // 3. Render Order Summary Preview
  renderOrderPreview();

  // 4. Pre-fill customer details from LocalStorage if user previously ordered
  prefillCustomerInfo();

  // 5. Initialize Payment Method Radio Selectors
  initPaymentSelectors();

  // 6. Setup Form Validation & Submit Button
  initCheckoutFormValidation();
}

/**
 * Helper to get cart from localStorage
 */
function getCart() {
  try {
    return JSON.parse(localStorage.getItem('cart')) || [];
  } catch (err) {
    console.error('Error parsing cart:', err);
    return [];
  }
}

/**
 * Renders the order items preview and pricing breakdown
 */
function renderOrderPreview() {
  const previewContainer = document.getElementById('checkout-items-preview');
  const subtotalEl = document.getElementById('checkout-subtotal');
  const deliveryEl = document.getElementById('checkout-delivery-fee');
  const discountRow = document.getElementById('checkout-discount-row');
  const discountEl = document.getElementById('checkout-discount');
  const grandTotalEl = document.getElementById('checkout-grand-total');

  if (!previewContainer) return;

  // Render items preview
  previewContainer.innerHTML = checkoutCart.map(item => `
    <div class="checkout-item-row">
      <img src="${item.image}" alt="${item.name}" class="checkout-item-thumb">
      <div class="checkout-item-info">
        <span class="checkout-item-name">${item.name}</span>
        <span class="checkout-item-qty">Qty: ${item.quantity} × ₹${item.price}</span>
      </div>
      <span class="checkout-item-price">₹${item.price * item.quantity}</span>
    </div>
  `).join('');

  // Computations
  const subtotal = checkoutCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = DELIVERY_FEE;
  const grandTotal = Math.max(0, subtotal + deliveryFee - checkoutDiscount);

  if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
  if (deliveryEl) deliveryEl.textContent = `₹${deliveryFee}`;

  if (discountRow && discountEl) {
    if (checkoutDiscount > 0) {
      discountRow.style.display = 'flex';
      discountEl.textContent = `-₹${checkoutDiscount}`;
    } else {
      discountRow.style.display = 'none';
    }
  }

  if (grandTotalEl) grandTotalEl.textContent = `₹${grandTotal}`;
}

/**
 * Pre-fills customer fields if saved in LocalStorage
 */
function prefillCustomerInfo() {
  try {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    if (!savedUser) return;

    if (savedUser.name) document.getElementById('cust-name').value = savedUser.name;
    if (savedUser.email) document.getElementById('cust-email').value = savedUser.email;
    if (savedUser.phone) document.getElementById('cust-phone').value = savedUser.phone;

    if (savedUser.address) {
      if (savedUser.address.house) document.getElementById('addr-house').value = savedUser.address.house;
      if (savedUser.address.street) document.getElementById('addr-street').value = savedUser.address.street;
      if (savedUser.address.city) document.getElementById('addr-city').value = savedUser.address.city;
      if (savedUser.address.state) document.getElementById('addr-state').value = savedUser.address.state;
      if (savedUser.address.pincode) document.getElementById('addr-pincode').value = savedUser.address.pincode;
    }
  } catch (err) {
    console.error('Error reading saved user:', err);
  }
}

/**
 * Handles Payment Method tab clicks and shows relevant subfields
 */
function initPaymentSelectors() {
  const radioLabels = document.querySelectorAll('.payment-card-label');
  const subfieldUpi = document.getElementById('subfield-upi');
  const subfieldCard = document.getElementById('subfield-card');

  radioLabels.forEach(label => {
    label.addEventListener('click', () => {
      // Toggle selected class
      radioLabels.forEach(l => l.classList.remove('selected'));
      label.classList.add('selected');

      const radio = label.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;

        // Toggle subfields
        if (subfieldUpi) subfieldUpi.style.display = radio.value === 'UPI' ? 'block' : 'none';
        if (subfieldCard) subfieldCard.style.display = radio.value === 'Credit/Debit Card' ? 'block' : 'none';
      }
    });
  });
}

/**
 * Validation Helper Functions
 */
const validators = {
  name: (val) => val.trim().length >= 3 && /^[a-zA-Z\s]+$/.test(val.trim()),
  email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()),
  phone: (val) => /^[6-9]\d{9}$/.test(val.trim()),
  house: (val) => val.trim().length >= 2,
  street: (val) => val.trim().length >= 3,
  city: (val) => val.trim().length >= 2,
  state: (val) => val.trim().length >= 2,
  pincode: (val) => /^\d{6}$/.test(val.trim())
};

function validateField(input, testFn) {
  const isValid = testFn(input.value);
  if (isValid) {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
  } else {
    input.classList.remove('is-valid');
    input.classList.add('is-invalid');
  }
  return isValid;
}

/**
 * Sets up live validation events and Place Order submit
 */
function initCheckoutFormValidation() {
  const fields = [
    { el: document.getElementById('cust-name'), fn: validators.name },
    { el: document.getElementById('cust-email'), fn: validators.email },
    { el: document.getElementById('cust-phone'), fn: validators.phone },
    { el: document.getElementById('addr-house'), fn: validators.house },
    { el: document.getElementById('addr-street'), fn: validators.street },
    { el: document.getElementById('addr-city'), fn: validators.city },
    { el: document.getElementById('addr-state'), fn: validators.state },
    { el: document.getElementById('addr-pincode'), fn: validators.pincode }
  ];

  // Attach live blur & input listeners
  fields.forEach(({ el, fn }) => {
    if (!el) return;

    el.addEventListener('blur', () => {
      validateField(el, fn);
    });

    el.addEventListener('input', () => {
      if (el.classList.contains('is-invalid')) {
        validateField(el, fn);
      }
    });
  });

  // Place Order button handler
  const btnPlaceOrder = document.getElementById('btn-place-order');
  if (!btnPlaceOrder) return;

  btnPlaceOrder.addEventListener('click', (e) => {
    e.preventDefault();

    // Validate all fields
    let formIsValid = true;
    let firstInvalidField = null;

    fields.forEach(({ el, fn }) => {
      if (!el) return;
      const valid = validateField(el, fn);
      if (!valid) {
        formIsValid = false;
        if (!firstInvalidField) firstInvalidField = el;
      }
    });

    if (!formIsValid) {
      if (firstInvalidField) {
        firstInvalidField.focus();
        firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      showToast('Please fill in all required fields correctly.');
      return;
    }

    // Process Order
    processOrderPlacement(btnPlaceOrder);
  });
}

/**
 * Creates Order object, clears Cart, persists to LocalStorage, and redirects
 */
function processOrderPlacement(btn) {
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing Order...';

  // 1. Gather Customer Data
  const customer = {
    name: document.getElementById('cust-name').value.trim(),
    email: document.getElementById('cust-email').value.trim(),
    phone: document.getElementById('cust-phone').value.trim(),
    address: {
      house: document.getElementById('addr-house').value.trim(),
      street: document.getElementById('addr-street').value.trim(),
      city: document.getElementById('addr-city').value.trim(),
      state: document.getElementById('addr-state').value.trim(),
      pincode: document.getElementById('addr-pincode').value.trim()
    }
  };

  // 2. Persist Customer Profile for future autofill
  localStorage.setItem('user', JSON.stringify(customer));

  // 3. Selected Payment Method
  const selectedRadio = document.querySelector('input[name="paymentMethod"]:checked');
  const paymentMethod = selectedRadio ? selectedRadio.value : 'Cash on Delivery';

  // 4. Calculate Financials
  const subtotal = checkoutCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = DELIVERY_FEE;
  const total = Math.max(0, subtotal + deliveryFee - checkoutDiscount);

  // 5. Generate Order ID (Format: FD10245)
  const orderId = 'FD' + Math.floor(10000 + Math.random() * 90000);

  // 6. Build Order Object
  const newOrder = {
    orderId: orderId,
    items: checkoutCart,
    subtotal: subtotal,
    deliveryFee: deliveryFee,
    discount: checkoutDiscount,
    total: total,
    paymentMethod: paymentMethod,
    status: 'Confirmed',
    customer: customer,
    createdAt: new Date().toISOString().split('T')[0]
  };

  // 7. Persist Order in LocalStorage
  try {
    const existingOrders = JSON.parse(localStorage.getItem('orders')) || [];
    existingOrders.unshift(newOrder); // Add as most recent order
    localStorage.setItem('orders', JSON.stringify(existingOrders));

    // Store active order ID in session for immediate confirmation & tracking
    sessionStorage.setItem('latestOrderId', orderId);

    // 8. Clear Cart & Reset Promo
    localStorage.removeItem('cart');
    sessionStorage.removeItem('appliedPromo');

    if (typeof updateCartBadge === 'function') {
      updateCartBadge();
    }

    // Redirect to Order Tracking page
    setTimeout(() => {
      window.location.href = `order-tracking.html?orderId=${orderId}`;
    }, 800);

  } catch (err) {
    console.error('Failed to create order:', err);
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-lock"></i> Place Order';
    showToast('Failed to place order. Please try again.');
  }
}

/**
 * Toast helper
 */
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <i class="fa-solid fa-circle-exclamation" style="color: #ff4757;"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-remove');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
