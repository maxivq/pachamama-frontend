<template>
    <div class="product-form-container">
      <h2>{{ isEditing ? 'Editar Producto' : 'Añadir Nuevo Producto' }}</h2>
      
      <form @submit.prevent="submitForm" class="product-form">
        <div class="form-group">
          <label for="title">Título</label>
          <input 
            type="text" 
            id="title" 
            v-model="productData.title"
            required
            placeholder="Nombre del producto"
          >
        </div>
        
        <div class="form-group">
          <label for="description">Descripción</label>
          <textarea 
            id="description" 
            v-model="productData.description"
            required
            placeholder="Descripción detallada del producto"
            rows="4"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label for="price">Precio ($)</label>
          <input 
            type="number" 
            id="price" 
            v-model="productData.price"
            required
            min="0"
            step="0.01"
            placeholder="0.00"
          >
        </div>
        
        <!-- Campo de categoría -->
        <div class="form-group">
          <label for="category">Categoría</label>
          <select 
            id="category" 
            v-model="productData.category"
            required
          >
            <option value="General">General</option>
            <option v-for="category in categories" 
              :key="category" 
              :value="category"
              v-if="category !== 'General'"
            >
              {{ category }}
            </option>
            <option value="new">+ Añadir nueva categoría</option>
          </select>
        </div>
        
        <!-- Campo para nueva categoría -->
        <div class="form-group" v-if="productData.category === 'new'">
          <label for="newCategory">Nueva categoría</label>
          <input 
            type="text" 
            id="newCategory" 
            v-model="newCategory"
            required
            placeholder="Nombre de la nueva categoría"
          >
        </div>
        
        <div class="form-group">
          <label for="imageUrl">URL de la imagen</label>
          <input 
            type="text" 
            id="imageUrl" 
            v-model="productData.imageUrl"
            placeholder="https://ejemplo.com/imagen.jpg"
            required
          >
        </div>
        
        <div class="form-actions">
          <button type="submit" class="save-btn">
            {{ isEditing ? 'Actualizar Producto' : 'Crear Producto' }}
          </button>
          
          <button 
            type="button" 
            v-if="isEditing" 
            @click="cancel"
            class="cancel-btn"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, computed, onMounted, watch } from 'vue';
  import { useProductStore } from '../../stores/productStore';
  
  const props = defineProps({
    initialData: {
      type: Object,
      default: () => ({
        title: '',
        description: '',
        price: 0,
        imageUrl: '',
        category: 'General'
      })
    },
    isEditing: {
      type: Boolean,
      default: false
    }
  });
  
  const emit = defineEmits(['submit', 'cancel']);
  
  const productStore = useProductStore();
  const categories = computed(() => productStore.categories);
  const productData = reactive({ ...props.initialData });
  const newCategory = ref('');
  
  // Cargar categorías existentes
  onMounted(async () => {
    if (categories.value.length === 0) {
      await productStore.fetchCategories();
    }
  });
  
  // Si cambian las props, actualizar datos reactivos
  watch(() => props.initialData, (newValue) => {
    Object.assign(productData, newValue);
  }, { deep: true });
  
  watch(() => props.isEditing, (newValue) => {
    // Si se cambia de edición a creación, resetear el formulario
    if (!newValue) {
      Object.assign(productData, {
        title: '',
        description: '',
        price: 0,
        imageUrl: '',
        category: 'General'
      });
      newCategory.value = '';
    }
  });
  
  const submitForm = () => {
    console.log("Formulario enviado con datos:", productData);
    
    // Crear una copia del objeto para no modificar el original
    const formData = { ...productData };
    
    // Si seleccionaron nueva categoría, usar el valor ingresado
    if (formData.category === 'new' && newCategory.value) {
      formData.category = newCategory.value;
      
      // Añadir la nueva categoría localmente para actualización inmediata
      if (newCategory.value && !categories.value.includes(newCategory.value)) {
        productStore.categories.push(newCategory.value);
      }
    }
    
    // Validar datos
    if (!formData.title || !formData.description || formData.price <= 0 || !formData.imageUrl) {
      console.error("Faltan campos requeridos o son inválidos");
      return;
    }
    
    console.log("Datos a enviar:", formData);
    // Emitir evento con los datos del formulario
    emit('submit', formData);
  };
  
  const cancel = () => {
    emit('cancel');
  };
  </script>
  
  <style scoped>
  .product-form-container {
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .product-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  
  .form-group label {
    font-weight: 500;
    font-size: 0.9rem;
    color: var(--text-color);
  }
  
  .form-group input,
  .form-group textarea,
  .form-group select {
    padding: 10px;
    border: 1px solid var(--border-color, #ddd);
    border-radius: 4px;
    font-size: 1rem;
  }
  
  .form-group textarea {
    resize: vertical;
    min-height: 100px;
  }
  
  .form-actions {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }
  
  .save-btn {
    background-color: var(--primary-color, #5f8e3e);
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }
  
  .save-btn:hover {
    background-color: var(--primary-dark, #4c7332);
  }
  
  .cancel-btn {
    background-color: transparent;
    color: var(--error-color, #b71c1c);
    border: 1px solid var(--error-color, #b71c1c);
    padding: 10px 15px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }
  
  .cancel-btn:hover {
    background-color: rgba(183, 28, 28, 0.1);
  }
  
  select {
    background-color: white;
  }
  </style>