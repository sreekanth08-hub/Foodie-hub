# 🍕 FoodieHub — Restaurant Food Ordering Web Application

> A modern, responsive, and data-driven food ordering web application built from scratch with semantic **HTML5**, modern **CSS3**, and **Vanilla JavaScript** (ES6+), backed by browser **LocalStorage**.

---

## 🚀 Live Demo & Page Architecture

FoodieHub is built with a modular, multi-page frontend architecture designed for clean separation of concerns and an easy future migration path to **React.js**:

| Page | File | Description |
| :--- | :--- | :--- |
| **Homepage** | [`index.html`](index.html) | Brand landing page, hero section with quick search, popular categories, and promotional banners. |
| **Menu Catalog** | [`menu.html`](menu.html) | Dynamic food catalog with real-time keyword search, category pill tabs, and multi-criteria sorting. |
| **Food Details** | [`food-details.html`](food-details.html) | Single dish view, dietary indicators, quantity selection counters, and related dish recommendations. |
| **Shopping Cart** | [`cart.html`](cart.html) | Cart manager, inline quantity increment/decrement, item removal, promo code engine (`FOODIE50`), and pricing summary. |
| **Checkout** | [`checkout.html`](checkout.html) | Customer profile & delivery address form, regex-backed live field validation, and payment method selector. |
| **Order Tracking** | [`order-tracking.html`](order-tracking.html) | Order confirmation banner, receipt breakdown, and interactive visual delivery progress stepper. |
| **Order History** | [`orders.html`](orders.html) | Archived transaction history loaded from LocalStorage with live status badges and 1-click reorder capability. |

---

## 🛠️ Technology Stack

- **Markup**: Semantic HTML5 (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`) with high accessibility (ARIA labels).
- **Styling**: Vanilla CSS3 featuring:
  - Centralized design tokens and custom properties (`:root`)
  - CSS Flexbox (1D layouts) & CSS Grid (2D layouts)
  - Glassmorphic backdrops, smooth micro-animations, and responsive media queries
- **Logic**: Vanilla JavaScript (ES6+):
  - DOM Manipulation & Event Delegation
  - Array Methods (`filter()`, `map()`, `reduce()`, `find()`, `findIndex()`, `sort()`)
  - Browser APIs (`URLSearchParams`, `localStorage`, `sessionStorage`, `History API`)
  - Regular Expression Form Validation
- **Typography & Icons**: Google Fonts (*Outfit* & *Plus Jakarta Sans*) + Font Awesome 6.

---

## 📂 Project Structure

```text
Foodie_Hub/
│
├── index.html               # Homepage & brand showcase
├── menu.html                # Dynamic food catalog
├── food-details.html        # Dish details & quantity controls
├── cart.html                # Cart management & price calculation
├── checkout.html            # Address form & payment method
├── order-tracking.html      # Confirmation & visual order tracker
├── orders.html              # Past orders & 1-click reorder
│
├── css/
│   ├── style.css            # Global design tokens, typography, hero & footer
│   ├── navbar.css           # Sticky glassmorphic navbar & mobile drawer
│   ├── food-card.css        # Food card design & toast notifications
│   ├── menu.css             # Toolbar search, category tabs & sort dropdown
│   ├── food-details.css     # Product view, highlights & breadcrumbs
│   ├── cart.css             # Cart layout, quantity buttons & order summary
│   ├── checkout.css         # Form controls, validation feedback & payment selector
│   ├── order-tracking.css   # Stepper progress track & confirmation card
│   ├── orders.css           # Order history cards & status pills
│   └── responsive.css       # Breakpoints for mobile, tablet, and desktop
│
├── js/
│   ├── data.js              # Catalog database (18 items across 7 categories)
│   ├── app.js               # Global navbar scroll, mobile menu & badge sync
│   ├── menu.js              # FilterState, search, filtering & sorting engine
│   ├── food-details.js      # Single item parser, quantity state & recommendations
│   ├── cart.js              # Cart calculations, promo validation & storage sync
│   ├── checkout.js          # Regex form validators & order creator
│   ├── order-tracking.js    # Live stepper animation & progress simulation
│   └── orders.js            # History renderer & reorder routine
│
└── README.md
```

---

## ⚡ How to Run Locally

1. Clone or download the repository to your computer:
   ```bash
   git clone https://github.com/your-username/foodie-hub.git
   cd foodie-hub
   ```
2. Open [`index.html`](index.html) in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).
3. Alternatively, run using **Live Server** extension in VS Code.

---

## 🎯 Key Application Features

1. **Reactive Cart Engine**:
   - Persists state across tabs and browser restarts via `localStorage`.
   - Navbar shopping bag badge updates reactively across all pages.
2. **Unified Search & Filter Pipeline**:
   - Filters by category, searches across dish names and ingredients in real-time, and sorts by price or rating without overwriting active criteria.
3. **Interactive Visual Order Tracker**:
   - 4-stage progression (`Order Confirmed` ➔ `Food Preparing` ➔ `Out for Delivery` ➔ `Delivered`).
   - Includes an interactive **"Simulate Next Stage"** button to advance stages on demand.
4. **Promo Code Engine**:
   - Type coupon `FOODIE50` in the cart to receive flat ₹50 OFF on orders above ₹199.
5. **Autofill Profile**:
   - Saves delivery details into LocalStorage on initial order and automatically pre-populates the checkout form for future meals.

---

## 🎓 Learning Takeaways & Migration to React

| Vanilla JS Pattern Used | Future React Equivalent |
| :--- | :--- |
| `items.map(...).join('')` | `{items.map(item => <FoodCard key={item.id} {...item} />)}` |
| `filterState = { ... }` | `const [filters, setFilters] = useState(...)` |
| `localStorage.getItem('cart')` | `useContext(CartContext)` + `useLocalStorage` hook |
| `new URLSearchParams(window.location.search)` | `const { id } = useParams()` / `useSearchParams()` |
| Event Delegation on `#food-grid` | Synthetic event handlers (`onClick={() => addToCart(item)}`) |

---

## 📄 License
Crafted with passion for frontend mastery and food lovers everywhere. © 2026 FoodieHub.
