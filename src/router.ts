import { createRouter, createWebHistory } from 'vue-router'

import DeckDetailPage from '@/pages/DeckDetailPage.vue'
import DeckFormPage from '@/pages/DeckFormPage.vue'
import HomePage from '@/pages/HomePage.vue'
import SignInPage from '@/pages/SignInPage.vue'
import SignUpPage from '@/pages/SignUpPage.vue'
import { useAuthStore } from '@/store/auth'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    guestOnly?: boolean
  }
}

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  CREATE_DECK: '/decks/create',
  DECK_DETAIL: '/decks/:id',
  EDIT_DECK: '/decks/:id/edit',
} as const

const routes = [
  {
    path: ROUTES.HOME,
    name: 'Home',
    component: HomePage,
    meta: { requiresAuth: true },
  },
  {
    path: ROUTES.LOGIN,
    name: 'Login',
    component: SignInPage,
    meta: { guestOnly: true },
  },
  {
    path: ROUTES.REGISTER,
    name: 'Register',
    component: SignUpPage,
    meta: { guestOnly: true },
  },
  {
    path: ROUTES.CREATE_DECK,
    name: 'CreateDeck',
    component: DeckFormPage,
    meta: { requiresAuth: true },
  },
  {
    path: ROUTES.DECK_DETAIL,
    name: 'DeckDetail',
    component: DeckDetailPage,
    meta: { requiresAuth: true },
  },
  {
    path: ROUTES.EDIT_DECK,
    name: 'EditDeck',
    component: DeckFormPage,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return ROUTES.LOGIN
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return ROUTES.HOME
  }

  return true
})

export default router
