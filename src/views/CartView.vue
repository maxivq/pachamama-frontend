<template>
    <div class="cart-page">
        <h1>Carrito de compra</h1>

        <div v-if="loading" class="loading">
            <p>Cargando carrito...</p>
        </div>

        <div v-else-if="error" class="error">
            <p>{{ error }}</p>
            <button @click="loadCart">Intentar nuevamente</button>
        </div>

        <div v-else-if="!cartItems.length" class="empty-cart">
            <p>Tu carrito está vacío</p>
            <router-link to="/" class="continue-shopping">Continuar comprando</router-link>
        </div>

        <div v-else class="cart-container">
            <div class="cart-items">
                <div class="cart-header">
                    <h2>Productos en tu carrito</h2>
                    <button @click="confirmClearCart" class="clear-cart-btn">
                        Vaciar carrito
                    </button>
                </div>

                <div v-for="item in cartItems" :key="item.product._id" class="cart-item">
                    <div class="item-image">
                        <img :src="item.product.imageUrl" :alt="item.product.title" @error="handleImageError">
                    </div>

                    <div class="item-details">
                        <h3>{{ item.product.title }}</h3>
                        <p class="item-price">
                            ${{ item.product.price.toFixed(2) }} × {{ item.quantity }}
                        </p>
                    </div>

                    <div class="item-actions">
                        <div class="item-subtotal">
                            ${{ (item.product.price * item.quantity).toFixed(2) }}
                        </div>

                        <button @click="removeItem(item.product._id)" class="remove-item-btn">
                            <span class="remove-icon">🗑️</span>
                        </button>
                    </div>
                </div>
            </div>

            <div class="cart-summary">
                <h2>Resumen</h2>

                <div class="summary-row">
                    <span>Subtotal</span>
                    <span>${{ cartTotal.toFixed(2) }}</span>
                </div>

                <div class="summary-total">
                    <span>Total</span>
                    <span>${{ cartTotal.toFixed(2) }}</span>
                </div>

                <div class="checkout-form">
                    <h3>Información de Contacto</h3>

                    <div class="form-group">
                        <label for="name">Nombre completo</label>
                        <input type="text" id="name" v-model="customerInfo.name" placeholder="Tu nombre completo">
                    </div>

                    <div class="form-group">
                        <label for="address">Dirección de entrega</label>
                        <input type="text" id="address" v-model="customerInfo.address" placeholder="Tu dirección">
                    </div>

                    <div class="form-group">
                        <label for="phone">Teléfono (opcional)</label>
                        <input type="text" id="phone" v-model="customerInfo.phone" placeholder="Tu número de teléfono">
                    </div>

                    <div class="form-group">
                        <label for="comments">Comentarios adicionales</label>
                        <textarea id="comments" v-model="customerInfo.comments"
                            placeholder="Especificaciones sobre el pedido, horarios de entrega, etc."
                            rows="3"></textarea>
                    </div>
                </div>

                <button @click="checkout" class="checkout-btn">
                    Finalizar compra por WhatsApp
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useCartStore } from '../stores/cartStore';

const cartStore = useCartStore();

const loading = computed(() => cartStore.loading);
const error = computed(() => cartStore.error);
const cartItems = computed(() => cartStore.cart?.items || []);
const cartTotal = computed(() => cartStore.cartTotal);

// Información del cliente para el checkout
const customerInfo = ref({
    name: '',
    address: '',
    phone: '',
    comments: ''
});

const fallbackImage = 'https://via.placeholder.com/80x80?text=Producto';

const loadCart = async () => {
    await cartStore.fetchCart();
};

const handleImageError = (e) => {
    e.target.src = fallbackImage;
};

// Eliminar un producto específico del carrito
const removeItem = async (productId) => {
    if (confirm('¿Quieres eliminar este producto de tu carrito?')) {
        await cartStore.removeFromCart(productId);
    }
};

// Vaciar todo el carrito
const confirmClearCart = () => {
    if (confirm('¿Estás seguro de que quieres vaciar todo el carrito?')) {
        cartStore.clearCart();
    }
};

