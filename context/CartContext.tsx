import React, { createContext, Dispatch, SetStateAction, useState, useContext } from 'react';

interface Cart {
  checkoutId: string;
  lineItems: any[];
  webUrl: string;
}

interface TempCart {
  lineItems: {
    variantId: string;
    quantity: number;
    productId: string;
    validDate: string;
  }[];
}

interface CartContextType {
  cart: Cart;
  setCart: Dispatch<SetStateAction<Cart>>;
  tempCart: TempCart;
  setTempCart: Dispatch<SetStateAction<TempCart>>;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<Cart>({ checkoutId: '', lineItems: [], webUrl: '' } as Cart);
  const [tempCart, setTempCart] = useState<TempCart>({ lineItems: [] });

  return <CartContext.Provider value={{ cart, setCart, tempCart, setTempCart }}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
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
