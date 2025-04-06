<template>
  <div class="favorites-page">
    <nav-bar></nav-bar>
    
    <div class="container">
      <h1 class="page-title">Избранное</h1>
      
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Загрузка...</p>
      </div>
      
      <div v-else-if="favorites.length === 0" class="empty-favorites">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.03L12 21.35Z" fill="#005BFF" fill-opacity="0.2"/>
          <path d="M16.5 3C14.76 3 13.09 3.81 12 5.09C10.91 3.81 9.24 3 7.5 3C4.42 3 2 5.42 2 8.5C2 12.28 5.4 15.36 10.55 20.03L12 21.35L13.45 20.03C18.6 15.36 22 12.28 22 8.5C22 5.42 19.58 3 16.5 3Z" stroke="#005BFF" stroke-width="2"/>
        </svg>
        <h2>Ваш список избранного пуст</h2>
        <p>Добавляйте товары в избранное, чтобы не потерять их</p>
        <router-link to="/" class="browse-btn">Перейти к покупкам</router-link>
      </div>
      
      <div v-else class="favorites-content">
        <div class="filters">
          <div class="filter-group">
            <label>Сортировка:</label>
            <select v-model="sortOption" @change="sortFavorites">
              <option value="price-asc">По возрастанию цены</option>
              <option value="price-desc">По убыванию цены</option>
            </select>
          </div>
        </div>
        
        <div class="favorites-grid">
          <div v-for="item in favorites" :key="item.id" class="favorite-item">
            <button @click="removeFromFavorites(item.id)" class="remove-favorite">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 18L18 6M6 6L18 18" stroke="#FF4444" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
            <router-link :to="`/product/${item.id}`" class="product-link">
              <div class="product-image">
                <img 
                  v-if="item.imageUrls && item.imageUrls.length > 0"
                  :src="item.imageUrls[0]" 
                  :alt="item.name"
                >
              </div>
              <div class="product-info">
                <h3>{{ item.name }}</h3>
                <div class="price">{{ item.price.toLocaleString('ru-RU') }} ₽</div>
                <div class="attributes">
                  <span v-if="item.size" class="attribute">Размер: {{ item.size }}</span>
                  <span v-if="item.color" class="attribute">Цвет: {{ item.color }}</span>
                </div>
              </div>
            </router-link>
            <button @click="router.push(`/product/${item.id}`)" class="add-to-cart">
              В корзину
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import NavBar from '@/components/NavBar.vue';
import { favoritesService } from '@/services/favoriteService';
import { cartService } from '@/services/cartService';
import router from '@/router';

const favorites = ref([]);
const loading = ref(true);
const sortOption = ref('date');

onMounted(async () => {
  try {
    const response = await favoritesService.getFavorites();
    favorites.value = response.products || [];
  } catch (error) {
    console.error('Ошибка загрузки избранного:', error);
  } finally {
    loading.value = false;
  }
});

const removeFromFavorites = async (itemId) => {
  try {
    await favoritesService.removeFavorite(itemId);
    favorites.value = favorites.value.filter(item => item.id !== itemId);
  } catch (error) {
    console.error('Ошибка удаления из избранного:', error);
  }
};

const addToCart = async (item) => {
  try {
    await cartService.updateItem(item.productVariantId, 1);
  } catch (error) {
    console.error('Ошибка добавления в корзину:', error);
  }
};

const sortFavorites = () => {
  switch (sortOption.value) {
    case 'price-asc':
      favorites.value.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      favorites.value.sort((a, b) => b.price - a.price);
      break;
    default:
      favorites.value.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
  }
};
</script>

<style scoped>
.favorites-page {
  min-height: 100vh;
  background-color: #f8f8f8;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  font-size: 28px;
  color: #333;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 91, 255, 0.1);
  border-radius: 50%;
  border-top-color: #005BFF;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-favorites {
  text-align: center;
  padding: 50px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.empty-favorites h2 {
  font-size: 22px;
  color: #333;
  margin: 20px 0 10px;
}

.empty-favorites p {
  color: #666;
  margin-bottom: 20px;
}

.browse-btn {
  display: inline-block;
  padding: 12px 24px;
  background-color: #005BFF;
  color: white;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;
}

.browse-btn:hover {
  background-color: #0044cc;
}

.filters {
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  font-weight: 500;
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.favorite-item {
  position: relative;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.favorite-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.remove-favorite {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  z-index: 2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.product-link {
  text-decoration: none;
  color: inherit;
}

.product-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.favorite-item:hover .product-image img {
  transform: scale(1.05);
}

.product-info {
  padding: 15px;
}

.product-info h3 {
  margin: 0 0 10px;
  font-size: 16px;
  color: #333;
}

.price {
  font-weight: 700;
  color: #005BFF;
  margin-bottom: 10px;
  font-size: 18px;
}

.attributes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.attribute {
  font-size: 12px;
  color: #666;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
}

.add-to-cart {
  width: calc(100% - 30px);
  margin: 0 15px 15px;
  padding: 10px;
  background-color: #005BFF;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.add-to-cart:hover {
  background-color: #0044cc;
}
</style>