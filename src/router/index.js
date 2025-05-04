import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { compile } from 'vue'
import AuthComponent from '@/components/AuthComponent.vue'
import ProfileView from '@/views/ProfileView.vue'
import CartView from '@/views/CartView.vue'
import FavouritesView from '@/views/FavouritesView.vue'
import ProductCard from '@/components/ProductCard.vue'
import ProductView from '@/views/ProductView.vue'
import CheckView from '@/views/CheckView.vue'
import OAuthSuccesView from '@/views/OAuthSuccesView.vue'
import AdminView from '@/views/AdminView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/auth',
    name: 'auth',
    component: AuthComponent
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView
  },
  {
    path: '/cart',
    name: 'cart',
    component: CartView
  },
  {
    path: '/favourites',
    name: 'favourites',
    component: FavouritesView
  },
  {
    path: '/product/:id',
    name: 'product',
    component: ProductView
  },
  {
    path: '/check/:id',
    name: 'check',
    component: CheckView
  },
  {
    path: '/oauth-success',
    name: 'OauthSuccess',
    component: OAuthSuccesView
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminView
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
