<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="navbar-brand">
        <router-link to="/">Pachamama</router-link>
      </div>

      <div class="navbar-links">
        <router-link to="/" class="nav-link">Inicio</router-link>

        <!-- Enlaces específicos para admin -->
        <template v-if="isAdmin">
          <router-link to="/admin/products" class="nav-link">
            Administrar Productos
          </router-link>
          <button @click="logout" class="logout-btn">
            Cerrar Sesión
          </button>
        </template>

        <!-- Enlaces específicos para usuarios normales -->
        <template v-else>
          <router-link to="/cart" class="cart-link">
            <span class="cart-icon">🛒</span>
            <span v-if="cartItemCount > 0" class="cart-count">{{ cartItemCount }}</span>
          </router-link>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();

const cartItemCount = computed(() => cartStore.cartItemCount);
const isAdmin = computed(() => authStore.isAdmin);

const logout = () => {
  authStore.logout();
  // Redirigir al inicio después de cerrar sesión
  router.push('/');
};

onMounted(() => {
  // Inicializar estado de autenticación
  authStore.initAuth();
});
</script>

<style scoped>
/* Mantener los estilos existentes */

.logout-btn {
  background-color: transparent;
  color: white;
  border: 1px solid white;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.navbar {
  background-color: var(--secondary-color);
  color: var(--text-light);
  padding: 15px 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.navbar-brand a {
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-link {
  color: var(--text-light);
  text-decoration: none;
  transition: color 0.3s;
  padding: 5px 10px;
}

.nav-link:hover {
  color: var(--accent-color);
}

.logout-btn {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--text-light);
  border: 1px solid var(--text-light);
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.cart-link {
  position: relative;
  color: white;
  text-decoration: none;
  font-size: 1.2rem;
}

.cart-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: var(--accent-color);
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  height: 18px;
  width: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}
</style>