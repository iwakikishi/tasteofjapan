import React, { createContext, Dispatch, SetStateAction, useState, useContext } from 'react';

interface CartContextType {
  ticketCart: any[];
  setTicketCart: Dispatch<SetStateAction<any[]>>;
}

interface CartContextType {
  foodCart: any[];
  setFoodCart: Dispatch<SetStateAction<any[]>>;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [foodCart, setFoodCart] = useState<any[]>([]);
  const [ticketCart, setTicketCart] = useState<any[]>([]);

  return <CartContext.Provider value={{ foodCart, setFoodCart, ticketCart, setTicketCart }}>{children}</CartContext.Provider>;
};

export const useTicketCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const useFoodCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
