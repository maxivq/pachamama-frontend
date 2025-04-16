import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useCartStore = defineStore('cart', {
  state: () => ({
    cart: { items: [] },
    sessionId: '',
    loading: false,
    error: null
  }),
  
  getters: {
    cartItemCount: (state) => {
      return state.cart.items.reduce((total, item) => total + item.quantity, 0);
    },
    
    cartTotal: (state) => {
      return state.cart.items.reduce((total, item) => {
        return total + (item.product?.price || 0) * item.quantity;
      }, 0);
    }
  },
  
  actions: {
    // Inicializar sesión
    initSession() {
      let sessionId = localStorage.getItem('cart_session_id');
      if (!sessionId) {
        sessionId = 'session_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('cart_session_id', sessionId);
      }
      this.sessionId = sessionId;
    },
    
    // Obtener el carrito actual
    async fetchCart() {
      this.initSession();
      
      if (!this.sessionId) return;
      
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.get(`${API_URL}/api/cart/${this.sessionId}`);
        this.cart = response.data.data || { items: [] };
      } catch (error) {
        this.error = error.message || 'Error al cargar el carrito';
        console.error('Error fetching cart:', error);
      } finally {
        this.loading = false;
      }
    },
    
    // Añadir producto al carrito
    async addToCart(productId, quantity = 1) {
      this.initSession();
      
      if (!this.sessionId) return false;
      
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.post('http://localhost:5000/api/cart/add', {
          sessionId: this.sessionId,
          productId,
          quantity
        });
        
        this.cart = response.data.data;
        return true;
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al añadir al carrito';
        console.error('Error adding to cart:', error);
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    // Eliminar un producto del carrito
    async removeFromCart(productId) {
      if (!this.sessionId) {
        return false;
      }
      
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.post('http://localhost:5000/api/cart/remove', {
          sessionId: this.sessionId,
          productId
        });
        
        this.cart = response.data.data;
        return true;
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al eliminar del carrito';
        console.error('Error removing from cart:', error);
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    // Vaciar el carrito completamente
    async clearCart() {
      if (!this.sessionId) {
        return false;
      }
      
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.post('http://localhost:5000/api/cart/clear', {
          sessionId: this.sessionId
        });
        
        this.cart = response.data.data;
        return true;
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al vaciar el carrito';
        console.error('Error clearing cart:', error);
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    // Finalizar compra vía WhatsApp
    async checkoutToWhatsApp(customerInfo) {
      if (!this.sessionId || this.cartItemCount === 0) {
        return false;
      }
      
      this.loading = true;
      this.error = null;
      
      try {
        const { name = '', address = '', phone = '', comments = '' } = customerInfo || {};
        
        const response = await axios.post('http://localhost:5000/api/cart/checkout', {
          sessionId: this.sessionId,
          customerName: name,
          customerAddress: address,
          customerPhone: phone,
          additionalInfo: comments
        });
        
        // Actualizar el carrito vacío
        this.cart = { items: [] };
        
        // Abrir WhatsApp en nueva ventana
        window.open(response.data.data.whatsappUrl, '_blank');
        return true;
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al procesar el checkout';
        console.error('Error during checkout:', error);
        return false;
      } finally {
        this.loading = false;
      }
    }
  }
});