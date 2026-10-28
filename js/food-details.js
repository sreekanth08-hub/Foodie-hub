/**
 * FoodieHub - Food Details Logic (food-details.js)
 * -------------------------------------------------------------
 * Powers the single dish view:
 * 1. Reads 'id' query parameter from URL
 * 2. Fetches item details from data.js
 * 3. Handles quantity selector (+ / -)
 * 4. Multi-quantity Add to Cart with LocalStorage persistence
 * 5. Dynamic related dishes recommendation engine
 */

// Active state for this page
let currentDish = null;
let currentQuantity = 1;

// Run on page load
document.addEventListener('DOMContentLoaded', () => {
  initFoodDetailsPage();
});

/**
 * Main initialization function
 */
function initFoodDetailsPage() {
  const params = new URLSearchParams(window.location.search);
  const foodId = parseInt(params.get('id'), 10);

  if (!foodId || isNaN(foodId)) {
    renderNotFound();
    return;
  }

  // Lookup dish from FOOD_ITEMS array in data.js
  currentDish = getFoodById(foodId);

  if (!currentDish) {
    renderNotFound();
    return;
  }

  // Dish found! Render page content
  updatePageMeta(currentDish);
  renderDetails(currentDish);
  initQuantityControls();
  initDetailsAddToCart();
  renderRelatedDishes(currentDish);
}

/**
 * Updates document title and breadcrumb navigation
 */
function updatePageMeta(dish) {
  document.title = `${dish.name} | FoodieHub`;
  const breadcrumbTitle = document.getElementById('breadcrumb-title');
  if (breadcrumbTitle) {
    breadcrumbTitle.textContent = dish.name;
  }
}

/**
 * Renders the full dish details card into #food-details-container
 */
