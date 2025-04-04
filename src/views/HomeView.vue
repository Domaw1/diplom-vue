<template>
  <div class="home">
    <h1>Наши товары</h1>
    <div class="products-container">
      <div class="filters-column">
        <filter-component @filter-change="handleFilterChange"></filter-component>
      </div>

      <div class="products-column">
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
import { ref, onMounted } from 'vue';
import { LoadProducts, fetchFilteredProducts } from "@/db/api";
import ProductCard from "@/components/ProductCard.vue";
import FilterComponent from "@/components/FilterComponent.vue";

const products = ref([]);

const handleFilterChange = async (filters) => {
  try {
    products.value = await fetchFilteredProducts(filters);
  } catch (error) {
    console.error('Ошибка фильтрации:', error);
  }
};

onMounted(async () => {
  try {
    products.value = await LoadProducts();
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

@media (max-width: 768px) {
  .products-container {
    flex-direction: column;
  }

  .filters-column {
    width: 100%;
    position: static;
  }
}
</style>