const checkout = async () => {
    if (cartItems.value.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }

    if (!customerInfo.value.name || !customerInfo.value.address) {
        alert('Por favor completa tu nombre y dirección para continuar');
        return;
    }

    const success = await cartStore.checkoutToWhatsApp(customerInfo.value);

    if (success) {
        // Resetear el formulario después de un checkout exitoso
        customerInfo.value = {
            name: '',
            address: '',
            phone: '',
            comments: ''
        };
    } else {
        alert('Ha ocurrido un error al procesar tu pedido. Por favor, intenta nuevamente.');
    }
};

onMounted(() => {
    loadCart();
});
</script>

<style scoped>
.cart-page {
    max-width: 1000px;
    margin: 0 auto;
    padding: 30px 0;
}

h1 {
    margin-bottom: 30px;
    text-align: center;
    color: var(--secondary-color);
}

.loading,
.error,
.empty-cart {
    text-align: center;
    padding: 50px 0;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.error {
    color: var(--accent-color);
}

.continue-shopping {
    display: inline-block;
    margin-top: 15px;
    color: var(--primary-color);
    text-decoration: none;
}

.cart-container {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 30px;
}

.cart-items {
    background-color: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    padding: 20px;
}

.cart-item {
    display: flex;
    align-items: center;
    padding: 15px 0;
    border-bottom: 1px solid var(--border-color);
}

.cart-item:last-child {
    border-bottom: none;
}

.item-image {
    width: 80px;
    height: 80px;
    overflow: hidden;
    border-radius: 4px;
    margin-right: 15px;
}

.item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.item-details {
    flex-grow: 1;
}

.item-details h3 {
    font-size: 1.1rem;
    margin-bottom: 5px;
}

.item-price {
    color: #666;
    font-size: 0.9rem;
}

.item-subtotal {
    font-weight: bold;
    font-size: 1.1rem;
    color: var(--secondary-color);
}

.cart-summary {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    padding: 20px;
    position: sticky;
    top: 20px;
}

.cart-summary h2 {
    margin-bottom: 20px;
    color: var(--secondary-color);
    font-size: 1.3rem;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid var(--border-color);
}

.summary-total {
    display: flex;
    justify-content: space-between;
    margin-top: 15px;
    padding: 15px 0;
    font-weight: bold;
    font-size: 1.2rem;
    color: var(--secondary-color);
}

.checkout-form {
    margin: 20px 0;
}

.checkout-form label {
    display: block;
    margin-bottom: 8px;
    font-size: 0.9rem;
}

.checkout-btn {
    width: 100%;
    padding: 12px;
    background-color: #25D366;
    /* Color de WhatsApp */
    font-size: 1rem;
    margin-top: 10px;
}

.cart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.clear-cart-btn {
    background-color: var(--error-color);
    font-size: 0.85rem;
    padding: 6px 12px;
}

.clear-cart-btn:hover {
    background-color: #d32f2f;
}

.item-actions {
    display: flex;
    align-items: center;
    gap: 10px;
}

.remove-item-btn {
    background-color: transparent;
    color: var(--error-color);
    border: 1px solid var(--error-color);
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
    cursor: pointer;
    transition: all 0.3s;
}

.remove-item-btn:hover {
    background-color: var(--error-color);
    color: white;
}

.remove-icon {
    font-size: 1rem;
}

.cart-item {
    display: flex;
    align-items: center;
    padding: 15px 0;
    border-bottom: 1px solid var(--border-color);
}

.item-image {
    width: 80px;
    height: 80px;
    overflow: hidden;
    border-radius: 4px;
    margin-right: 15px;
}

.item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.item-details {
    flex-grow: 1;
}

.item-details h3 {
    font-size: 1.1rem;
    margin-bottom: 5px;
    color: var(--primary-dark);
}

.item-price {
    color: #666;
    font-size: 0.9rem;
}

.item-subtotal {
    font-weight: bold;
    font-size: 1.1rem;
    color: var(--primary-color);
    margin-right: 10px;
}

@media (max-width: 768px) {
    .cart-container {
        grid-template-columns: 1fr;
    }
}
</style>