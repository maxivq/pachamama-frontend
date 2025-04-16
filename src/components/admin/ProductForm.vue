<template>
  <!-- Formulario existente... -->
  
  <!-- Añadir este campo después del precio -->
  <div class="form-group">
    <label for="category">Categoría:</label>
    <select id="category" v-model="productData.category" required>
      <option v-for="category in categories" :key="category" :value="category">
        {{ category }}
      </option>
      <option value="new">+ Añadir nueva categoría</option>
    </select>
  </div>
  
  <!-- Campo para nueva categoría -->
  <div class="form-group" v-if="productData.category === 'new'">
    <label for="newCategory">Nueva categoría:</label>
    <input 
      type="text" 
      id="newCategory" 
      v-model="newCategory"
      placeholder="Ingresa el nombre de la categoría" 
      required
    />
  </div>
  
  <!-- Resto del formulario... -->
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useProductStore } from '../../stores/productStore';

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({
      title: '',
      description: '',
      price: '',
      imageUrl: '',
      category: 'General' // Valor por defecto
    })
  },
  mode: {
    type: String,
    default: 'create'
  }
});

const emit = defineEmits(['submit', 'cancel']);

const productStore = useProductStore();
const productData = reactive({ ...props.initialData });
const newCategory = ref('');
const categories = ref(['General']); // Valor por defecto

// Cargar categorías existentes
onMounted(async () => {
  await productStore.fetchCategories();
  categories.value = [...productStore.categories];
  
  // Si no existe 'General', añadirlo
  if (!categories.value.includes('General')) {
    categories.value.push('General');
  }
});

// Lógica para manejar nueva categoría
watch(newCategory, (value) => {
  if (productData.category === 'new' && value) {
    // Si escriben un nuevo valor, se usa ese
    productData.actualCategory = value;
  }
});

const submitForm = () => {
  // Si seleccionaron "nueva categoría", usar el valor ingresado
  if (productData.category === 'new') {
    productData.category = newCategory.value;
  }
  
  emit('submit', { ...productData });
};

// Resto del script...
</script>