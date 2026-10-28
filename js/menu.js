/**
 * FoodieHub - Menu Page Logic (menu.js)
 * -------------------------------------------------------------
 * Powers the dynamic food catalog and interactive features:
 * 1. Unified Filter & Sort State Management
 * 2. Real-time Search (Name, Category, Description)
 * 3. Category Filtering (All, Pizza, Burgers, Biryani, etc.)
 * 4. Multi-criteria Sorting (Popular, Price: Low-High, Price: High-Low, Rating)
 * 5. Dynamic Card Rendering & Empty State Handling
 * 6. Add to Cart with LocalStorage & Toast Feedback
 */

// Global Filter State - The single source of truth for menu display
const filterState = {
  category: 'All',      // Selected category
  searchQuery: '',      // Active search query
  sortBy: 'popular'     // Selected sorting option
};

// Initialize once DOM content is ready
document.addEventListener('DOMContentLoaded', () => {
  initMenuPage();
});

/**
 * Initialize Menu Page Features
 */
function initMenuPage() {
  const foodGrid = document.getElementById('food-grid');
  if (!foodGrid) return;

  // 1. Parse incoming URL parameters from Homepage (e.g. ?category=Pizza or ?search=biryani)
  parseUrlParams();

  // 2. Setup interactive event listeners for search, category filter, and sorting
  initSearch();
  initCategoryFilter();
  initSorting();
  initResetButton();
  initAddToCartListener();

  // 3. Initial filter & sort render
  applyFiltersAndSort();
}

/**
 * Parses query parameters from URL and syncs them to filterState & UI inputs
 */
function parseUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const categoryParam = params.get('category');
  const searchParam = params.get('search');

  if (categoryParam) {
    // Check if category exists in our pills
    const validPill = document.querySelector(`.filter-pill[data-category="${categoryParam}"]`);
    if (validPill) {
      filterState.category = categoryParam;
      updateActiveCategoryPill(categoryParam);
    }
  }

  if (searchParam) {
    filterState.searchQuery = searchParam.trim();
    const searchInput = document.getElementById('menu-search-input');
    if (searchInput) {
      searchInput.value = searchParam;
    }
  }
}

/**
 * 1. SEARCH: Real-time search listening to input events
 */
function initSearch() {
  const searchInput = document.getElementById('menu-search-input');
  if (!searchInput) return;

  // Real-time live filtering as the user types
  searchInput.addEventListener('input', (e) => {
    filterState.searchQuery = e.target.value.trim();
    applyFiltersAndSort();
  });
}

/**
 * 2. CATEGORY FILTER: Handles category pill clicks
 */
function initCategoryFilter() {
  const filterBar = document.getElementById('category-filter-bar');
  if (!filterBar) return;

  filterBar.addEventListener('click', (e) => {
    const pill = e.target.closest('.filter-pill');
    if (!pill) return;

    const selectedCategory = pill.dataset.category || 'All';
    filterState.category = selectedCategory;

    // Update active pill UI styling
    updateActiveCategoryPill(selectedCategory);

    // Apply filters
    applyFiltersAndSort();
  });
}

/**
 * Updates active class on category pill buttons
 * @param {String} activeCategory
 */
function updateActiveCategoryPill(activeCategory) {
  const pills = document.querySelectorAll('.filter-pill');
  pills.forEach(pill => {
    if (pill.dataset.category.toLowerCase() === activeCategory.toLowerCase()) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });
}

/**
 * 3. SORTING: Handles sort dropdown change event
 */
function initSorting() {
  const sortSelect = document.getElementById('menu-sort-select');
  if (!sortSelect) return;

  sortSelect.addEventListener('change', (e) => {
    filterState.sortBy = e.target.value;
    applyFiltersAndSort();
  });
}

/**
 * 4. RESET BUTTON: Clears all active filters when no dishes are found
 */
function initResetButton() {
  const resetBtn = document.getElementById('btn-reset-filters');
  if (!resetBtn) return;

  resetBtn.addEventListener('click', () => {
    // Reset state
    filterState.category = 'All';
    filterState.searchQuery = '';
    filterState.sortBy = 'popular';

    // Reset UI controls
    const searchInput = document.getElementById('menu-search-input');
    if (searchInput) searchInput.value = '';

    const sortSelect = document.getElementById('menu-sort-select');
    if (sortSelect) sortSelect.value = 'popular';

    updateActiveCategoryPill('All');

    // Re-render
    applyFiltersAndSort();
  });
}

/**
 * 5. COORDINATOR: Filters & Sorts FOOD_ITEMS based on filterState
 */
