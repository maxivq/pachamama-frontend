import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from './authStore';
import { useNotificationStore } from './notificationStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Función de utilidad para reintentos
const retryOperation = async (operation, maxRetries = 2, delay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`Reintento ${attempt} de ${maxRetries}...`);
      }
      return await operation();
    } catch (error) {
      console.error(`Error en intento ${attempt}:`, error);
      lastError = error;
      
      // Si no es el último intento, esperar antes de reintentar
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

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
    
    // Método de creación de producto con reintentos y mejor manejo de errores
    async createProduct(product) {
      this.loading = true;
      this.error = null;
      
      try {
        const result = await retryOperation(async () => {
          console.log("Intentando crear producto:", product);
          
          // Asegurar token fresco
          const authStore = useAuthStore();
          await authStore.checkAndRefreshToken();
          
          // Si la URL de imagen está vacía, usar una por defecto
          if (!product.imageUrl || product.imageUrl.trim() === '') {
            product.imageUrl = 'https://placehold.co/300x200/e9e9e9/999999?text=Producto';
          }
          
          const response = await axios.post(`${API_URL}/api/products`, product, {
            headers: authStore.getAuthHeaders()
          });
          
          console.log("Respuesta del backend:", response.data);
          return response.data;
        });
        
        // Actualizar categorías si es necesario
        if (product.category && 
            product.category !== 'General' && 
            !this.categories.includes(product.category)) {
          this.categories.push(product.category);
        }
        
        return result;
      } catch (error) {
        // Manejo detallado de errores
        console.error("Error completo:", error);
        
        if (error.response) {
          // El servidor respondió con un código de error
          if (error.response.status === 400) {
            this.error = error.response.data.error || 
                       'Datos inválidos. Verifica todos los campos.';
            
            // Verificar si es un error de validación específico
            if (error.response.data.validationErrors) {
              // Formato más legible para errores de validación
              const firstError = Object.values(error.response.data.validationErrors)[0];
              this.error = firstError || this.error;
            }
          } else if (error.response.status === 401 || error.response.status === 403) {
            this.error = 'Sesión expirada. Por favor, vuelve a iniciar sesión.';
            const authStore = useAuthStore();
            authStore.logout();
          } else {
            this.error = 'Error del servidor. Intenta de nuevo más tarde.';
          }
        } else if (error.request) {
          // La petición fue hecha pero no se recibió respuesta
          this.error = 'No se pudo conectar con el servidor. Verifica tu conexión.';
        } else {
          // Algo salió mal al configurar la petición
          this.error = error.message || 'Error al crear el producto';
        }
        
        // Notificar al usuario
        const notificationStore = useNotificationStore();
        notificationStore.error(this.error);
        
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // Método de actualización con reintentos y mejor manejo de errores
    async updateProduct(id, product) {
      this.loading = true;
      this.error = null;
      
      try {
        const result = await retryOperation(async () => {
          console.log(`Intentando actualizar producto ${id}:`, product);
          
          // Asegurar token fresco
          const authStore = useAuthStore();
          await authStore.checkAndRefreshToken();
          
          // Si la URL de imagen está vacía, usar una por defecto
          if (!product.imageUrl || product.imageUrl.trim() === '') {
            product.imageUrl = 'https://placehold.co/300x200/e9e9e9/999999?text=Producto';
          }
          
          const response = await axios.put(`${API_URL}/api/products/${id}`, product, {
            headers: authStore.getAuthHeaders()
          });
          
          console.log("Respuesta de actualización:", response.data);
          return response.data;
        });
        
        // Actualizar categorías si es necesario
        if (product.category && 
            product.category !== 'General' && 
            !this.categories.includes(product.category)) {
          this.categories.push(product.category);
        }
        
        return result;
      } catch (error) {
        // Similar manejo de errores que en createProduct
        console.error("Error completo:", error);
        
        if (error.response) {
          if (error.response.status === 400) {
            this.error = error.response.data.error || 
                       'Datos inválidos. Verifica todos los campos.';
          } else if (error.response.status === 401 || error.response.status === 403) {
            this.error = 'Sesión expirada. Por favor, vuelve a iniciar sesión.';
            const authStore = useAuthStore();
            authStore.logout();
          } else if (error.response.status === 404) {
            this.error = 'Producto no encontrado. Puede que haya sido eliminado.';
          } else {
            this.error = 'Error del servidor. Intenta de nuevo más tarde.';
          }
        } else if (error.request) {
          this.error = 'No se pudo conectar con el servidor. Verifica tu conexión.';
        } else {
          this.error = error.message || 'Error al actualizar el producto';
        }
        
        // Notificar al usuario
        const notificationStore = useNotificationStore();
        notificationStore.error(this.error);
        
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
        await authStore.checkAndRefreshToken();
        
        await axios.delete(`${API_URL}/api/products/${id}`, {
          headers: authStore.getAuthHeaders()
        });
        
        return true;
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al eliminar el producto';
        console.error('Error deleting product:', error);
        
        // Notificar al usuario
        const notificationStore = useNotificationStore();
        notificationStore.error(this.error);
        
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});