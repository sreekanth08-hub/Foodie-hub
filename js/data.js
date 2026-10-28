/**
 * FoodieHub - Food Database (data.js)
 * -------------------------------------------------------------
 * Central data source containing the catalog of food items.
 * Each item has:
 * - id: unique numeric identifier
 * - name: dish name
 * - category: category string matching our filters
 * - price: price in INR (₹)
 * - rating: customer review score out of 5
 * - image: high-resolution culinary photography
 * - description: mouth-watering description
 * - isVeg: boolean flag (true = Vegetarian, false = Non-Vegetarian)
 */

const FOOD_ITEMS = [
  // --- PIZZA ---
  {
    id: 1,
    name: "Margherita Basil Pizza",
    category: "Pizza",
    price: 299,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=700&q=80",
    description: "Classic Italian pizza topped with San Marzano tomato sauce, fresh mozzarella cheese, and fragrant basil leaves.",
    isVeg: true
  },
  {
    id: 2,
    name: "Spicy Pepperoni Feast",
    category: "Pizza",
    price: 399,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=700&q=80",
    description: "Loaded with smoky pepperoni slices, mozzarella, chili flakes, and a crispy wood-fired crust.",
    isVeg: false
  },
  {
    id: 3,
    name: "Paneer Tikka Pizza",
    category: "Pizza",
    price: 349,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80",
    description: "Tandoori spiced paneer cubes, crunchy bell peppers, onions, and melted cheese on a hand-stretched crust.",
    isVeg: true
  },

  // --- BURGERS ---
  {
    id: 4,
    name: "Crispy Double Cheeseburger",
    category: "Burgers",
    price: 249,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80",
    description: "Double grilled beef-style patty with melted cheddar cheese, pickles, crisp lettuce, and signature secret sauce.",
    isVeg: false
  },
  {
    id: 5,
    name: "Spicy Crispy Veg Burger",
    category: "Burgers",
    price: 179,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=700&q=80",
    description: "Golden crumbed vegetable patty loaded with peri-peri mayonnaise, crisp onions, and juicy tomatoes.",
    isVeg: true
  },
  {
    id: 6,
    name: "Smoky BBQ Chicken Burger",
    category: "Burgers",
    price: 269,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=700&q=80",
    description: "Succulent grilled chicken breast glazed with hickory BBQ sauce, topped with caramelized onions and cheese.",
    isVeg: false
  },

  // --- BIRYANI ---
  {
    id: 7,
    name: "Hyderabadi Chicken Biryani",
    category: "Biryani",
    price: 299,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=700&q=80",
    description: "Slow-cooked authentic Dum biryani made with long-grain basmati rice, tender chicken pieces, saffron, and aromatic spices.",
    isVeg: false
  },
  {
    id: 8,
    name: "Royal Mutton Dum Biryani",
    category: "Biryani",
    price: 389,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=700&q=80",
    description: "Melt-in-mouth marinated mutton chunks layered with fragrant aged basmati rice, served with rich salan and raita.",
    isVeg: false
  },
  {
    id: 9,
    name: "Shahi Paneer Dum Biryani",
    category: "Biryani",
    price: 259,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1642821373181-696a54913e9a?auto=format&fit=crop&w=700&q=80",
    description: "Rich fragrant basmati rice layered with spiced cottage cheese cubes, caramelized fried onions, and saffron milk.",
    isVeg: true
  },

  // --- CHICKEN ---
  {
    id: 10,
    name: "Butter Chicken with Butter Naan",
    category: "Chicken",
    price: 329,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=700&q=80",
    description: "Tender tandoori chicken simmered in a velvety, buttery tomato gravy enriched with fresh cream and fenugreek.",
    isVeg: false
  },
  {
    id: 11,
    name: "Spicy Crispy Fried Wings",
    category: "Chicken",
    price: 239,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=700&q=80",
    description: "6 pieces of crunchy golden fried chicken wings tossed in hot garlic glaze with dipping ranch sauce.",
    isVeg: false
  },
  {
    id: 12,
    name: "Tandoori Chicken Platter",
    category: "Chicken",
    price: 349,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=700&q=80",
    description: "Juicy bone-in chicken marinated in spiced yogurt and roasted in a traditional clay oven with mint chutney.",
    isVeg: false
  },

  // --- NOODLES ---
  {
    id: 13,
    name: "Schezwan Veg Hakka Noodles",
    category: "Noodles",
    price: 199,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=700&q=80",
    description: "Wok-tossed noodles with shredded cabbage, bell peppers, carrots, and spicy fiery Schezwan chili sauce.",
    isVeg: true
  },
  {
    id: 14,
    name: "Chicken Garlic Chowmein",
    category: "Noodles",
    price: 229,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=700&q=80",
    description: "Stir-fried noodles with seasoned chicken strips, spring onions, toasted garlic, and dark soy glaze.",
    isVeg: false
  },

  // --- DESSERTS ---
  {
    id: 15,
    name: "Molten Chocolate Lava Cake",
    category: "Desserts",
    price: 169,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=700&q=80",
    description: "Warm chocolate cake with a rich molten chocolate center, served with chocolate drizzle.",
    isVeg: true
  },
  {
    id: 16,
    name: "Gulab Jamun (2 Pcs) with Rabdi",
    category: "Desserts",
    price: 129,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=700&q=80",
    description: "Deep fried khoya dumplings soaked in fragrant cardamom rose syrup, paired with thickened rabdi.",
    isVeg: true
  },

  // --- DRINKS ---
  {
    id: 17,
    name: "Fresh Mango Alphonso Shake",
    category: "Drinks",
    price: 139,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=700&q=80",
    description: "Thick and luscious shake prepared with authentic Alphonso mango pulp and chilled creamy milk.",
    isVeg: true
  },
  {
    id: 18,
    name: "Classic Mint Mojito",
    category: "Drinks",
    price: 119,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=700&q=80",
    description: "Refreshing fizzy mocktail blended with freshly crushed garden mint, zesty lime wedges, and sparkling soda.",
    isVeg: true
  }
];

// Helper function to find a food item by ID
function getFoodById(id) {
  const numericId = Number(id);
  return FOOD_ITEMS.find(item => item.id === numericId) || null;
}
