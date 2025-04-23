<template>
  <div class="admin-products">
    <h1>Administración de Productos</h1>
    
    <div class="admin-container">
      <!-- Usar el componente separado -->
      <ProductForm 
        :initial-data="formData"
        :is-editing="isEditing"
        @submit="saveProduct"
        @cancel="cancelEdit"
      />
      
      <div class="products-list-container">
        <h2>Productos Existentes</h2>
        
        <div v-if="loading" class="loading">
          <p>Cargando productos...</p>
        </div>
        
        <div v-else-if="error" class="error">
          <p>{{ error }}</p>
          <button @click="loadProducts">Intentar nuevamente</button>
        </div>
        
        <div v-else-if="products.length === 0" class="empty-state">
          <p>No hay productos disponibles</p>
        </div>
        
        <div v-else class="products-list">
          <div v-for="product in products" :key="product._id" class="product-item">
            <div class="product-info">
              <h3>{{ product.title }}</h3>
              <p class="product-price">${{ product.price.toFixed(2) }}</p>
              <p class="product-category">Categoría: {{ product.category || 'General' }}</p>
              <span class="product-category">{{ capitalizeCategory(product.category) }}</span>
            </div>
            
            <div class="product-actions">
              <button @click="editProduct(product)" class="edit-btn">
                Editar
              </button>
              <button @click="confirmDelete(product._id)" class="delete-btn">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useProductStore } from '../../stores/productStore';
import { useNotificationStore } from '../../stores/notificationStore';
import ProductForm from '../../components/admin/ProductForm.vue';
import { capitalizeFirstLetter } from '../../utils/stringUtils';

const productStore = useProductStore();
const notification = useNotificationStore();

const loading = computed(() => productStore.loading);
const error = computed(() => productStore.error);
const products = computed(() => productStore.products);

// Estado para el formulario
const isEditing = ref(false);
const editingId = ref(null);
const formData = ref({
  title: '',
  description: '',
  price: 0,
  imageUrl: '',
  category: 'General'
});

const loadProducts = async () => {
  await productStore.fetchProducts();
};

const resetForm = () => {
  formData.value = {
    title: '',
    description: '',
    price: 0,
    imageUrl: '',
    category: 'General'
  };
  isEditing.value = false;
  editingId.value = null;
};

const editProduct = (product) => {
  formData.value = { 
    ...product,
    category: product.category || 'General' 
  };
  isEditing.value = true;
  editingId.value = product._id;
  
  // Scroll al formulario
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const cancelEdit = () => {
  resetForm();
};

const saveProduct = async (productToSave) => {
  try {
    if (isEditing.value) {
      // Actualizar producto existente
      await productStore.updateProduct(editingId.value, productToSave);
      notification.success('Producto actualizado correctamente');
    } else {
      // Crear nuevo producto
      await productStore.createProduct(productToSave);
      notification.success('Producto creado correctamente');
    }
    
    // Explicitar refresco de categorías
    await productStore.fetchCategories();
    
    resetForm();
    loadProducts();
  } catch (error) {
    notification.error(`Error: ${error.message || 'No se pudo guardar el producto'}`);
  }
};

const confirmDelete = async (id) => {
  if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
    try {
      await productStore.deleteProduct(id);
      notification.success('Producto eliminado correctamente');
      loadProducts();
    } catch (error) {
      notification.error(`Error: ${error.message || 'No se pudo eliminar el producto'}`);
    }
  }
};

const capitalizeCategory = (category) => {
  return capitalizeFirstLetter(category);
};

onMounted(() => {
  loadProducts();
  // No necesitamos llamar directamente a fetchCategories aquí,
  // ya que el componente ProductForm lo hace internamente
});
</script>

<style scoped>
.admin-products {
  padding: 20px;
}

.admin-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.products-list-container {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 15px;
}

.product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid var(--border-color);
}

.product-info h3 {
  margin: 0;
  font-size: 1.1rem;
}

.product-price {
  font-weight: bold;
  color: var(--primary-color);
  margin: 5px 0;
}

.product-category {
  color: var(--accent-color);
  font-size: 0.85rem;
  margin: 0;
}

.product-actions {
  display: flex;
  gap: 8px;
}

.edit-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.delete-btn {
  background-color: var(--error-color);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.loading, .error, .empty-state {
  text-align: center;
  padding: 20px;
}

@media (max-width: 768px) {
  .admin-container {
    grid-template-columns: 1fr;
  }
}
</style>