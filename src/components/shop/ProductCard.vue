<template>
  <div class="product-card">
    <div class="product-image">
      <img :src="product.imageUrl" :alt="product.title" @error="handleImageError">
    </div>

    <div class="product-details">
      <h3 class="product-title">
        <router-link :to="`/product/${product._id}`">{{ product.title }}</router-link>
      </h3>

      <p class="product-description">
        {{ truncateDescription(product.description) }}
      </p>

      <div class="product-footer">
        <p class="product-price">${{ product.price.toFixed(2) }}</p>

        <!-- Solo mostrar botón de carrito a usuarios normales -->
        <button v-if="!isAdmin" @click="$emit('add-to-cart', product._id)" class="add-to-cart">
          Añadir al carrito
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../../stores/authStore';

const authStore = useAuthStore();
const isAdmin = computed(() => authStore.isAdmin);

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['add-to-cart']);

// Imagen por defecto si la original no carga
const fallbackImage = 'https://via.placeholder.com/300x200?text=Producto';

const handleImageError = (e) => {
  e.target.src = fallbackImage;
};

const truncateDescription = (text, length = 100) => {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
};
</script>

<style scoped>
.product-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
  border-bottom: 3px solid var(--primary-color);
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.product-image {
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-details {
  padding: 15px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.product-title {
  margin-bottom: 10px;
  font-size: 1.1rem;
}

.product-title a {
  color: var(--primary-dark);
  text-decoration: none;
}

.product-title a:hover {
  color: var(--primary-light);
}

.product-price {
  font-weight: bold;
  font-size: 1.2rem;
  color: var(--primary-color);
}

.add-to-cart {
  padding: 6px 12px;
  font-size: 0.85rem;
  background-color: var(--primary-color);
}

.add-to-cart:hover {
  background-color: var(--primary-light);
}

.product-description {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 15px;
  flex-grow: 1;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.product-price {
  font-weight: bold;
  font-size: 1.2rem;
  color: var(--secondary-color);
}

.add-to-cart {
  padding: 6px 12px;
  font-size: 0.85rem;
}
</style>