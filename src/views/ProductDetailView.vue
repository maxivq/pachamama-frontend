<template>
    <div class="product-detail">
        <div v-if="loading" class="loading">
            <p>Cargando detalles del producto...</p>
        </div>

        <div v-else-if="error" class="error">
            <p>{{ error }}</p>
            <button @click="loadProduct">Intentar nuevamente</button>
        </div>

        <div v-else-if="!product" class="not-found">
            <p>Producto no encontrado</p>
            <router-link to="/" class="back-link">Volver a la tienda</router-link>
        </div>

        <div v-else class="product-container">
            <div class="product-image">
                <img :src="product.imageUrl" :alt="product.title" @error="handleImageError">
            </div>

            <div class="product-info">
                <h1 class="product-title">{{ product.title }}</h1>
                <p class="product-price">${{ product.price.toFixed(2) }}</p>

                <div class="product-description">
                    <h3>Descripción</h3>
                    <p>{{ product.description }}</p>
                </div>

                <div class="product-actions" v-if="!isAdmin">
                    <div class="quantity-selector">
                        <button @click="decreaseQuantity" :disabled="quantity <= 1">-</button>
                        <span>{{ quantity }}</span>
                        <button @click="increaseQuantity">+</button>
                    </div>

                    <button @click="addToCart" class="add-to-cart-btn">
                        Añadir al carrito
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProductStore } from '../stores/productStore';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';

// Añadir store de autenticación
const authStore = useAuthStore();
const isAdmin = computed
const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const cartStore = useCartStore();

const productId = computed(() => route.params.id);
const product = computed(() => productStore.product);
const loading = computed(() => productStore.loading);
const error = computed(() => productStore.error);

const quantity = ref(1);
const fallbackImage = 'https://via.placeholder.com/500x400?text=Producto';

const loadProduct = async () => {
    await productStore.fetchProduct(productId.value);
};

const handleImageError = (e) => {
    e.target.src = fallbackImage;
};

const increaseQuantity = () => {
    quantity.value++;
};

const decreaseQuantity = () => {
    if (quantity.value > 1) {
        quantity.value--;
    }
};

const addToCart = async () => {
    const success = await cartStore.addToCart(productId.value, quantity.value);

    if (success) {
        alert(`${quantity.value} unidad(es) del producto añadido al carrito`);
    }
};

// Cargar el producto cuando cambie el ID
watch(productId, () => {
    loadProduct();
});

onMounted(() => {
    loadProduct();
});
</script>

<style scoped>
.product-detail {
    max-width: 1000px;
    margin: 0 auto;
    padding: 30px 0;
}

.loading,
.error,
.not-found {
    text-align: center;
    padding: 50px 0;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.error {
    color: var(--accent-color);
}

.product-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    background-color: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.product-image {
    height: 400px;
    overflow: hidden;
}

.product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.product-info {
    padding: 30px;
    display: flex;
    flex-direction: column;
}

.product-title {
    font-size: 1.8rem;
    color: var(--secondary-color);
    margin-bottom: 10px;
}

.product-price {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--secondary-color);
    margin-bottom: 20px;
}

.product-description {
    margin-bottom: 30px;
}

.product-description h3 {
    margin-bottom: 10px;
    font-size: 1.2rem;
    color: var(--secondary-color);
}

.product-description p {
    line-height: 1.7;
    color: #555;
}

.product-actions {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-top: auto;
}

.quantity-selector {
    display: flex;
    align-items: center;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    overflow: hidden;
}

.quantity-selector button {
    background-color: #f5f5f5;
    color: var(--secondary-color);
    border: none;
    padding: 8px 15px;
    font-weight: bold;
    cursor: pointer;
}

.quantity-selector span {
    padding: 8px 15px;
    min-width: 40px;
    text-align: center;
}

.add-to-cart-btn {
    flex-grow: 1;
    padding: 12px;
    font-size: 1rem;
    background-color: var(--primary-color);
}

.back-link {
    display: inline-block;
    margin-top: 15px;
    color: var(--primary-color);
    text-decoration: none;
}

@media (max-width: 768px) {
    .product-container {
        grid-template-columns: 1fr;
    }

    .product-image {
        height: 300px;
    }
}
</style>