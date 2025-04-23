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
          <option 
            v-for="category in displayCategories" 
            :key="category.value" 
            :value="category.value"
          >
            {{ category.label }}
          </option>
        </select>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue';
  import { useProductStore } from '../../stores/productStore';
  import { capitalizeFirstLetter } from '../../utils/stringUtils';
  
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
  
  // Sincronizar con store
  watch(() => productStore.searchTerm, (newValue) => {
    searchTerm.value = newValue;
  });
  
  watch(() => productStore.selectedCategory, (newValue) => {
    selectedCategory.value = newValue;
  });

  // Categorías formateadas para mostrar
  const displayCategories = computed(() => {
    return categories.value.map(category => ({
      value: category, // Valor original para filtrado
      label: capitalizeFirstLetter(category) // Valor capitalizado para mostrar
    }));
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
    border: 1px solid #ddd;
    border-radius: 4px 0 0 4px;
    font-size: 1rem;
  }
  
  .search-button {
    background-color: #5f8e3e;
    color: white;
    border: none;
    border-radius: 0 4px 4px 0;
    padding: 0 15px;
    cursor: pointer;
  }
  
  .category-filter select {
    padding: 10px 15px;
    border: 1px solid #ddd;
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