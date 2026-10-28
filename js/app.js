/**
 * FoodieHub - Main Application Logic (app.js)
 * -------------------------------------------------------------
 * This script powers global homepage behaviors:
 * 1. Sticky navbar styling on scroll
 * 2. Mobile navigation toggle & backdrop handling
 * 3. Shopping cart badge counter synchronized with localStorage
 * 4. Hero search bar validation and query redirection
 * 5. Quick search tag clicks
 */

// Run when the DOM content is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initMobileNav();
  updateCartBadge();
  initHeroSearch();
});

/**
 * 1. Sticky Navbar on Scroll
 * Adds a '.scrolled' class when the user scrolls down past 50 pixels.
 */
function initNavbarScroll() {
  const header = document.getElementById('header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

/**
 * 2. Mobile Navigation Toggle & Accessibility
 * Handles opening/closing mobile menu drawer, backdrop overlay,
 * aria-expanded attributes, and closing when Escape key is pressed.
 */
function initMobileNav() {
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navBackdrop = document.getElementById('nav-backdrop');

  if (!navToggle || !navMenu) return;

  function toggleMenu(isOpen) {
    const shouldOpen = typeof isOpen === 'boolean' ? isOpen : !navMenu.classList.contains('nav-menu-open');
    navMenu.classList.toggle('nav-menu-open', shouldOpen);

    if (navBackdrop) {
      navBackdrop.classList.toggle('active', shouldOpen);
    }

    navToggle.setAttribute('aria-expanded', String(shouldOpen));
    navToggle.innerHTML = shouldOpen 
      ? '<i class="fa-solid fa-xmark"></i>' 
      : '<i class="fa-solid fa-bars"></i>';
    
    // Prevent background scrolling when mobile drawer is open
    document.body.style.overflow = shouldOpen ? 'hidden' : '';
  }

  // Toggle button click
  navToggle.addEventListener('click', () => toggleMenu());

  // Clicking backdrop closes menu
  if (navBackdrop) {
    navBackdrop.addEventListener('click', () => toggleMenu(false));
  }

  // Close menu when clicking any nav link
  const navLinks = navMenu.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Close menu with Escape key (Keyboard Accessibility)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('nav-menu-open')) {
      toggleMenu(false);
    }
  });
}

/**
 * 3. Cart Badge Synchronization
 * Reads 'cart' from browser LocalStorage and counts total items.
 * If empty or invalid, displays '0'.
 */
function updateCartBadge() {
  const cartBadge = document.getElementById('cart-count');
  if (!cartBadge) return;

  try {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    // Calculate total quantity across all items in cart
    const totalQuantity = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    cartBadge.textContent = totalQuantity;

    // Small pop animation if there are items
    if (totalQuantity > 0) {
      cartBadge.classList.add('badge-pop');
      setTimeout(() => cartBadge.classList.remove('badge-pop'), 300);
    }
  } catch (err) {
    console.error('Error loading cart count from localStorage:', err);
    cartBadge.textContent = '0';
  }
}

/**
 * 4. Hero Search Bar & Quick Tags Handler
 * Validates search input and redirects to menu.html?search=<query>
 */
function initHeroSearch() {
  const searchForm = document.getElementById('hero-search-form');
  const searchInput = document.getElementById('hero-search-input');

  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = searchInput.value.trim();

      if (!query) {
        // Simple shake feedback if input is empty
        searchInput.focus();
        searchInput.classList.add('input-error');
        setTimeout(() => searchInput.classList.remove('input-error'), 800);
        return;
      }

      // Cleanly navigate to menu page with encoded query parameter
      window.location.href = `menu.html?search=${encodeURIComponent(query)}`;
    });
  }

  // Quick Trending Search Tags
  const searchTags = document.querySelectorAll('.trending-tag');
  searchTags.forEach(tag => {
    tag.addEventListener('click', (e) => {
      e.preventDefault();
      const searchTerm = tag.getAttribute('data-search') || tag.textContent.trim();
      window.location.href = `menu.html?search=${encodeURIComponent(searchTerm)}`;
    });
  });
}
