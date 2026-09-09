"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem } from "@/types";

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (photoId: string, licenseTierId: string) => void;
  clearCart: () => void;
  itemCount: number;
  totalCents: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("wildcanvas_cart");
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      // Ignore parse errors
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("wildcanvas_cart", JSON.stringify(items));
      } catch {
        // Ignore storage errors
      }
    }
  }, [items, isLoaded]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      // Avoid exact duplicate of photoId + licenseTierId
      const exists = prev.some(
        (i) => i.photoId === item.photoId && i.licenseTierId === item.licenseTierId
      );
      if (exists) return prev;
      return [...prev, item];
    });
    setIsCartOpen(true);
  };

  const removeItem = (photoId: string, licenseTierId: string) => {
    setItems((prev) =>
      prev.filter(
        (i) => !(i.photoId === photoId && i.licenseTierId === licenseTierId)
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalCents = items.reduce((acc, item) => acc + item.priceCents, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearCart,
        itemCount: items.length,
        totalCents,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
