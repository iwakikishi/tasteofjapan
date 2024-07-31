import React, { createContext, useContext, useState } from 'react';

export const CartContext = createContext(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState([]);

  return <CartContext.Provider value={{ cart, setCart }}>{children}</CartContext.Provider>;
};
