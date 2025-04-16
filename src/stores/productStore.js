import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from './authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
    
    // Nueva versión que extrae categorías directamente de los productos
    async fetchCategories() {
      try {
        // Nos aseguramos de que los productos estén cargados
        if (this.products.length === 0) {
          await this.fetchProducts();
        }
        
        // Extraer categorías únicas de los productos
        const categoriesSet = new Set();
        
        this.products.forEach(product => {
          if (product.category && 
              typeof product.category === 'string' && 
              product.category.trim() !== '' &&
              product.category !== 'General') {
            categoriesSet.add(product.category.trim());
          }
        });
        
        // Convertir Set a Array y asignar
        this.categories = Array.from(categoriesSet);
        console.log('Categorías extraídas de productos:', this.categories);
      } catch (error) {
        console.error('Error al extraer categorías de productos:', error);
        this.categories = [];
      }
      
      return this.categories;
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
    
    // Métodos para administración
    async createProduct(product) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log("Enviando al backend:", product);
        
        const authStore = useAuthStore();
        const response = await axios.post(`${API_URL}/api/products`, product, {
          headers: authStore.getAuthHeaders()
        });
        
        console.log("Respuesta del backend:", response.data);
        
        // Actualizar categorías si es necesario
        if (product.category && 
            product.category !== 'General' && 
            !this.categories.includes(product.category)) {
          this.categories.push(product.category);
        }
        
        return response.data;
      } catch (error) {
        console.error("Error completo:", error);
        this.error = error.response?.data?.message || 'Error al crear el producto';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async updateProduct(id, product) {
      this.loading = true;
      this.error = null;
      
      try {
        console.log(`Actualizando producto ${id}:`, product);
        
        const authStore = useAuthStore();
        const response = await axios.put(`${API_URL}/api/products/${id}`, product, {
          headers: authStore.getAuthHeaders()
        });
        
        console.log("Respuesta de actualización:", response.data);
        
        // Actualizar categorías si es necesario
        if (product.category && 
            product.category !== 'General' && 
            !this.categories.includes(product.category)) {
          this.categories.push(product.category);
        }
        
        return response.data;
      } catch (error) {
        console.error("Error completo:", error);
        this.error = error.response?.data?.message || 'Error al actualizar el producto';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteProduct(id) {
      this.loading = true;
      this.error = null;
      
      try {
        const authStore = useAuthStore();
        await axios.delete(`${API_URL}/api/products/${id}`, {
          headers: authStore.getAuthHeaders()
        });
        
        return true;
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al eliminar el producto';
        console.error('Error deleting product:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});