function applyFiltersAndSort() {
  let result = [...FOOD_ITEMS];

  // Step A: Filter by Category
  if (filterState.category && filterState.category !== 'All') {
    result = result.filter(item => 
      item.category.toLowerCase() === filterState.category.toLowerCase()
    );
  }

  // Step B: Filter by Search Query (case-insensitive across name, category, description)
  if (filterState.searchQuery) {
    const query = filterState.searchQuery.toLowerCase();
    result = result.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  }

  // Step C: Apply Sorting
  switch (filterState.sortBy) {
    case 'price-low':
      // Ascending Price: ₹119 -> ₹399
      result.sort((a, b) => a.price - b.price);
      break;

    case 'price-high':
      // Descending Price: ₹399 -> ₹119
      result.sort((a, b) => b.price - a.price);
      break;

    case 'rating':
      // Descending Rating: 4.9 -> 4.5
      result.sort((a, b) => b.rating - a.rating);
      break;

    case 'popular':
    default:
      // Default: Higher rated first, followed by catalog sequence
      result.sort((a, b) => b.rating - a.rating || a.id - b.id);
      break;
  }

  // Step D: Render the resulting items to DOM
  renderFoodCards(result);
}

/**
 * Renders an array of food items into the #food-grid container dynamically
 * @param {Array} items - List of food objects to display
 */
function renderFoodCards(items) {
  const foodGrid = document.getElementById('food-grid');
  const emptyState = document.getElementById('empty-menu-state');
  const resultsCount = document.getElementById('results-count');

  if (!foodGrid) return;

  // Update item counter
  if (resultsCount) {
    resultsCount.textContent = items.length;
  }

  // Handle empty state
  if (!items || items.length === 0) {
    foodGrid.innerHTML = '';
    foodGrid.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  // Show grid and hide empty state
  foodGrid.style.display = 'grid';
  if (emptyState) emptyState.style.display = 'none';

  // Build HTML string for cards using Array.map() and join()
  const cardsHtml = items.map(item => {
    const dietClass = item.isVeg ? 'veg' : 'non-veg';
    const dietLabel = item.isVeg ? 'Vegetarian' : 'Non-Vegetarian';

    return `
      <article class="food-card" data-id="${item.id}" data-category="${item.category}">
        <!-- Media / Image Wrapper -->
        <div class="food-card-media">
          <span class="food-diet-badge ${dietClass}" title="${dietLabel}" aria-label="${dietLabel}"></span>
          <img 
            src="${item.image}" 
            alt="${item.name}" 
            class="food-card-img" 
            loading="lazy"
            onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=80';"
          >
          <div class="food-rating-badge">
            <i class="fa-solid fa-star"></i>
            <span>${item.rating.toFixed(1)}</span>
          </div>
        </div>

        <!-- Card Content Body -->
        <div class="food-card-body">
          <div class="food-card-meta">
            <span class="food-card-category">${item.category}</span>
          </div>
          <h3 class="food-card-title">${item.name}</h3>
          <p class="food-card-desc">${item.description}</p>

          <!-- Card Footer (Price & Actions) -->
          <div class="food-card-footer">
            <div class="food-card-price">
              <span>₹</span>${item.price}
            </div>
            <div class="food-card-actions">
              <a href="food-details.html?id=${item.id}" class="btn-card-details" title="View details of ${item.name}">
                Details
              </a>
              <button 
                class="btn-card-add" 
                data-id="${item.id}" 
                aria-label="Add ${item.name} to cart"
              >
                <i class="fa-solid fa-plus"></i> Add
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');

  foodGrid.innerHTML = cardsHtml;
}

/**
 * Event Delegation for "Add to Cart" button clicks
 */
function initAddToCartListener() {
  const foodGrid = document.getElementById('food-grid');
  if (!foodGrid) return;

  foodGrid.addEventListener('click', (event) => {
    const addBtn = event.target.closest('.btn-card-add');
    if (!addBtn) return;

    const foodId = parseInt(addBtn.dataset.id, 10);
    const foodItem = getFoodById(foodId);

    if (foodItem) {
      addItemToCart(foodItem);
    }
  });
}

/**
 * Adds an item to browser LocalStorage cart
 * @param {Object} item - Food item object from data.js
 */
function addItemToCart(item) {
  try {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Check if the item already exists in the cart
    const existingIndex = cart.findIndex(cartItem => cartItem.id === item.id);

    if (existingIndex > -1) {
      // Increase quantity
      cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    } else {
      // Add as new cart entry
      cart.push({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        category: item.category,
        isVeg: item.isVeg,
        quantity: 1
      });
    }

    // Save back to LocalStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update navbar badge count
    if (typeof updateCartBadge === 'function') {
      updateCartBadge();
    }

    // Show visual confirmation toast
    showToast(`Added ${item.name} to cart!`);
  } catch (error) {
    console.error('Failed to add item to cart:', error);
    showToast('Could not add item to cart. Please try again.');
  }
}

/**
 * Displays a non-intrusive toast notification at bottom right
 * @param {String} message - Text message to show
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

  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.classList.add('toast-remove');
    setTimeout(() => toast.remove(), 300);
  }, 2700);
}
