/**
 * FoodieHub - Order History Logic (orders.js)
 * -------------------------------------------------------------
 * Powers the customer orders page:
 * 1. Loads orders history from browser LocalStorage
 * 2. Renders empty state if no prior orders exist
 * 3. Dynamically generates order cards with status badges and line items
 * 4. Enables quick order tracking navigation & "Order Again" reorder functionality
 */

document.addEventListener('DOMContentLoaded', () => {
  renderOrderHistory();
});

function getOrders() {
  try {
    return JSON.parse(localStorage.getItem('orders')) || [];
  } catch (err) {
    console.error('Error parsing orders:', err);
    return [];
  }
}

function renderOrderHistory() {
  const container = document.getElementById('orders-list-container');
  const emptyState = document.getElementById('orders-empty-state');
  if (!container || !emptyState) return;

  const orders = getOrders();

  if (!orders || orders.length === 0) {
    container.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  container.style.display = 'flex';
  emptyState.style.display = 'none';

  container.innerHTML = orders.map(order => {
    // Determine status badge class
    const status = order.status || 'Confirmed';
    let statusClass = 'confirmed';
    let statusIcon = 'fa-receipt';

    if (status.toLowerCase().includes('deliver')) {
      statusClass = 'delivered';
      statusIcon = 'fa-circle-check';
    } else if (status.toLowerCase().includes('out')) {
      statusClass = 'out';
      statusIcon = 'fa-motorcycle';
    } else if (status.toLowerCase().includes('prepar')) {
      statusClass = 'preparing';
      statusIcon = 'fa-kitchen-set';
    }

    // Build items snippet
    const itemsHtml = (order.items || []).map(item => `
      <div class="order-item-snippet">
        <div class="order-item-snippet-left">
          <img 
            src="${item.image}" 
            alt="${item.name}" 
            class="order-thumb-mini"
            onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80';"
          >
          <div>
            <strong>${item.name}</strong> × ${item.quantity}
          </div>
        </div>
        <div style="font-weight: 700; color: var(--text-main);">
          ₹${item.price * item.quantity}
        </div>
      </div>
    `).join('');

    return `
      <article class="order-card" data-order-id="${order.orderId}">
        <!-- Header -->
        <div class="order-card-header">
          <div class="order-id-group">
            <span class="order-id-tag">#${order.orderId}</span>
            <span class="order-date"><i class="fa-regular fa-calendar"></i> ${order.createdAt || 'Recent'}</span>
          </div>
          <span class="order-status-badge ${statusClass}">
            <i class="fa-solid ${statusIcon}"></i> ${status}
          </span>
        </div>

        <!-- Body -->
        <div class="order-card-body">
          <div class="order-items-summary">
            ${itemsHtml}
          </div>

          <!-- Footer -->
          <div class="order-card-footer">
            <div class="order-total-price">
              <small>Total Paid: </small>₹${order.total}
            </div>
            <div class="order-card-actions">
              <a href="order-tracking.html?orderId=${order.orderId}" class="btn btn-secondary" style="font-size: 0.88rem; padding: 0.55rem 1.1rem;">
                <i class="fa-solid fa-location-crosshairs"></i> Track Order
              </a>
              <button class="btn btn-primary btn-reorder" data-order-id="${order.orderId}" style="font-size: 0.88rem; padding: 0.55rem 1.1rem;">
                <i class="fa-solid fa-rotate-right"></i> Order Again
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Attach Reorder Event Delegation
  initReorderEvents();
}

/**
 * Handles "Order Again" button click:
 * Clones the order's items back into active Cart and navigates to cart.html
 */
function initReorderEvents() {
  const container = document.getElementById('orders-list-container');
  if (!container) return;

  container.addEventListener('click', (e) => {
    const reorderBtn = e.target.closest('.btn-reorder');
    if (!reorderBtn) return;

    const orderId = reorderBtn.dataset.orderId;
    const orders = getOrders();
    const targetedOrder = orders.find(o => o.orderId === orderId);

    if (!targetedOrder || !targetedOrder.items) return;

    try {
      // Set order items to current cart
      localStorage.setItem('cart', JSON.stringify(targetedOrder.items));
      if (typeof updateCartBadge === 'function') {
        updateCartBadge();
      }

      showToast(`Items from #${orderId} added to cart! Redirecting...`);

      setTimeout(() => {
        window.location.href = 'cart.html';
      }, 700);
    } catch (err) {
      console.error('Error reordering items:', err);
    }
  });
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