function renderDetails(dish) {
  const container = document.getElementById('food-details-container');
  if (!container) return;

  const dietClass = dish.isVeg ? 'veg' : 'non-veg';
  const dietLabel = dish.isVeg ? 'Vegetarian' : 'Non-Vegetarian';

  container.innerHTML = `
    <div class="details-wrapper">
      <!-- Left Column: Media -->
      <div class="details-media">
        <span class="details-diet-badge ${dietClass}" title="${dietLabel}" aria-label="${dietLabel}"></span>
        <img 
          src="${dish.image}" 
          alt="${dish.name}" 
          class="details-img"
          onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=80';"
        >
      </div>

      <!-- Right Column: Content & Controls -->
      <div class="details-content">
        <div class="details-header-meta">
          <span class="details-category-tag">${dish.category}</span>
          <div class="details-rating">
            <i class="fa-solid fa-star"></i>
            <span>${dish.rating.toFixed(1)} / 5.0</span>
          </div>
        </div>

        <h1 class="details-title">${dish.name}</h1>

        <div class="details-price-row">
          <div class="details-price">
            <span>₹</span>${dish.price}
          </div>
          <span class="details-taxes">(Inclusive of all taxes)</span>
        </div>

        <p class="details-description">${dish.description}</p>

        <!-- Culinary Highlights -->
        <div class="details-highlights">
          <div class="highlight-item">
            <i class="fa-solid fa-clock"></i>
            <span class="highlight-label">Prep Time</span>
            <span class="highlight-value">25–30 Mins</span>
          </div>
          <div class="highlight-item">
            <i class="fa-solid fa-bowl-food"></i>
            <span class="highlight-label">Serves</span>
            <span class="highlight-value">1–2 Persons</span>
          </div>
          <div class="highlight-item">
            <i class="fa-solid fa-leaf"></i>
            <span class="highlight-label">Quality</span>
            <span class="highlight-value">100% Fresh</span>
          </div>
        </div>

        <!-- Quantity & Add to Cart Controls -->
        <div class="details-actions-row">
          <div class="quantity-control" aria-label="Select quantity">
            <button class="qty-btn" id="btn-qty-decrease" aria-label="Decrease quantity" disabled>
              <i class="fa-solid fa-minus"></i>
            </button>
            <span class="qty-display" id="qty-display">1</span>
            <button class="qty-btn" id="btn-qty-increase" aria-label="Increase quantity">
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>

          <button class="btn-details-add" id="btn-details-add">
            <i class="fa-solid fa-bag-shopping"></i> Add to Cart (₹<span id="btn-total-price">${dish.price}</span>)
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Sets up quantity increment and decrement event handlers
 */
function initQuantityControls() {
  const btnDecrease = document.getElementById('btn-qty-decrease');
  const btnIncrease = document.getElementById('btn-qty-increase');
  const qtyDisplay = document.getElementById('qty-display');
  const btnTotalPrice = document.getElementById('btn-total-price');

  if (!btnDecrease || !btnIncrease || !qtyDisplay) return;

  function updateQtyUI() {
    qtyDisplay.textContent = currentQuantity;
    btnDecrease.disabled = currentQuantity <= 1;
    btnIncrease.disabled = currentQuantity >= 20;

    if (btnTotalPrice && currentDish) {
      btnTotalPrice.textContent = currentDish.price * currentQuantity;
    }
  }

  btnDecrease.addEventListener('click', () => {
    if (currentQuantity > 1) {
      currentQuantity--;
      updateQtyUI();
    }
  });

  btnIncrease.addEventListener('click', () => {
    if (currentQuantity < 20) {
      currentQuantity++;
      updateQtyUI();
    }
  });
}

/**
 * Handles adding current dish with selected quantity to LocalStorage cart
 */
function initDetailsAddToCart() {
  const addBtn = document.getElementById('btn-details-add');
  if (!addBtn) return;

  addBtn.addEventListener('click', () => {
    if (!currentDish) return;

    try {
      let cart = JSON.parse(localStorage.getItem('cart')) || [];
      const existingIndex = cart.findIndex(item => item.id === currentDish.id);

      if (existingIndex > -1) {
        // Increase existing quantity by selected quantity
        cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + currentQuantity;
      } else {
        // Add new dish entry
        cart.push({
          id: currentDish.id,
          name: currentDish.name,
          price: currentDish.price,
          image: currentDish.image,
          category: currentDish.category,
          isVeg: currentDish.isVeg,
          quantity: currentQuantity
        });
      }

      // Save back to LocalStorage
      localStorage.setItem('cart', JSON.stringify(cart));

      // Refresh navbar cart counter
      if (typeof updateCartBadge === 'function') {
        updateCartBadge();
      }

      // Show confirmation toast
      showToast(`Added ${currentQuantity} × ${currentDish.name} to cart!`);

      // Reset quantity back to 1
      currentQuantity = 1;
      const qtyDisplay = document.getElementById('qty-display');
      const btnDecrease = document.getElementById('btn-qty-decrease');
      const btnTotalPrice = document.getElementById('btn-total-price');
      if (qtyDisplay) qtyDisplay.textContent = '1';
      if (btnDecrease) btnDecrease.disabled = true;
      if (btnTotalPrice) btnTotalPrice.textContent = currentDish.price;

    } catch (err) {
      console.error('Error adding to cart from details page:', err);
      showToast('Could not add dish to cart. Please try again.');
    }
  });
}

/**
 * Renders 3 related recommendations from the same category
 */
function renderRelatedDishes(dish) {
  const relatedGrid = document.getElementById('related-food-grid');
  if (!relatedGrid) return;

  // Filter items in the same category excluding the current dish
  let related = FOOD_ITEMS.filter(
    item => item.category === dish.category && item.id !== dish.id
  );

  // If less than 3, pick other top-rated dishes
  if (related.length < 3) {
    const additional = FOOD_ITEMS.filter(
      item => item.id !== dish.id && !related.some(r => r.id === item.id)
    ).slice(0, 3 - related.length);
    related = [...related, ...additional];
  }

  // Take top 3
  const recommendations = related.slice(0, 3);

  const cardsHtml = recommendations.map(item => {
    const dietClass = item.isVeg ? 'veg' : 'non-veg';
    const dietLabel = item.isVeg ? 'Vegetarian' : 'Non-Vegetarian';

    return `
      <article class="food-card" data-id="${item.id}">
        <div class="food-card-media">
          <span class="food-diet-badge ${dietClass}" title="${dietLabel}"></span>
          <img src="${item.image}" alt="${item.name}" class="food-card-img" loading="lazy">
          <div class="food-rating-badge">
            <i class="fa-solid fa-star"></i>
            <span>${item.rating.toFixed(1)}</span>
          </div>
        </div>
        <div class="food-card-body">
          <div class="food-card-meta">
            <span class="food-card-category">${item.category}</span>
          </div>
          <h3 class="food-card-title">${item.name}</h3>
          <p class="food-card-desc">${item.description}</p>
          <div class="food-card-footer">
            <div class="food-card-price"><span>₹</span>${item.price}</div>
            <div class="food-card-actions">
              <a href="food-details.html?id=${item.id}" class="btn-card-details">Details</a>
              <button class="btn-card-add" data-id="${item.id}">
                <i class="fa-solid fa-plus"></i> Add
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');

  relatedGrid.innerHTML = cardsHtml;

  // Event delegation on related grid
  relatedGrid.addEventListener('click', (e) => {
    const addBtn = e.target.closest('.btn-card-add');
    if (!addBtn) return;

    const relId = parseInt(addBtn.dataset.id, 10);
    const relDish = getFoodById(relId);
    if (!relDish) return;

    try {
      let cart = JSON.parse(localStorage.getItem('cart')) || [];
      const idx = cart.findIndex(c => c.id === relDish.id);
      if (idx > -1) {
        cart[idx].quantity = (cart[idx].quantity || 1) + 1;
      } else {
        cart.push({
          id: relDish.id,
          name: relDish.name,
          price: relDish.price,
          image: relDish.image,
          category: relDish.category,
          isVeg: relDish.isVeg,
          quantity: 1
        });
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      if (typeof updateCartBadge === 'function') updateCartBadge();
      showToast(`Added ${relDish.name} to cart!`);
    } catch (err) {
      console.error(err);
    }
  });
}

/**
 * Renders Error State when dish ID is missing or invalid
 */
function renderNotFound() {
  const container = document.getElementById('food-details-container');
  const relatedSection = document.getElementById('related-section');
  if (relatedSection) relatedSection.style.display = 'none';

  if (!container) return;

  container.innerHTML = `
    <div style="text-align: center; padding: 4.5rem 1.5rem; background: var(--bg-surface); border: 1px dashed var(--border-color); border-radius: var(--radius-lg); max-width: 600px; margin: 2rem auto;">
      <i class="fa-solid fa-triangle-exclamation" style="font-size: 3.5rem; color: var(--accent-orange); margin-bottom: 1rem;"></i>
      <h2 style="font-family: var(--font-heading); font-size: 1.8rem; margin-bottom: 0.5rem; color: var(--text-main);">Dish Not Found</h2>
      <p style="color: var(--text-muted); font-size: 1rem; margin-bottom: 2rem; line-height: 1.6;">
        The dish you are looking for might have been removed or the URL link is invalid. Explore our extensive menu to discover more mouth-watering delicacies!
      </p>
      <a href="menu.html" class="btn btn-primary">
        <i class="fa-solid fa-utensils"></i> Browse Full Menu
      </a>
    </div>
  `;
}

/**
 * Toast notification helper
 */
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
