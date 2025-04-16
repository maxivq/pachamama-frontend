<template>
    <div class="admin-access">
      <h1>Acceso Administrativo</h1>
      
      <div v-if="loading" class="loading-message">
        <p>Verificando...</p>
      </div>
      
      <div v-else-if="isAdmin" class="success-message">
        <p>¡Ya tienes acceso de administrador!</p>
        <div class="action-buttons">
          <router-link to="/admin/products" class="admin-link">
            Ir al panel de administración
          </router-link>
          <button @click="logout" class="logout-btn">Cerrar sesión</button>
        </div>
      </div>
      
      <div v-else-if="error" class="error-message">
        <p>{{ error }}</p>
      </div>
      
      <div v-else class="secret-form">
        <p>Esta página es solo para administradores.</p>
        
        <div class="form-group">
          <label for="secretKey">Clave secreta:</label>
          <input 
            type="password"
            id="secretKey"
            v-model="secretKey"
            placeholder="Ingresa la clave secreta"
          >
        </div>
        
        <button @click="verifyAccess" class="access-btn" :disabled="loading">
          Acceder
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';

const router = useRouter();
const authStore = useAuthStore();
const notification = useNotificationStore();
  
  const secretKey = ref('');
  const error = ref('');
  const isAdmin = computed(() => authStore.isAdmin);
  const loading = computed(() => authStore.loading);
  
  const verifyAccess = async () => {
  if (!secretKey.value) {
    notification.warning('Por favor ingresa la clave secreta');
    return;
  }
  
  const isValid = await authStore.verifyAdminAccess(secretKey.value);
  
  if (isValid) {
    notification.success('Acceso concedido');
    router.push('/admin/products');
  } else {
    notification.error(authStore.error || 'Clave secreta incorrecta');
  }
};

const logout = () => {
  authStore.logout();
  notification.info('Has cerrado sesión');
};
  
  onMounted(async () => {
    // Verificar si el token guardado es válido
    await authStore.initAuth();
  });
  </script>
  
  <style scoped>
  /* Mantener los mismos estilos que antes */
  .loading-message {
    text-align: center;
    padding: 20px;
    background-color: #e2f0fb;
    color: #0c5460;
    border-radius: 4px;
    margin-bottom: 20px;
  }
  </style>