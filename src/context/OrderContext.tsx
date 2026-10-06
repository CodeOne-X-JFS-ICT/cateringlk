"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Product {
  id: string;
  category: "rice" | "kottu" | "noodles" | "special" | "bites" | string;
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
  isInstantQuoteOpen: boolean;
  setIsInstantQuoteOpen: (open: boolean) => void;
  openInstantQuoteModal: () => void;
  cartTotalCount: number;
  cartSubtotal: number;
}

const productCatalog: Product[] = [
  /* 1. Rice Range */
  {
    id: "r1-reg",
    category: "rice",
    name: "Premium Mixed Rice",
    desc: "Chicken Mixed, Chicken Piece, Egg, Chopsuey, Gravy, Ketchup and Chili Paste",
    price: 890,
    portion: "Regular",
    img: "https://images.unsplash.com/photo-1596560548464-f010549b84d7?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "r2-reg",
    category: "rice",
    name: "Chicken Fried Rice",
    desc: "Chicken Piece, Egg, Chopsuey, Gravy, Ketchup and Chili Paste",
    price: 790,
    portion: "Regular",
    img: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "r3-reg",
    category: "rice",
    name: "Chicken Mixed Rice",
    desc: "Chicken mixed, Egg, Gravy, Ketchup and Chili Paste",
    price: 690,
    portion: "Regular",
    img: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "r4-reg",
    category: "rice",
    name: "Egg Fried Rice",
    desc: "Egg, Chopsuey, Gravy, Ketchup and Chili Paste",
    price: 650,
    portion: "Regular",
    img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "r5-reg",
    category: "rice",
    name: "Seafood Mix Rice",
    desc: "Prawns, Cuttle fish mixed, Egg, Gravy, Ketchup and Chili Paste",
    price: 890,
    portion: "Regular",
    img: "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "r6-reg",
    category: "rice",
    name: "Vegetable Fried Rice",
    desc: "Chopsuey, Gravy, Ketchup and Chili Paste",
    price: 550,
    portion: "Regular",
    img: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=500&q=80",
  },

  /* 2. Kottu Range */
  {
    id: "k1-reg",
    category: "kottu",
    name: "Premium Kottu",
    desc: "Chicken mixed, Egg, Veg mixed Kottu, Gravy",
    price: 800,
    portion: "Regular",
    img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "k2-reg",
    category: "kottu",
    name: "Vegetable Kottu",
    desc: "Veg mixed Kottu",
    price: 500,
    portion: "Regular",
    img: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "k3-reg",
    category: "kottu",
    name: "Chicken Kottu",
    desc: "Chicken mixed, Egg, Veg mixed Kottu, Gravy",
    price: 700,
    portion: "Regular",
    img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "k4-reg",
    category: "kottu",
    name: "Cheese Kottu",
    desc: "Chicken mixed, Fresh Milk, Cheese, Egg, Veg mixed Kottu, Gravy, Ketchup",
    price: 1090,
    portion: "Regular",
    img: "https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "k5-reg",
    category: "kottu",
    name: "Egg Kottu",
    desc: "Egg, Veg mixed Kottu, Gravy",
    price: 600,
    portion: "Regular",
    img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=500&q=80",
  },

  /* 3. Noodles Range */
  {
    id: "n1-reg",
    category: "noodles",
    name: "Chicken Noodles",
    desc: "Chicken mixed, Egg, Gravy, Ketchup",
    price: 690,
    portion: "Regular",
    img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "n2-reg",
    category: "noodles",
    name: "Egg Noodles",
    desc: "Egg, Gravy, Ketchup",
    price: 590,
    portion: "Regular",
    img: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=500&q=80",
  },

  /* 4. Special Range */
  {
    id: "s1-reg",
    category: "special",
    name: "AG Special Mixed Plus",
    desc: "Mixed with Chicken, Egg, Prawn, Cuttlefish, Fish, Sausages, Pork, Gravy, Ketchup",
    price: 1090,
    portion: "Regular",
    img: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "s2-reg",
    category: "special",
    name: "AG Special Mixed",
    desc: "Mixed with Chicken, Egg, Prawn, Cuttlefish, Fish, Sausages, Gravy, Ketchup",
    price: 990,
    portion: "Regular",
    img: "https://images.unsplash.com/photo-1535400255456-984241443b29?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "s3-reg",
    category: "special",
    name: "Chicken Biriyani",
    desc: "Chicken, Boiled Egg, Mint Sambol, Pineapple piece, Cashew, Gravy",
    price: 890,
    portion: "Regular",
    img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=80",
  },

  /* 5. Bite Range */
  {
    id: "b1-reg",
    category: "bites",
    name: "Devilled Chicken",
    desc: "Spicy devilled chicken tossed with capsicum, onion, and chilli glaze.",
    price: 1150,
    portion: "Regular",
    img: "https://images.unsplash.com/photo-1527477378408-1bc128217730?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "b2-reg",
    category: "bites",
    name: "Pork Stew",
    desc: "Authentic slow-cooked tender pork stew with potatoes and Sri Lankan aromatic spices.",
    price: 1650,
    portion: "Regular",
    img: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "b3-reg",
    category: "bites",
    name: "Hot Butter Mushroom",
    desc: "Crispy battered button mushrooms tossed in hot garlic butter and chilli flakes.",
    price: 575,
    portion: "Regular",
    img: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "b4-pie",
    category: "bites",
    name: "Hot Butter Chicken Pieces",
    desc: "Crispy crunchy batter-fried chicken piece coated in spicy seasoned hot butter.",
    price: 302,
    portion: "One Piece",
    img: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=500&q=80",
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
  const [isInstantQuoteOpen, setIsInstantQuoteOpen] = useState<boolean>(false);

  const openInstantQuoteModal = () => {
    setIsInstantQuoteOpen(true);
  };

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
        isInstantQuoteOpen,
        setIsInstantQuoteOpen,
        openInstantQuoteModal,
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
