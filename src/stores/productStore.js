import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from './authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    product: null,
    loading: false,
    error: null
  }),
  
  actions: {
    // Obtener todos los productos
    async fetchProducts() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.get(`${API_URL}/api/products`);
        this.products = response.data.data;
      } catch (error) {
        this.error = error.message || 'Error al cargar productos';
        console.error('Error fetching products:', error);
      } finally {
        this.loading = false;
      }
    },
    
    // Obtener un producto por ID
    async fetchProduct(id) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.get(`http://localhost:5000/api/products/${id}`);
        this.product = response.data.data;
      } catch (error) {
        this.error = error.message || 'Error al cargar el producto';
        console.error('Error fetching product:', error);
      } finally {
        this.loading = false;
      }
    },
    
    // Crear un nuevo producto (requiere autenticación)
    async createProduct(productData) {
      this.loading = true;
      this.error = null;
      
      try {
        const authStore = useAuthStore();
        const headers = authStore.getAuthHeaders();
        
        const response = await axios.post(
          'http://localhost:5000/api/products', 
          productData,
          { headers }
        );
        
        this.products.push(response.data.data);
        return response.data.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al crear producto';
        console.error('Error creating product:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // Actualizar un producto (requiere autenticación)
    async updateProduct(id, productData) {
      this.loading = true;
      this.error = null;
      
      try {
        const authStore = useAuthStore();
        const headers = authStore.getAuthHeaders();
        
        const response = await axios.put(
          `http://localhost:5000/api/products/${id}`, 
          productData,
          { headers }
        );
        
        const index = this.products.findIndex(p => p._id === id);
        if (index !== -1) {
          this.products[index] = response.data.data;
        }
        return response.data.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al actualizar producto';
        console.error('Error updating product:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // Eliminar un producto (requiere autenticación)
    async deleteProduct(id) {
      this.loading = true;
      this.error = null;
      
      try {
        const authStore = useAuthStore();
        const headers = authStore.getAuthHeaders();
        
        await axios.delete(
          `http://localhost:5000/api/products/${id}`,
          { headers }
        );
        
        this.products = this.products.filter(p => p._id !== id);
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al eliminar producto';
        console.error('Error deleting product:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});