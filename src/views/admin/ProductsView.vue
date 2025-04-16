<template>
    <div class="admin-products">
      <h1>Administración de Productos</h1>
      
      <div class="admin-container">
        <div class="product-form-container">
          <h2>{{ isEditing ? 'Editar Producto' : 'Añadir Nuevo Producto' }}</h2>
          
          <form @submit.prevent="saveProduct" class="product-form">
            <div class="form-group">
              <label for="title">Título</label>
              <input 
                type="text" 
                id="title" 
                v-model="form.title"
                required
                placeholder="Nombre del producto"
              >
            </div>
            
            <div class="form-group">
              <label for="description">Descripción</label>
              <textarea 
                id="description" 
                v-model="form.description"
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
                v-model="form.price"
                required
                min="0"
                step="0.01"
                placeholder="0.00"
              >
            </div>
            
            <div class="form-group">
              <label for="imageUrl">URL de la imagen</label>
              <input 
                type="text" 
                id="imageUrl" 
                v-model="form.imageUrl"
                placeholder="https://ejemplo.com/imagen.jpg"
              >
            </div>
            
            <div class="form-actions">
              <button type="submit" class="save-btn">
                {{ isEditing ? 'Actualizar Producto' : 'Crear Producto' }}
              </button>
              
              <button 
                type="button" 
                v-if="isEditing" 
                @click="cancelEdit"
                class="cancel-btn"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
        
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
  
  const productStore = useProductStore();
  
  const loading = computed(() => productStore.loading);
  const error = computed(() => productStore.error);
  const products = computed(() => productStore.products);
  
  const isEditing = ref(false);
  const editingId = ref(null);
  
  const form = ref({
    title: '',
    description: '',
    price: 0,
    imageUrl: ''
  });
  
  const loadProducts = async () => {
    await productStore.fetchProducts();
  };
  
  const resetForm = () => {
    form.value = {
      title: '',
      description: '',
      price: 0,
      imageUrl: ''
    };
    isEditing.value = false;
    editingId.value = null;
  };
  
  const editProduct = (product) => {
    form.value = { ...product };
    isEditing.value = true;
    editingId.value = product._id;
    
    // Scroll al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const cancelEdit = () => {
    resetForm();
  };
  
  const saveProduct = async () => {
    try {
      if (isEditing.value) {
        // Actualizar producto existente
        await productStore.updateProduct(editingId.value, form.value);
        alert('Producto actualizado correctamente');
      } else {
        // Crear nuevo producto
        await productStore.createProduct(form.value);
        alert('Producto creado correctamente');
      }
      
      resetForm();
      loadProducts();
    } catch (error) {
      alert(`Error: ${error.message || 'No se pudo guardar el producto'}`);
    }
  };
  
  const confirmDelete = async (id) => {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await productStore.deleteProduct(id);
        alert('Producto eliminado correctamente');
      } catch (error) {
        alert(`Error: ${error.message || 'No se pudo eliminar el producto'}`);
      }
    }
  };
  
  onMounted(() => {
    loadProducts();
  });
  </script>
  
  <style scoped>
  .admin-products {
    max-width: 1200px;
    margin: 0 auto;
    padding: 30px 0;
  }
  
  h1 {
    margin-bottom: 30px;
    text-align: center;
    color: var(--secondary-color);
  }
  
  .admin-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
  }
  
  .product-form-container,
  .products-list-container {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    padding: 20px;
  }
  
  h2 {
    margin-bottom: 20px;
    color: var(--secondary-color);
    font-size: 1.3rem;
  }
  
  .product-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .form-group {
    margin-bottom: 10px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  
  .form-actions {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }
  
  .save-btn {
    background-color: var(--primary-color);
  }
  
  .cancel-btn {
    background-color: #ccc;
  }
  
  .products-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .product-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
  }
  
  .product-price {
    color: #666;
    font-size: 0.9rem;
  }
  
  .product-actions {
    display: flex;
    gap: 10px;
  }
  
  .edit-btn {
    background-color: #3498db;
  }
  
  .delete-btn {
    background-color: #e74c3c;
  }
  
  .loading, .error, .empty-state {
    text-align: center;
    padding: 30px 0;
  }
  
  .error {
    color: var(--accent-color);
  }
  
  @media (max-width: 768px) {
    .admin-container {
      grid-template-columns: 1fr;
    }
  }
  </style>