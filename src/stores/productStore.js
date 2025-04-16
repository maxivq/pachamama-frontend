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
    
    async fetchCategories() {
      try {
        console.log('Solicitando categorías al backend...');
        const response = await axios.get(`${API_URL}/api/products/categories`);
        
        console.log('Respuesta del backend para categorías:', response.data);
        
        if (response.data && Array.isArray(response.data)) {
          // Asignar categorías recibidas
          this.categories = response.data;
        } else {
          console.warn('La respuesta no es un array, usando array vacío');
          this.categories = [];
        }
      } catch (error) {
        console.error('Error detallado al obtener categorías:', error);
        
        // Recuperación de error: obtener categorías directamente de los productos
        try {
          console.log('Intentando obtener categorías de los productos existentes...');
          const productsResponse = await axios.get(`${API_URL}/api/products`);
          
          if (productsResponse.data && Array.isArray(productsResponse.data)) {
            // Extraer categorías únicas de los productos
            const categoriesFromProducts = [...new Set(
              productsResponse.data
                .map(product => product.category)
                .filter(cat => cat && cat !== 'General')
            )];
            
            console.log('Categorías extraídas de productos:', categoriesFromProducts);
            this.categories = categoriesFromProducts;
          } else {
            this.categories = [];
          }
        } catch (fallbackError) {
          console.error('Error en recuperación fallback de categorías:', fallbackError);
          this.categories = [];
        }
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
        if (product.category && !this.categories.includes(product.category)) {
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
        if (product.category && !this.categories.includes(product.category)) {
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