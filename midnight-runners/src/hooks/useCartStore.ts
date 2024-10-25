import { create } from 'zustand';
import { getCurrentCart, addToCurrentCart, removeCouponFromCurrentCart } from '@wix/ecom';
// OR you might need to use a different import if they are nested:
// import * as currentCart from '@wix/ecom';
// const { getCurrentCart, addToCurrentCart, removeCouponFromCurrentCart } = currentCart;

import { WixClient } from '../context/wixContext';

const fetchWixClient = async () => {
  try {
    const response = await fetch('/api/wixClientServer');
    if (!response.ok) {
      const errorMessage = await response.text(); // Get the error message
      console.error('Failed to fetch Wix client:', errorMessage);
      throw new Error('Failed to fetch Wix client');
    }
    const data = await response.json();
    return data.client;
  } catch (error) {
    console.error('Fetch Wix client error:', error);
    throw error;
  }
};

type CartState = {
  cart: any | null;
  counter: number;
  isLoading: boolean;
  getCart: () => void;
  addItem: (productId: string, variantId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
};

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  counter: 0,
  isLoading: false,
  getCart: async () => {
    set({ isLoading: true });
    try {
      const wixClient = await fetchWixClient();
      // Confirm that these functions are available on wixClient
      console.log('Available functions on wixClient.currentCart:', Object.keys(wixClient.currentCart));
      const cart = await wixClient.currentCart.getCurrentCart(); // Adjusted if nested
      set({
        cart: cart || null,
        counter: cart?.lineItems?.length || 0,
        isLoading: false,
      });
    } catch (err) {
      console.error('Error fetching cart:', err);
      set({ isLoading: false });
    }
  },
  addItem: async (productId, variantId, quantity) => {
    set({ isLoading: true });
    try {
      const wixClient = await fetchWixClient();
      const response = await wixClient.currentCart.addToCurrentCart({ // Adjusted if nested
        lineItems: [
          {
            catalogReference: {
              appId: process.env.NEXT_PUBLIC_WIX_APP_ID!,
              catalogItemId: productId,
              ...(variantId && { options: { variantId } }),
            },
            quantity: quantity,
          },
        ],
      });
      console.log('Add to cart response:', response);
      if (response && response.cart) {
        set({
          cart: response.cart,
          counter: response.cart?.lineItems?.length || 0,
          isLoading: false,
        });
      } else {
        console.warn('No cart returned in response:', response);
        set({ isLoading: false });
      }
    } catch (err) {
      console.error('Error in addToCurrentCart:', err);
      set({ isLoading: false });
    }
  },
  removeItem: async (itemId) => {
    set({ isLoading: true });
    try {
      const wixClient = await fetchWixClient();
      const response = await wixClient.currentCart.removeCouponFromCurrentCart(); // Adjusted if nested
      set({
        cart: response.cart,
        counter: response.cart?.lineItems?.length || 0,
        isLoading: false,
      });
    } catch (err) {
      console.error('Error in removeItem:', err);
      set({ isLoading: false });
    }
  },
}));
