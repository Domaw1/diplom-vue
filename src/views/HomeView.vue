<template>
  <nav-bar @search-input="applySearch"></nav-bar>
  <div class="home">
    <h1>Наши товары</h1>
    <div class="products-container">
      <div class="filters-column">
        <filter-component @filter-change="handleFilterChange"></filter-component>
      </div>

      <div v-if="isProductsExist">
          <h1 style="color: red;">Кажется, здесь пусто...</h1>
      </div>
      <div v-else class="products-column">
        <div class="products-grid">
          <product-card
              v-for="product in products.value"
              :key="product.id"
              :product="product"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { LoadProducts, fetchFilteredProducts } from "@/db/api";
import ProductCard from "@/components/ProductCard.vue";
import FilterComponent from "@/components/FilterComponent.vue";
import { useRoute } from 'vue-router';
import NavBar from "@/components/NavBar.vue";

const route = useRoute();
const products = ref([]);
const isProductsExist = ref(false);

const applySearch = async () => {
  const searchTerm = route.query.search?.toLowerCase() || '';
  
  if (searchTerm === '') {
    products.value = await LoadProducts();
    return;
  }

  products.value.value = products.value.value.filter(product =>
    product.name.toLowerCase().includes(searchTerm) ||
    (product.description && product.description.toLowerCase().includes(searchTerm))
  );

  isProductsExist.value = products.value.value.length === 0;
};

const handleFilterChange = async (filters) => {
  try {
    if (route.query.subCategory) {
      filters.subCategory = route.query.subCategory;
    }
    products.value = await fetchFilteredProducts(filters);
    if(route.query.search)
      applySearch();
  } catch (error) {
    console.error('Ошибка фильтрации:', error);
  }
};

watch(() => route.query.subCategory, () => {
  handleFilterChange({ subCategory: route.query.subCategory });
});

watch(() => route.query.search, () => {
  applySearch();
});

onMounted(async () => {
  try {
    const filters = {};
    if (route.query.subCategory) {
      filters.subCategory = route.query.subCategory;
      products.value = await fetchFilteredProducts(filters);
    } else {
      products.value = await LoadProducts();
    }

    // applySearch();
  } catch (error) {
    console.error('Ошибка загрузки товаров:', error);
  }
});

</script>

<style scoped>
.home {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.products-container {
  display: flex;
  gap: 20px;
}

.filters-column {
  width: 250px;
  flex-shrink: 0;
  position: sticky;
  top: 20px;
  align-self: flex-start;
  margin-right: 50px;
}

.products-column {
  flex-grow: 1;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  padding: 20px 0;
}
</style>