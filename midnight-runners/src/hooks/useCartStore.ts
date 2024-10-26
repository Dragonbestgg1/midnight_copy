import { create } from 'zustand';
import { currentCart } from '@wix/ecom';
import { WixClient } from '../context/wixContext';

type CartState = {
  cart: currentCart.Cart | null;
  counter: number;
  isLoading: boolean;
  getCart: (wixClient: WixClient) => void;
  addItem: (
    wixClient: WixClient,
    productId: string,
    variantId: string,
    quantity: number
  ) => void;
  removeItem: (wixClient: WixClient, itemId: string) => void;
};

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  counter: 0,
  isLoading: false,
  getCart: async (wixClient) => {
    set({ isLoading: true });
    try {
      const cart = await currentCart.getCurrentCart();
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
  addItem: async (wixClient, productId, variantId, quantity) => {
    set({ isLoading: true });
    try {
      const response = await currentCart.addToCurrentCart({
        lineItems: [
          {
            catalogReference: {
              appId: process.env.NEXT_PUBLIC_WIX_APP_ID,
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
          counter: response.cart.lineItems.length || 0,
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
  removeItem: async (wixClient, itemId) => {
    set({ isLoading: true });
    try {
      const response = await currentCart.removeCouponFromCurrentCart();
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