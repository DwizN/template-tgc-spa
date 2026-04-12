import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from './stores/auth'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  CREATE_DECK: '/decks/create',
  GAME: '/game',
} as const

const routes = [
  {
    path: ROUTES.HOME,

    component: () => import('./pages/HomePage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: ROUTES.LOGIN,
    component: () => import('./pages/LoginPage.vue'),
    meta: { guestOnly: true },
  },
  {
    path: ROUTES.REGISTER,
    component: () => import('./pages/RegisterPage.vue'),
    meta: { guestOnly: true },
  },
  {
    path: ROUTES.CREATE_DECK,
    component: () => import('./views/CreateDeckView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: ROUTES.GAME,
    component: () => import('./pages/GamePage.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next(ROUTES.LOGIN)
  } else if (to.meta.guestOnly && auth.isAuthenticated) {
    next(ROUTES.HOME)
  } else {
    next()
  }
})

export default router
