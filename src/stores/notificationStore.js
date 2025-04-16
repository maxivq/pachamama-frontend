import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNotificationStore = defineStore('notification', () => {
  // Lista de notificaciones activas
  const notifications = ref([]);
  
  // Contador para generar IDs únicos
  let nextId = 0;
  
  // Añadir una nueva notificación
  function notify({ message, type = 'info', duration = 3000 }) {
    const id = nextId++;
    
    // Añadir notificación a la lista
    notifications.value.push({
      id,
      message,
      type, // 'success', 'error', 'info', 'warning'
      duration
    });
    
    // Eliminar automáticamente después del tiempo especificado
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
    
    return id;
  }
  
  // Helpers para tipos específicos de notificaciones
  function success(message, duration = 3000) {
    return notify({ message, type: 'success', duration });
  }
  
  function error(message, duration = 4000) {
    return notify({ message, type: 'error', duration });
  }
  
  function warning(message, duration = 3500) {
    return notify({ message, type: 'warning', duration });
  }
  
  function info(message, duration = 3000) {
    return notify({ message, type: 'info', duration });
  }
  
  // Eliminar una notificación por ID
  function removeNotification(id) {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications.value.splice(index, 1);
    }
  }
  
  // Eliminar todas las notificaciones
  function clearAll() {
    notifications.value = [];
  }
  
  return {
    notifications,
    notify,
    success,
    error,
    warning,
    info,
    removeNotification,
    clearAll
  };
});