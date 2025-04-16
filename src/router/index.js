import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import('../views/ProductDetailView.vue')
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('../views/CartView.vue')
  },
  {
    path: '/admin-access',
    name: 'AdminAccess',
    component: () => import('../views/AdminAccessView.vue')
  },
  // Rutas protegidas de administración
  {
    path: '/admin',
    name: 'Admin',
    redirect: '/admin/products',
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/products',
    name: 'AdminProducts',
    component: () => import('../views/admin/ProductsView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Guardia de navegación para proteger rutas
router.beforeEach(async (to, from, next) => {
    // Inicializar el almacén de autenticación
    const authStore = useAuthStore()
    
    // Si intentamos acceder a una ruta protegida
    if (to.matched.some(record => record.meta.requiresAuth)) {
      // Verificar la validez del token JWT
      await authStore.initAuth()
      
      // Verificar si el usuario es administrador
      if (!authStore.isAdmin) {
        // Redirigir a la página de acceso administrativo
        next({ name: 'AdminAccess' })
      } else {
        // El usuario es administrador, permitir acceso
        next()
      }
    } else {
      // La ruta no requiere autenticación
      next()
    }
  })

export default router