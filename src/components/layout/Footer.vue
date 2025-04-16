<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-content">
        <p>&copy; {{ currentYear }} Pachamama. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue';

const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped>
.footer {
  background-color: var(--secondary-color);
  color: var(--text-light);
  padding: 20px 0;
  margin-top: 50px;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-content {
  text-align: center;
  font-size: 0.9rem;
}
</style>