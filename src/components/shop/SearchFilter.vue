<template>
    <div class="search-filter-container">
      <div class="search-bar">
        <input 
          type="text" 
          v-model="searchTerm" 
          placeholder="Buscar productos..." 
          @input="handleSearch"
        />
        <button class="search-button" @click="search">
          🔍
        </button>
      </div>
      
      <div class="category-filter">
        <select v-model="selectedCategory" @change="filterByCategory">
          <option value="all">Todas las categorías</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, watch } from 'vue';
  import { useProductStore } from '../../stores/productStore';
  
  const productStore = useProductStore();
  
  const searchTerm = ref('');
  const selectedCategory = ref('all');
  const categories = computed(() => productStore.categories);
  
  // Debounce para la búsqueda
  let searchTimeout = null;
  const handleSearch = () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      search();
    }, 300);
  };
  
  const search = () => {
    productStore.setSearchTerm(searchTerm.value);
    productStore.fetchProducts();
  };
  
  const filterByCategory = () => {
    productStore.setCategory(selectedCategory.value);
    productStore.fetchProducts();
  };
  
  // Cargar categorías al montar el componente
  onMounted(async () => {
    await productStore.fetchCategories();
  });
  
  // Sincronizar con store
  watch(() => productStore.searchTerm, (newValue) => {
    searchTerm.value = newValue;
  });
  
  watch(() => productStore.selectedCategory, (newValue) => {
    selectedCategory.value = newValue;
  });

  // Cargar categorías al montar el componente y usar watch para mantenerlas frescas
onMounted(async () => {
  await productStore.fetchCategories();
});

// Refrescar categorías cuando el componente se active (en caso de navegación)
const refreshCategories = async () => {
  if (categories.value.length === 0) {
    await productStore.fetchCategories();
  }
};

// Si estás usando vue-router, puedes usar el hook onBeforeRouteEnter
// O podemos usar una actualización periódica
const setupPeriodicRefresh = () => {
  // Verificar categorías cada vez que el usuario regresa a la página
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      refreshCategories();
    }
  });
};

onMounted(() => {
  refreshCategories();
  setupPeriodicRefresh();
});

// Limpiar event listener
onUnmounted(() => {
  document.removeEventListener('visibilitychange', refreshCategories);
});
  </script>
  
  <style scoped>
  .search-filter-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    gap: 15px;
    flex-wrap: wrap;
    background-color: white;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .search-bar {
    display: flex;
    flex: 1;
    min-width: 200px;
  }
  
  .search-bar input {
    flex: 1;
    padding: 10px 15px;
    border: 1px solid var(--border-color);
    border-radius: 4px 0 0 4px;
    font-size: 1rem;
  }
  
  .search-button {
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 0 4px 4px 0;
    padding: 0 15px;
    cursor: pointer;
  }
  
  .category-filter select {
    padding: 10px 15px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background-color: white;
    font-size: 1rem;
    min-width: 180px;
  }
  
  @media (max-width: 600px) {
    .search-filter-container {
      flex-direction: column;
      align-items: stretch;
    }
    
    .search-bar, .category-filter {
      width: 100%;
    }
  }
  </style>