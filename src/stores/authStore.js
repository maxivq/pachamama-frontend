import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAdmin: false,
    token: null,
    loading: false,
    error: null,
    lastTokenCheck: 0 // Timestamp de última verificación
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
          this.lastTokenCheck = Date.now();
          
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
    
    // NUEVO: Verificar si el token podría estar expirado y renovarlo
    async checkAndRefreshToken() {
      const currentTime = Date.now();
      const tokenAge = currentTime - this.lastTokenCheck;
      
      // Si han pasado más de 25 minutos desde la última verificación (tokens típicamente duran 30 min)
      if (tokenAge > 25 * 60 * 1000) {
        console.log('Token potencialmente expirado, verificando...');
        
        // Verificar validez del token actual
        const isValid = await this.checkTokenValidity();
        
        if (!isValid) {
          console.log('Token inválido, intentando relogin automático...');
          // Aquí podrías implementar auto-login con refresh token
          // o simplemente redirigir al login
          
          // Por ahora solo actualizamos el timestamp
          this.lastTokenCheck = currentTime;
          
          // Devolver false indica que el token no es válido
          return false;
        }
        
        // Token es válido, actualizar timestamp
        this.lastTokenCheck = currentTime;
      }
      
      return true; // Token está bien
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
          this.lastTokenCheck = Date.now();
          return true;
        } else {
          this.logout();
          return false;
        }
      } catch (error) {
        console.error('Error verificando token:', error);
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
      this.lastTokenCheck = 0;
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