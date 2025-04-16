import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAdmin: false,
    token: null,
    loading: false,
    error: null
  }),
  
  actions: {
    // Verificar si una clave es válida comunicándose con el backend
    async verifyAdminAccess(secretKey) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.post(`${API_URL}/api/auth/admin-access`, {
          secretKey
        });
        
        if (response.data.success) {
          this.isAdmin = true;
          this.token = response.data.token;
          
          // Guardar token en localStorage
          localStorage.setItem('pachamama-token', this.token);
          
          return true;
        }
        
        return false;
      } catch (error) {
        this.error = error.response?.data?.message || 'Error de autenticación';
        console.error('Error de autenticación:', error);
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    // Verificar si el token almacenado es válido
    async checkTokenValidity() {
      const token = localStorage.getItem('pachamama-token');
      
      if (!token) {
        this.isAdmin = false;
        return false;
      }
      
      this.loading = true;
      
      try {
        const response = await axios.post(`${API_URL}/api/auth/verify-token`, {
          token
        });
        
        if (response.data.success) {
          this.isAdmin = true;
          this.token = token;
          return true;
        } else {
          this.logout();
          return false;
        }
      } catch (error) {
        this.logout();
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    // Inicializar estado desde localStorage y verificar validez
    async initAuth() {
      await this.checkTokenValidity();
    },
    
    // Cerrar sesión
    logout() {
      this.isAdmin = false;
      this.token = null;
      localStorage.removeItem('pachamama-token');
    },
    
    // Obtener encabezados de autorización para las peticiones
    getAuthHeaders() {
      return this.token ? {
        Authorization: `Bearer ${this.token}`
      } : {};
    }
  }
});