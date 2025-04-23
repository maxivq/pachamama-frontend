<template>
  <div class="product-form-container">
    <h2>{{ isEditing ? 'Editar Producto' : 'Añadir Nuevo Producto' }}</h2>
    
    <div v-if="formError" class="form-error">
      {{ formError }}
    </div>
    
    <form @submit.prevent="submitForm" class="product-form">
      <div class="form-group">
        <label for="title">Título</label>
        <input 
          type="text" 
          id="title" 
          v-model="productData.title"
          required
          placeholder="Nombre del producto"
          :class="{ 'error-field': fieldErrors.title }"
        >
        <span v-if="fieldErrors.title" class="field-error">{{ fieldErrors.title }}</span>
      </div>
      
      <div class="form-group">
        <label for="description">Descripción</label>
        <textarea 
          id="description" 
          v-model="productData.description"
          required
          placeholder="Descripción detallada del producto"
          rows="4"
          :class="{ 'error-field': fieldErrors.description }"
        ></textarea>
        <span v-if="fieldErrors.description" class="field-error">{{ fieldErrors.description }}</span>
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
          :class="{ 'error-field': fieldErrors.price }"
        >
        <span v-if="fieldErrors.price" class="field-error">{{ fieldErrors.price }}</span>
      </div>
      
      <!-- Campo de categoría -->
      <div class="form-group">
        <label for="category">Categoría</label>
        <select 
          id="category" 
          v-model="productData.category"
          required
          :class="{ 'error-field': fieldErrors.category }"
        >
          <option 
            v-for="category in displayCategories" 
            :key="category.value" 
            :value="category.value"
          >
            {{ category.label }}
          </option>
          <option value="new">+ Añadir nueva categoría</option>
        </select>
        <span v-if="fieldErrors.category" class="field-error">{{ fieldErrors.category }}</span>
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
          :class="{ 'error-field': fieldErrors.newCategory }"
        >
        <span v-if="fieldErrors.newCategory" class="field-error">{{ fieldErrors.newCategory }}</span>
      </div>
      
      <div class="form-group">
        <label for="imageUrl">URL de la imagen</label>
        <input 
          type="text" 
          id="imageUrl" 
          v-model="productData.imageUrl"
          placeholder="https://ejemplo.com/imagen.jpg"
          :class="{ 'error-field': fieldErrors.imageUrl }"
        >
        <span v-if="fieldErrors.imageUrl" class="field-error">{{ fieldErrors.imageUrl }}</span>
        <small class="form-hint">Si se deja vacío, se usará una imagen genérica</small>
      </div>
      
      <div class="form-actions">
        <button type="submit" class="save-btn" :disabled="isSubmitting">
          {{ isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar Producto' : 'Crear Producto') }}
        </button>
        
        <button 
          type="button" 
          v-if="isEditing" 
          @click="cancel"
          class="cancel-btn"
          :disabled="isSubmitting"
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
import { useNotificationStore } from '../../stores/notificationStore';
import { capitalizeFirstLetter } from '../../utils/stringUtils';

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
const notificationStore = useNotificationStore();
const categories = computed(() => productStore.categories);
const productData = reactive({ ...props.initialData });
const newCategory = ref('');
const formError = ref('');
const fieldErrors = reactive({});
const isSubmitting = ref(false);

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
    formError.value = '';
    Object.keys(fieldErrors).forEach(key => fieldErrors[key] = '');
  }
});

// Categorías formateadas para mostrar
const displayCategories = computed(() => {
  return categories.value.map(category => ({
    value: category, // Valor original
    label: capitalizeFirstLetter(category) // Capitalizado para mostrar
  }));
});

// Validar campos antes de enviar
const validateForm = () => {
  let isValid = true;
  formError.value = '';
  Object.keys(fieldErrors).forEach(key => fieldErrors[key] = '');
  
  // Validar título
  if (!productData.title || productData.title.trim() === '') {
    fieldErrors.title = 'El título es obligatorio';
    isValid = false;
  } else if (productData.title.length < 3) {
    fieldErrors.title = 'El título debe tener al menos 3 caracteres';
    isValid = false;
  }
  
  // Validar descripción
  if (!productData.description || productData.description.trim() === '') {
    fieldErrors.description = 'La descripción es obligatoria';
    isValid = false;
  } else if (productData.description.length < 10) {
    fieldErrors.description = 'La descripción debe tener al menos 10 caracteres';
    isValid = false;
  }
  
  // Validar precio
  if (!productData.price || isNaN(productData.price) || Number(productData.price) <= 0) {
    fieldErrors.price = 'El precio debe ser un número mayor que cero';
    isValid = false;
  }
  
  // Validar categoría
  if (productData.category === 'new' && (!newCategory.value || newCategory.value.trim() === '')) {
    fieldErrors.newCategory = 'Debes ingresar un nombre para la nueva categoría';
    isValid = false;
  }
  
  return isValid;
};

const submitForm = async () => {
  try {
    console.log("Formulario enviado con datos:", productData);
    
    // Validar formulario
    if (!validateForm()) {
      formError.value = 'Por favor, corrige los errores en el formulario';
      return;
    }
    
    isSubmitting.value = true;
    
    // Crear una copia del objeto para no modificar el original
    const formData = { ...productData };
    
    // Si seleccionaron nueva categoría, usar el valor ingresado y capitalizar
    if (formData.category === 'new' && newCategory.value) {
      // Capitalizar la nueva categoría
      formData.category = capitalizeFirstLetter(newCategory.value);
      
      // Añadir la nueva categoría localmente para actualización inmediata
      if (newCategory.value && !categories.value.includes(formData.category)) {
        productStore.categories.push(formData.category);
      }
    }
    
    console.log("Datos a enviar:", formData);
    // Emitir evento con los datos del formulario
    await emit('submit', formData);
    
    // Limpiar formulario
    formError.value = '';
    Object.keys(fieldErrors).forEach(key => fieldErrors[key] = '');
  } catch (error) {
    console.error('Error al enviar formulario:', error);
    formError.value = error.message || 'Ocurrió un error al guardar. Inténtalo de nuevo.';
    notificationStore.error(formError.value);
  } finally {
    isSubmitting.value = false;
  }
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

.save-btn:hover:not(:disabled) {
  background-color: var(--primary-dark, #4c7332);
}

.save-btn:disabled {
  background-color: #aaa;
  cursor: not-allowed;
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

.cancel-btn:hover:not(:disabled) {
  background-color: rgba(183, 28, 28, 0.1);
}

.cancel-btn:disabled {
  color: #aaa;
  border-color: #aaa;
  cursor: not-allowed;
}

select {
  background-color: white;
}

.form-error {
  background-color: #ffebee;
  color: #b71c1c;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  border-left: 4px solid #b71c1c;
}

.field-error {
  color: #b71c1c;
  font-size: 0.8rem;
  margin-top: 2px;
}

.error-field {
  border-color: #b71c1c !important;
  background-color: #fff8f8;
}

.form-hint {
  color: #666;
  font-size: 0.8rem;
  margin-top: 2px;
}
</style>