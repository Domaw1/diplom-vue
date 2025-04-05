<template>
  <header class="navbar">
    <div class="navbar-container">
      <div class="logo" @click="router.push('/')">
        SHOP
      </div>

      <div class="search-bar">
        <input
          type="text"
          placeholder="Найти..."
          v-model="searchQuery"
          @keyup.enter="performSearch"
        >
        <button class="search-button" @click="performSearch">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" stroke-width="2"/>
            <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <div class="actions">
        <div class="catalog-wrapper">
          <button class="action-btn" @click="toggleCatalogMenu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6H21V8H3V6ZM3 11H21V13H3V11ZM3 16H21V18H3V16Z" fill="currentColor"/>
            </svg>
            <span>Каталог</span>
          </button>
          
          <div v-if="isCatalogOpen" class="catalog-dropdown">
            <div class="catalog-grid">
              <router-link
                v-for="category in categories.value"
                :key="category.id"
                :to="getCategoryLink(category)"
                class="catalog-item"
                @click="closeCatalogMenu"
              >
                <span>{{ category.name }}</span>
              </router-link>
            </div>
          </div>
        </div>

        <button class="action-btn" @click="goToProfile()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="currentColor"/>
            <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="currentColor"/>
          </svg>
          <span>Профиль</span>
        </button>

        <button class="action-btn" @click="router.push('/favourites')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.03L12 21.35Z" fill="currentColor"/>
          </svg>
          <span>Избранное</span>
        </button>

        <button class="action-btn cart-btn" @click="router.push('/cart')">
          <div class="cart-badge" v-if="cartItemsCount > 0">{{ cartItemsCount }}</div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 18C5.9 18 5.01 18.9 5.01 20C5.01 21.1 5.9 22 7 22C8.1 22 9 21.1 9 20C9 18.9 8.1 18 7 18ZM1 2V4H3L6.6 11.59L5.25 14.04C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.28 15 7.17 14.89 7.17 14.75L7.2 14.63L8.1 13H15.55C16.3 13 16.96 12.59 17.3 11.97L20.88 5.48C20.96 5.34 21 5.17 21 5C21 4.45 20.55 4 20 4H5.21L4.27 2H1ZM17 18C15.9 18 15.01 18.9 15.01 20C15.01 21.1 15.9 22 17 22C18.1 22 19 21.1 19 20C19 18.9 18.1 18 17 18Z" fill="currentColor"/>
          </svg>
          <span>Корзина</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { LoadCategories } from "@/db/api";

const router = useRouter();
const route = useRoute();

const searchQuery = ref('');
const cartItemsCount = ref(0);
const categories = ref([]);
const isCatalogOpen = ref(false);
const emits = defineEmits(["search-input"])

const toggleCatalogMenu = () => {
  isCatalogOpen.value = !isCatalogOpen.value;
};

const closeCatalogMenu = () => {
  isCatalogOpen.value = false;
};

const getCategoryLink = (category) => {
  return { 
    path: '/', 
    query: { ...route.query, subCategory: category.name } 
  };
};

const goToProfile = () => {
  if (localStorage.getItem('token')) {
    router.push('/profile');
  } else {
    router.push('/auth');
  }
};

const performSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/', query: { ...route.query, search: searchQuery.value } });
    emits('filter-change'), {
      input: searchQuery.value
    }
  }
  else {
    router.push({ path: '/' });
  }
};

onMounted(async () => {
  try {
    categories.value = await LoadCategories();
  } catch (error) {
    console.error('Ошибка загрузки категорий:', error);
  }
});
</script>

<style scoped>
.navbar {
  background-color: #005BFF;
  color: white;
  padding: 12px 0;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-container {
  display: flex;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  gap: 20px;
}

.logo {
  font-size: 28px;
  font-weight: 700;
  cursor: pointer;
  margin-right: 20px;
}

.search-bar {
  flex: 1;
  display: flex;
  max-width: 600px;
}

.search-bar input {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px 0 0 8px;
  font-size: 16px;
  outline: none;
}

.search-button {
  background-color: white;
  border: none;
  border-radius: 0 8px 8px 0;
  padding: 0 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #005BFF;
}

.actions {
  display: flex;
  gap: 15px;
}

.action-btn {
  background: none;
  border: none;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  font-size: 12px;
  position: relative;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.action-btn svg {
  width: 24px;
  height: 24px;
}

.cart-btn {
  position: relative;
}

.cart-badge {
  position: absolute;
  top: -2px;
  right: 0;
  background-color: #FFD700;
  color: #005BFF;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
}

/* Стили для выпадающего меню каталога */
.catalog-wrapper {
  position: relative;
}

.catalog-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 300px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  padding: 16px;
  margin-top: 8px;
  animation: fadeIn 0.2s ease-out;
}

.catalog-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.catalog-item {
  padding: 8px 12px;
  border-radius: 4px;
  color: #333;
  text-decoration: none;
  transition: background-color 0.2s;
  font-size: 14px;
}

.catalog-item:hover {
  background-color: #f5f5f5;
  color: #005BFF;
}

.dropdown-arrow {
  margin-left: 4px;
  transition: transform 0.2s;
}

.rotate-180 {
  transform: rotate(180deg);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>