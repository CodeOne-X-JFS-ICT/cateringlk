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
  deliveryZoneId: number | null;
  setDeliveryZoneId: (id: number | null) => void;
  deliveryCoords: { lat: number; lng: number } | null;
  setDeliveryCoords: (coords: { lat: number; lng: number } | null) => void;
  distanceKm: number | null;
  setDistanceKm: (dist: number | null) => void;
  deliveryFee: number;
  setDeliveryFee: (fee: number) => void;
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

export const productCatalog: Product[] = [];

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orderType, setOrderType] = useState<OrderType>("takeaway");
  const [verifiedLocation, setVerifiedLocation] = useState<string>(
    "Handapangoda Hub Pick-up Counter"
  );
  const [isLocationVerified, setIsLocationVerified] = useState<boolean>(false);
  const [deliveryZoneId, setDeliveryZoneId] = useState<number | null>(null);
  const [deliveryCoords, setDeliveryCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
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
      const savedZoneId = localStorage.getItem("ahasgawwa_zone_id");
      if (savedZoneId) {
        setDeliveryZoneId(parseInt(savedZoneId, 10));
      }
      const savedFee = localStorage.getItem("ahasgawwa_delivery_fee");
      if (savedFee) {
        setDeliveryFee(parseFloat(savedFee));
      }
      const savedCoords = localStorage.getItem("ahasgawwa_delivery_coords");
      if (savedCoords) {
        setDeliveryCoords(JSON.parse(savedCoords));
      }
      const savedDist = localStorage.getItem("ahasgawwa_distance_km");
      if (savedDist) {
        setDistanceKm(parseFloat(savedDist));
      }
      const savedVerified = localStorage.getItem("ahasgawwa_location_verified");
      if (savedVerified) {
        setIsLocationVerified(savedVerified === "true");
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
      if (deliveryZoneId) {
        localStorage.setItem("ahasgawwa_zone_id", deliveryZoneId.toString());
      } else {
        localStorage.removeItem("ahasgawwa_zone_id");
      }
      if (deliveryCoords) {
        localStorage.setItem("ahasgawwa_delivery_coords", JSON.stringify(deliveryCoords));
      } else {
        localStorage.removeItem("ahasgawwa_delivery_coords");
      }
      if (distanceKm !== null && distanceKm !== undefined) {
        localStorage.setItem("ahasgawwa_distance_km", distanceKm.toString());
      } else {
        localStorage.removeItem("ahasgawwa_distance_km");
      }
      localStorage.setItem("ahasgawwa_delivery_fee", deliveryFee.toString());
      localStorage.setItem("ahasgawwa_location_verified", isLocationVerified.toString());
    } catch {
      // Ignore storage errors
    }
  }, [cart, orderType, verifiedLocation, deliveryZoneId, deliveryCoords, distanceKm, deliveryFee, isLocationVerified]);

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
        deliveryZoneId,
        setDeliveryZoneId,
        deliveryCoords,
        setDeliveryCoords,
        distanceKm,
        setDistanceKm,
        deliveryFee,
        setDeliveryFee,
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
