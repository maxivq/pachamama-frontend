<template>
  <div class="home">
    <h1>Nuestros Productos</h1>
    
    <!-- Añadir componente de búsqueda y filtro -->
    <SearchFilter />
    
    <div v-if="loading" class="loading">
      <p>Cargando productos...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>
    
    <div v-else-if="!filteredProducts.length" class="no-results">
      <p>No se encontraron productos que coincidan con tu búsqueda</p>
      <button @click="resetFilters" class="reset-button">
        Mostrar todos los productos
      </button>
    </div>
    
    <div v-else class="products-grid">
      <ProductCard 
        v-for="product in filteredProducts" 
        :key="product._id"
        :product="product"
        @add-to-cart="addToCart"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useProductStore } from '../stores/productStore';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import ProductCard from '../components/shop/ProductCard.vue';
import SearchFilter from '../components/shop/SearchFilter.vue';

const productStore = useProductStore();
const cartStore = useCartStore();
const authStore = useAuthStore();
const notification = useNotificationStore();

const loading = computed(() => productStore.loading);
const error = computed(() => productStore.error);
const filteredProducts = computed(() => productStore.filteredProducts);
const isAdmin = computed(() => authStore.isAdmin);

const loadProducts = async () => {
  await productStore.fetchProducts();
};

const addToCart = async (productId) => {
  if (isAdmin.value) return;
  
  const success = await cartStore.addToCart(productId, 1);
  if (success) {
    notification.success('Producto añadido al carrito');
  } else {
    notification.error('No se pudo añadir el producto al carrito');
  }
};

const resetFilters = () => {
  productStore.resetFilters();
  productStore.fetchProducts();
};

onMounted(() => {
  authStore.initAuth();
  loadProducts();
});
</script>

<style scoped>
.home {
  padding: 20px 0;
}

h1 {
  margin-bottom: 30px;
  text-align: center;
  color: var(--secondary-color);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
}

.loading,
.error,
.empty-state {
  text-align: center;
  padding: 50px 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.error {
  color: var(--accent-color);
}

.error button {
  margin-top: 10px;
}
</style>