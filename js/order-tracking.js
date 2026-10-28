/**
 * FoodieHub - Order Tracking Logic (order-tracking.js)
 * -------------------------------------------------------------
 * Powers the real-time order tracking component:
 * 1. Reads 'orderId' from URL or latest session
 * 2. Fetches order details from LocalStorage
 * 3. Renders delivery address, payment method & line items
 * 4. Animates visual order stepper (Confirmed -> Preparing -> Out for Delivery -> Delivered)
 * 5. Interactive status simulation button
 */

const STAGES = [
  { step: 1, name: 'Confirmed', label: 'Order Confirmed', width: '12%' },
  { step: 2, name: 'Preparing', label: 'Food Preparing', width: '38%' },
  { step: 3, name: 'Out for Delivery', label: 'Out for Delivery', width: '65%' },
  { step: 4, name: 'Delivered', label: 'Delivered to Doorstep', width: '88%' }
];

let currentOrder = null;
let currentStageIndex = 1; // Default to 'Food Preparing'

document.addEventListener('DOMContentLoaded', () => {
  initOrderTracking();
});

function initOrderTracking() {
  const params = new URLSearchParams(window.location.search);
  let orderId = params.get('orderId') || sessionStorage.getItem('latestOrderId');

  const orders = getOrders();

  if (!orders || orders.length === 0) {
    renderNoOrderFound();
    return;
  }

  // Find targeted order or fall back to the most recent one
  currentOrder = orders.find(o => o.orderId === orderId) || orders[0];

  if (!currentOrder) {
    renderNoOrderFound();
    return;
  }

  // Populate Order Data
  renderOrderData(currentOrder);

  // Initialize Stepper Status
  initStepperStatus(currentOrder);

  // Setup simulation advance button
  initAdvanceSimulation();
}

function getOrders() {
  try {
    return JSON.parse(localStorage.getItem('orders')) || [];
  } catch (err) {
    console.error('Error reading orders from localStorage:', err);
    return [];
  }
}

/**
 * Populates receipt metadata into DOM
 */
function renderOrderData(order) {
  // Order ID
  const orderIdEl = document.getElementById('track-order-id');
  if (orderIdEl) orderIdEl.textContent = `#${order.orderId}`;

  // Customer & Address
  const addressEl = document.getElementById('track-address-content');
  if (addressEl && order.customer) {
    const cust = order.customer;
    const addr = cust.address || {};
    addressEl.innerHTML = `
      <strong>${cust.name || 'Valued Customer'}</strong> (${cust.phone || ''})<br>
      ${addr.house ? addr.house + ', ' : ''}${addr.street || ''}<br>
      ${addr.city || ''}, ${addr.state || ''} - <strong>${addr.pincode || ''}</strong>
    `;
  }

  // Payment Breakdown
  const paymentEl = document.getElementById('track-payment-content');
  if (paymentEl) {
    paymentEl.innerHTML = `
      Method: <strong>${order.paymentMethod || 'Cash on Delivery'}</strong><br>
      Items Total: ₹${order.subtotal || 0} • Delivery: ₹${order.deliveryFee || 0}<br>
      ${order.discount ? `Discount Saved: <span style="color: var(--secondary); font-weight: 700;">-₹${order.discount}</span><br>` : ''}
      Total Paid: <strong style="font-size: 1.1rem; color: var(--primary);">₹${order.total || 0}</strong>
    `;
  }

  // Items List
  const itemsListEl = document.getElementById('track-items-list');
  if (itemsListEl && order.items) {
    itemsListEl.innerHTML = order.items.map(item => `
      <div class="tracking-item-row">
        <div class="tracking-item-left">
          <img src="${item.image}" alt="${item.name}" class="tracking-item-img">
          <div>
            <strong>${item.name}</strong>
            <small style="display: block; color: var(--text-muted);">Qty: ${item.quantity} × ₹${item.price}</small>
          </div>
        </div>
        <div style="font-weight: 700; color: var(--text-main);">
          ₹${item.price * item.quantity}
        </div>
      </div>
    `).join('');
  }
}

/**
 * Initializes visual stepper status from order status
 */
function initStepperStatus(order) {
  const statusStr = (order.status || '').toLowerCase();

  if (statusStr.includes('delivered')) {
    currentStageIndex = 3;
  } else if (statusStr.includes('out')) {
    currentStageIndex = 2;
  } else if (statusStr.includes('prepar')) {
    currentStageIndex = 1;
  } else {
    currentStageIndex = 0;
  }

  updateStepperUI(currentStageIndex);
}

/**
 * Updates DOM node states and progress bar width
 */
function updateStepperUI(index) {
  const currentStage = STAGES[index];
  const progressFill = document.getElementById('stepper-progress-fill');
  const statusLabel = document.getElementById('tracker-status-label');

  if (progressFill) progressFill.style.width = currentStage.width;
  if (statusLabel) statusLabel.textContent = currentStage.label;

  // Update nodes 1 through 4
  for (let i = 1; i <= 4; i++) {
    const node = document.getElementById(`step-node-${i}`);
    if (!node) continue;

    node.classList.remove('active', 'completed');

    if (i < index + 1) {
      node.classList.add('completed');
    } else if (i === index + 1) {
      node.classList.add('active');
    }
  }
}

/**
 * Allows user to cycle status stages to simulate live delivery progress
 */
function initAdvanceSimulation() {
  const btn = document.getElementById('btn-advance-status');
  if (!btn) return;

  btn.addEventListener('click', () => {
    // Cycle to next stage
    currentStageIndex = (currentStageIndex + 1) % STAGES.length;
    const stage = STAGES[currentStageIndex];

    updateStepperUI(currentStageIndex);

    // Update in LocalStorage
    if (currentOrder) {
      currentOrder.status = stage.name;
      const orders = getOrders();
      const idx = orders.findIndex(o => o.orderId === currentOrder.orderId);
      if (idx > -1) {
        orders[idx].status = stage.name;
        localStorage.setItem('orders', JSON.stringify(orders));
      }
    }

    showToast(`Order status updated to: ${stage.label}`);
  });
}

function renderNoOrderFound() {
  const container = document.getElementById('tracking-main-content');
  if (!container) return;

  container.innerHTML = `
    <div style="text-align: center; padding: 5rem 1.5rem; background: var(--bg-surface); border: 1px dashed var(--border-color); border-radius: var(--radius-lg);">
      <i class="fa-solid fa-receipt" style="font-size: 3.5rem; color: var(--text-light); margin-bottom: 1.5rem;"></i>
      <h2 style="font-family: var(--font-heading); font-size: 1.8rem; margin-bottom: 0.5rem; color: var(--text-main);">No Order Found</h2>
      <p style="color: var(--text-muted); font-size: 1rem; max-width: 420px; margin: 0 auto 2rem auto;">
        You don't have any recent orders to track. Place an order from our chef's menu to track delivery in real time!
      </p>
      <a href="menu.html" class="btn btn-primary">
        <i class="fa-solid fa-utensils"></i> Browse Menu
      </a>
    </div>
  `;
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <i class="fa-solid fa-circle-check" style="color: var(--secondary);"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-remove');
    setTimeout(() => toast.remove(), 300);
  }, 2700);
}
