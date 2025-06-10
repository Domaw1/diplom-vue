<template>
  <div class="product-card" @click="goToProductView(product.id)">
    <div class="product-image">
      <img
          v-if="product.imageUrls && product.imageUrls.length > 0"
          :src="product.imageUrls[0]"
          :alt="product.name"
      >
      <div v-else class="image-placeholder">No Image</div>
    </div>

    <div class="product-info">
      <div class="price-section">
        <span class="current-price">{{ formattedPrice }}</span>
      </div>

      <div class="brand">{{ product.brand }} ● Оригинал</div>

      <h3 class="product-name">{{ product.name }}</h3>

      <div class="product-variants">
        <span v-for="variant in product.productVariants" :key="variant.id" class="variant-tag">
            {{ variant.size }}/Кол-во: {{ variant.quantity }}
        </span>
      </div>
      <div class="rating-section">
        <span class="rating">⭐ {{ product.rating !== 0 ? product.rating : "Нет оценок" }}</span>
        <span v-if="product.reviews?.length" class="reviews-count">► {{ product.reviews.length }} Отзыва</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import router from '@/router';
import { computed } from 'vue';

const props = defineProps(["product"]);

const goToProductView = (productId) => {
  router.push({name: 'product', params: {id: productId}});
}

const formattedPrice = computed(() => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2
  }).format(props.product.price);
});
</script>

<style scoped>
.product-card {
  width: 250px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  font-family: Arial, sans-serif;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image {
  height: 200px;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-variants {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.variant-tag {
  background: #e8f0fe;
  padding: 0.3rem 0.5rem;
  border-radius: 6px;
  font-size: 0.8rem;
  color: #1a73e8;
}

.product-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.image-placeholder {
  color: #999;
}

.product-info {
  padding: 12px;
}

.price-section {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.current-price {
  font-weight: bold;
  font-size: 18px;
  color: #333;
}

.discount {
  color: #ff5722;
  font-size: 14px;
  font-weight: 500;
}

.brand {
  color: #666;
  font-size: 12px;
  margin-bottom: 8px;
}

.product-name {
  font-size: 14px;
  margin: 8px 0;
  line-height: 1.3;
  height: 36px;
  overflow: hidden;
  display: -webkit-box;
  /* -webkit-line-clamp: 2; */
  -webkit-box-orient: vertical;
}

.rating-section {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
}

.rating {
  color: #ffa000;
  font-weight: bold;
}
</style>