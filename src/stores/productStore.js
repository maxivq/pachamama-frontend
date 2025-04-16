import { useAuthStore } from './authStore';
import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    categories: [],
    loading: false,
    error: null,
    searchTerm: '',
    selectedCategory: 'all'
  }),
  
  getters: {
    filteredProducts: (state) => {
      return state.products;
    }
  },
  
  actions: {
    async fetchProducts() {
      this.loading = true;
      this.error = null;
      
      try {
        // Construir URL con parámetros de filtro
        let url = `${API_URL}/api/products?`;
        if (this.searchTerm) {
          url += `search=${encodeURIComponent(this.searchTerm)}&`;
        }
        if (this.selectedCategory && this.selectedCategory !== 'all') {
          url += `category=${encodeURIComponent(this.selectedCategory)}`;
        }
        
        const response = await axios.get(url);
        this.products = response.data;
      } catch (error) {
        this.error = 'Error al cargar productos';
        console.error('Error fetching products:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async fetchProduct(id) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.get(`${API_URL}/api/products/${id}`);
        return response.data;
      } catch (error) {
        this.error = 'Error al cargar el producto';
        console.error('Error fetching product:', error);
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchCategories() {
      try {
        const response = await axios.get(`${API_URL}/api/products/categories`);
        this.categories = response.data;
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    },
    
    setSearchTerm(term) {
      this.searchTerm = term;
    },
    
    setCategory(category) {
      this.selectedCategory = category;
    },
    
    resetFilters() {
      this.searchTerm = '';
      this.selectedCategory = 'all';
    },

    // Crear un nuevo producto (requiere autenticación)
    async createProduct(productData) {
      this.loading = true;
      this.error = null;
      
      try {
        const authStore = useAuthStore();
        const headers = authStore.getAuthHeaders();
        
        const response = await axios.post(
          `${API_URL}/api/products`, 
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
          `${API_URL}/api/products/${id}`, 
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
          `${API_URL}/api/products/${id}`,
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