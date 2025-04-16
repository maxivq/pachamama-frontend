<template>
  <div class="app-container">
    <header>
      <Navbar />
    </header>
    
    <main class="content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
    <footer>
      <Footer />
    </footer>
    
    <!-- Añadir componente Toast -->
    <Toast />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useCartStore } from './stores/cartStore';
import Navbar from './components/layout/NavBar.vue';
import Footer from './components/layout/Footer.vue';
import Toast from './components/common/Toast.vue';

const cartStore = useCartStore();

onMounted(() => {
  // Inicializar carrito al cargar la aplicación
  cartStore.initSession();
  cartStore.fetchCart();
});
</script>

<style>
:root {
  --primary-color: #2e7d32;       /* Verde oscuro para elementos principales */
  --primary-light: #60ad5e;       /* Verde claro para hover */
  --primary-dark: #005005;        /* Verde más oscuro para elementos de énfasis */
  --secondary-color: #1b5e20;     /* Verde más oscuro para navbar/footer */
  --accent-color: #81c784;        /* Verde más brillante para elementos de acento */
  --light-color: #f1f8e9;         /* Verde muy claro casi blanco para fondos */
  --dark-color: #1b1c1b;          /* Casi negro con tinte verde para textos */
  --text-color: #263238;          /* Color de texto principal */
  --text-light: #f5f5f5;          /* Color de texto claro para fondos oscuros */
  --border-color: #c8e6c9;        /* Verde muy claro para bordes */
  --error-color: #b71c1c;         /* Rojo para errores */
  --success-color: #388e3c;       /* Verde para éxito */
  --background-color: #f5f9f5;    /* Color de fondo global con tinte verde */
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: var(--text-color);
  background-color: var(--background-color);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content {
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* Transiciones entre páginas */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Estilos globales para botones */
button {
  padding: 8px 16px;
  background-color: var(--primary-color);
  color: var(--text-light);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

button:hover {
  background-color: var(--primary-light);
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* WhatsApp checkout button */
.checkout-btn {
  background-color: #128C7E; /* Color oficial de WhatsApp */
}

.checkout-btn:hover {
  background-color: #075E54; /* Color más oscuro de WhatsApp */
}

/* Actualizar enlaces */
a {
  color: var(--primary-color);
  text-decoration: none;
  transition: color 0.3s;
}

a:hover {
  color: var(--primary-light);
}

/* Estilos para formularios */
input, textarea, select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
  transition: border-color 0.3s;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.error-text {
  color: var(--accent-color);
  font-size: 0.85rem;
  margin-top: 5px;
}
</style>