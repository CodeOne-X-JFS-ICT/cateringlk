"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Product {
  id: string;
  category: "fried-rice" | "kottu" | "noodles" | "pizza" | "special";
  name: string;
  desc: string;
  price: number;
  portion: string;
  img: string;
}

export interface CartItem extends Product {
  qty: number;
}

export type OrderType = "takeaway" | "delivery";

interface OrderContextType {
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  verifiedLocation: string;
  setVerifiedLocation: (location: string) => void;
  isLocationVerified: boolean;
  setIsLocationVerified: (verified: boolean) => void;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  updateQty: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  toggleCartDrawer: () => void;
  cartTotalCount: number;
  cartSubtotal: number;
}

const productCatalog: Product[] = [
  /* 1. Fried Rice Range */
  {
    id: "fr1",
    category: "fried-rice",
    name: "Seafood Special Fried Rice",
    desc: "Wok-tossed basmati rice with prawns, cuttlefish, egg, and spring onions.",
    price: 1450,
    portion: "Serves 1-2",
    img: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "fr2",
    category: "fried-rice",
    name: "Roast Chicken Fried Rice",
    desc: "Fragrant fried rice served with spiced quarter roast chicken and chilli paste.",
    price: 1250,
    portion: "Serves 1",
    img: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "fr3",
    category: "fried-rice",
    name: "Mixed Special Fried Rice",
    desc: "Chicken, Pork, Prawns, and Egg tossed in signature dark soy sauce.",
    price: 1650,
    portion: "Serves 1-2",
    img: "https://images.unsplash.com/photo-1596560548464-f010549b84d7?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "fr4",
    category: "fried-rice",
    name: "Nasi Goreng Supreme",
    desc: "Indonesian fried rice topped with fried egg, chicken satay skewer, and prawn crackers.",
    price: 1750,
    portion: "Chef Special",
    img: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=500&q=80",
  },

  /* 2. Kottu Range */
  {
    id: "kt1",
    category: "kottu",
    name: "Roast Chicken Cheese Kottu",
    desc: "Chopped Godamba roti with roast chicken, veggies, and melted cheddar cheese.",
    price: 1550,
    portion: "Popular",
    img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "kt2",
    category: "kottu",
    name: "Special Dolphin Kottu",
    desc: "Cube-cut roti cooked in spicy chicken gravy with capsicum and melted cheese.",
    price: 1450,
    portion: "Serves 1-2",
    img: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "kt3",
    category: "kottu",
    name: "Seafood Kottu Roti",
    desc: "Fresh prawns, cuttlefish, and egg chopped with homemade spicy chilli gravy.",
    price: 1650,
    portion: "Serves 1",
    img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "kt4",
    category: "kottu",
    name: "Black Pork Curry Kottu",
    desc: "Authentic slow-cooked spicy Ceylon black pork chopped with hot godamba roti.",
    price: 1750,
    portion: "Spicy Signature",
    img: "https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?auto=format&fit=crop&w=500&q=80",
  },

  /* 3. Noodles Range */
  {
    id: "nd1",
    category: "noodles",
    name: "Chilli Garlic Seafood Noodles",
    desc: "Stir-fried yellow egg noodles with prawns, squid, capsicum, and garlic paste.",
    price: 1350,
    portion: "Serves 1-2",
    img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "nd2",
    category: "noodles",
    name: "Singapore Rice Noodles",
    desc: "Thin rice vermicelli tossed with chicken, eggs, curry oil, and crunchy vegetables.",
    price: 1450,
    portion: "Serves 1-2",
    img: "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "nd3",
    category: "noodles",
    name: "Mixed Chow Mein",
    desc: "Wok-tossed noodles with chicken, pork, prawns, and oyster garlic glaze.",
    price: 1550,
    portion: "Serves 1",
    img: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=500&q=80",
  },

  /* 4. Pizza Range */
  {
    id: "pz1",
    category: "pizza",
    name: "Spicy Black Pork Pizza (12\")",
    desc: "Hand-tossed dough topped with Ceylon black pork, mozzarella, and green chillies.",
    price: 2850,
    portion: "Large 12 Inch",
    img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "pz2",
    category: "pizza",
    name: "BBQ Chicken Pizza (12\")",
    desc: "Smoky BBQ chicken, bell peppers, red onions, and rich mozzarella cheese.",
    price: 2650,
    portion: "Large 12 Inch",
    img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "pz3",
    category: "pizza",
    name: "Seafood Feast Pizza (12\")",
    desc: "Garlic butter prawns, cuttlefish, capers, and double cheese blend.",
    price: 3200,
    portion: "Premium 12 Inch",
    img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=80",
  },

  /* 5. Special Range */
  {
    id: "sp1",
    category: "special",
    name: "Hot Butter Sepia Cuttlefish",
    desc: "Crispy deep-fried cuttlefish tossed in butter, chili flakes, and capsicum.",
    price: 1850,
    portion: "Starter / Side",
    img: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "sp2",
    category: "special",
    name: "Live Hopper Platter (6 Pcs)",
    desc: "4 Plain Hoppers + 2 Egg Hoppers served with Lunu Miris and Katta Sambal.",
    price: 950,
    portion: "6 Hoppers",
    img: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "sp3",
    category: "special",
    name: "BBQ Charcoal Jumbo Prawns",
    desc: "Garlic butter grilled jumbo prawns (4 pcs) with lemon herb bread.",
    price: 2450,
    portion: "BBQ Special",
    img: "https://images.unsplash.com/photo-1535400255456-984241443b29?auto=format&fit=crop&w=500&q=80",
  },
];

export { productCatalog };

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orderType, setOrderType] = useState<OrderType>("takeaway");
  const [verifiedLocation, setVerifiedLocation] = useState<string>(
    "Handapangoda Hub Pick-up Counter"
  );
  const [isLocationVerified, setIsLocationVerified] = useState<boolean>(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);

  // Load saved state from localStorage if available
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("ahasgawwa_cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
      const savedOrderType = localStorage.getItem("ahasgawwa_order_type");
      if (savedOrderType) {
        setOrderType(savedOrderType as OrderType);
      }
      const savedLoc = localStorage.getItem("ahasgawwa_location");
      if (savedLoc) {
        setVerifiedLocation(savedLoc);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("ahasgawwa_cart", JSON.stringify(cart));
      localStorage.setItem("ahasgawwa_order_type", orderType);
      localStorage.setItem("ahasgawwa_location", verifiedLocation);
    } catch {
      // Ignore storage errors
    }
  }, [cart, orderType, verifiedLocation]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleCartDrawer = () => {
    setIsCartDrawerOpen((prev) => !prev);
  };

  const cartTotalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  return (
    <OrderContext.Provider
      value={{
        orderType,
        setOrderType,
        verifiedLocation,
        setVerifiedLocation,
        isLocationVerified,
        setIsLocationVerified,
        cart,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        toggleCartDrawer,
        cartTotalCount,
        cartSubtotal,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrder must be used within an OrderProvider");
  }
  return context;
}
