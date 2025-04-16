<template>
    <div class="toast-container">
      <transition-group name="toast">
        <div 
          v-for="notification in notifications" 
          :key="notification.id"
          :class="['toast', `toast-${notification.type}`]"
          @click="removeNotification(notification.id)"
        >
          <div class="toast-icon">
            <span v-if="notification.type === 'success'">✓</span>
            <span v-else-if="notification.type === 'error'">✕</span>
            <span v-else-if="notification.type === 'warning'">!</span>
            <span v-else>i</span>
          </div>
          <div class="toast-content">{{ notification.message }}</div>
          <button class="toast-close" @click.stop="removeNotification(notification.id)">
            &times;
          </button>
        </div>
      </transition-group>
    </div>
  </template>
  
  <script setup>
  import { useNotificationStore } from '../../stores/notificationStore';
  import { storeToRefs } from 'pinia';
  
  const notificationStore = useNotificationStore();
  const { notifications } = storeToRefs(notificationStore);
  const { removeNotification } = notificationStore;
  </script>
  
  <style scoped>
  .toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 350px;
  }
  
  .toast {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(5px);
  }
  
  .toast-success {
    background-color: rgba(46, 125, 50, 0.95);
    border-left: 4px solid #1b5e20;
  }
  
  .toast-error {
    background-color: rgba(183, 28, 28, 0.95);
    border-left: 4px solid #7f0000;
  }
  
  .toast-warning {
    background-color: rgba(237, 108, 2, 0.95);
    border-left: 4px solid #e65100;
  }
  
  .toast-info {
    background-color: rgba(2, 136, 209, 0.95);
    border-left: 4px solid #01579b;
  }
  
  .toast-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    margin-right: 12px;
    background-color: rgba(255, 255, 255, 0.2);
    font-weight: bold;
  }
  
  .toast-content {
    flex: 1;
    font-size: 0.95rem;
  }
  
  .toast-close {
    background: none;
    border: none;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0 4px;
    opacity: 0.7;
    transition: opacity 0.2s;
  }
  
  .toast-close:hover {
    opacity: 1;
  }
  
  /* Animaciones */
  .toast-enter-active,
  .toast-leave-active {
    transition: all 0.3s ease;
  }
  
  .toast-enter-from {
    opacity: 0;
    transform: translateX(30px);
  }
  
  .toast-leave-to {
    opacity: 0;
    transform: translateX(30px);
  }
  </style>