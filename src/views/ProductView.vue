<template>
  <nav-bar></nav-bar>
  <div class="product-detail">
      <button class="back-btn" @click="router.back()">← Назад</button>

      <div class="detail-container">
          <div class="images-section">
              <img
              v-for="(img, index) in product.imageUrls"
              :key="index"
              :src="img"
              class="product-image"
              :alt="product.name"
              />
          </div>

          <div class="info-section">
              <h1>{{ product.name }}</h1>
              <div class="brand-rating">
              <span class="brand">{{ product.brand }} ● Оригинал</span>
              <span class="dot">●</span>
              <span class="rating">
                  ⭐ {{ product.rating !== 0 ? product.rating : 'Нет оценок' }}
              </span>
              </div>

              <p class="description">{{ product.description }}</p>

              <div class="price-section">
                  <span class="current-price">{{ formattedPrice }}</span>
              </div>

              <div class="variants" v-if="product.productVariants?.length">
                  <h3>Доступные варианты:</h3>
                  <div class="variant-options">
                      <button
                          v-for="(variant, index) in product.productVariants"
                          :key="index"
                          class="variant-option"
                          :class="{ 'selected': selectedVariantId === variant.id }"
                          @click="selectVariant(variant)"
                      >
                          <span>Размер: {{ variant.size }}</span>
                          <span>Цвет: {{ variant.color }}</span>
                          <span v-if="variant.quantity > 0" class="in-stock">В наличии: {{ variant.quantity }} шт.</span>
                          <span v-else class="out-of-stock">Нет в наличии</span>
                      </button>
                  </div>
              </div>

              <div class="actions">
                  <button 
                      class="btn" 
                      @click="addToCart" 
                      :disabled="!selectedVariantId || isInCart"
                      :class="{ 'in-cart': isInCart }"
                  >
                      {{ isInCart ? '✓ В корзине' : 'Добавить в корзину' }}
                  </button>
                  
                  <button 
                      class="btn wish" 
                      @click="toggleWishlist" 
                      :class="{ 'in-wishlist': isInWishlist }"
                  >
                      {{ isInWishlist ? '✓ В избранном' : 'В избранное' }}
                  </button>
              </div>
              
              <div class="reviews-header">
                  <h3>Отзывы ({{ product.reviews?.length || 0 }})</h3>
                  <button class="add-review-btn" @click="scrollToReviewForm">Оставить отзыв</button>
              </div>
              
              <div v-if="product.reviews?.length" class="reviews-section">
                  <div v-for="(review, i) in product.reviews" :key="i" class="review">
                      <div class="review-header">
                          <span class="review-user">{{ review.user }}</span>
                          <span class="review-date">{{ formatDate(review.createdAt) }}</span>
                          <span class="review-rating">⭐ {{ review.rating }}</span>
                      </div>
                      <p class="review-comment">{{ review.comment }}</p>
                  </div>
              </div>
              <div v-else class="no-reviews">Пока нет отзывов.</div>
          </div>
          
          <div class="add-review" ref="reviewForm">
            <h3>Оставить отзыв</h3>
            <div class="rating-stars">
                <span 
                    v-for="star in 5" 
                    :key="star"
                    class="star"
                    :class="{ 'filled': star <= newReviewRating }"
                    @click="newReviewRating = star"
                    @mouseover="hoverRating = star"
                    @mouseleave="hoverRating = 0"
                >
                    ★
                </span>
                <span class="rating-text">
                    {{ ratingText }}
                </span>
            </div>
            <textarea v-model="newReviewText" placeholder="Ваш отзыв..." rows="3"></textarea>
            <button class="btn" @click="submitReview" :disabled="!newReviewRating || !newReviewText">Отправить</button>
        </div>
      </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { LoadProductById, AddReview } from '@/db/api';
import { cartService } from '@/services/cartService';
import { favoritesService } from '@/services/favoriteService';
import NavBar from '@/components/NavBar.vue';
import router from '@/router';

const route = useRoute();
const id = route.params.id;
const product = ref({});
const selectedVariantId = ref(null);
const selectedVariant = ref(null);
const isInCart = ref(false);
const isInWishlist = ref(false);
const cartItems = ref([]);
const newReviewRating = ref("");
const newReviewText = ref("");
const reviewForm = ref(null);

const loadData = async () => {
  try {
    product.value = await LoadProductById(id);
    
    if (product.value.productVariants?.length) {
      const availableVariant = product.value.productVariants.find(v => v.quantity > 0);
      if (availableVariant) selectVariant(availableVariant);
    }
    
    await checkCartStatus();
    await checkWishlistStatus();
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
  }
};

const checkCartStatus = async () => {
  try {
    cartItems.value = await cartService.getCart();
    
    isInCart.value = cartItems.value.cartItems
      .some(item => item.productVariant.id === selectedVariantId.value);
  } catch (error) {
    console.error('Ошибка проверки корзины:', error);
  }
};

const checkWishlistStatus = async () => {
  try {
    const favorites = await favoritesService.getFavorites();
    isInWishlist.value = favorites.products.some(fav => fav.id === product.value.id);
  } catch (error) {
    console.error('Ошибка проверки избранного:', error);
  }
};

const addToCart = async () => {
  if (!selectedVariantId.value) return;
  
  try {
    await cartService.updateItem(selectedVariantId.value, 1);
    isInCart.value = true;
    cartItems.value = await cartService.getCart();
  } catch (error) {
    console.error('Ошибка добавления в корзину:', error);
  }
};

const toggleWishlist = async () => {
  try {
    if (isInWishlist.value) {
      await favoritesService.removeFavorite(product.value.id);
    } else {
      await favoritesService.addFavorite(product.value.id);
    }
    isInWishlist.value = !isInWishlist.value;
  } catch (error) {
    console.error('Ошибка обновления избранного:', error);
  }
};

const selectVariant = (variant) => {
  selectedVariantId.value = variant.id;
  selectedVariant.value = variant;
  try {
    isInCart.value = cartItems.value.cartItems
      .some(item => item.productVariant.id === selectedVariantId.value);
  } catch (error) {
    console.log(error);
  }
};

onMounted(loadData);

const formattedPrice = computed(() => {
  return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 2
  }).format(product.value.price);
});

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          hour: '2-digit',
          minute: '2-digit'
        });
};

const scrollToReviewForm = () => {
  reviewForm.value?.scrollIntoView({ behavior: 'smooth' });
};

const submitReview = async () => {
  if (newReviewText.value && newReviewRating.value) {
      console.log('Отправлен отзыв:', {
          comment: newReviewText.value,
          rating: newReviewRating.value
      });
      try {
        await AddReview(product.value.id, newReviewText.value, newReviewRating.value);
        console.log("Отзыв добавлен");
        loadData();
      } catch (error) {
        throw error;
      }
      newReviewText.value = '';
      newReviewRating.value = '';
  }
};

const hoverRating = ref(0);

const ratingText = computed(() => {
    if (!newReviewRating.value && !hoverRating.value) return 'Оцените товар';
    const rating = hoverRating.value || newReviewRating.value;
    const texts = ['Ужасно', 'Плохо', 'Нормально', 'Хорошо', 'Отлично'];
    return texts[rating - 1];
});
</script>

<style scoped>
.product-detail {
  max-width: 1200px;
  margin: 30px auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.back-btn {
  background: none;
  border: none;
  color: #007bff;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 20px;
  padding: 5px 0;
}

.back-btn:hover {
  text-decoration: underline;
}

.detail-container {
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
}

.images-section {
  flex: 1;
  min-width: 300px;
  max-width: 500px;
}

.product-image {
  width: 100%;
  max-width: 100%;
  height: auto;
  object-fit: contain;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 15px;
  background-color: #f5f5f5;
}

.info-section {
  flex: 1;
  min-width: 300px;
  max-width: 600px;
}

h1 {
  font-size: 24px;
  margin-bottom: 10px;
  color: #333;
}

.brand-rating {
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 15px;
}

.brand {
  font-weight: 500;
}

.rating {
  color: #ffa000;
  font-weight: bold;
}

.description {
  font-size: 14px;
  line-height: 1.5;
  color: #444;
  margin: 20px 0;
}

.price-section {
  margin: 20px 0;
}

.current-price {
  font-weight: bold;
  font-size: 24px;
  color: #333;
}

.variants {
  margin: 25px 0;
  border-top: 1px solid #e0e0e0;
  padding-top: 15px;
}

.variants h3 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #333;
}

.variant-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.variant-option {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: #fff;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 14px;
  transition: all 0.2s;
}

.variant-option:hover {
  border-color: #aaa;
}

.variant-option.selected {
  border-color: #4caf50;
  background-color: #f0f9f0;
}

.in-stock {
  color: #4caf50;
  font-weight: 500;
}

.out-of-stock {
  color: #f44336;
}

.actions {
  display: flex;
  gap: 12px;
  margin: 25px 0;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: white;
  background-color: #4caf50;
  transition: all 0.2s;
}

.btn:hover:not(:disabled) {
  background-color: #3d8b40;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.7;
}

.btn.wish {
  background-color: #ff4081;
}

.btn.wish:hover {
  background-color: #e73370;
}

.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 30px;
  border-top: 1px solid #e0e0e0;
  padding-top: 20px;
}

.add-review-btn {
  background: none;
  border: none;
  color: #007bff;
  font-size: 14px;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 4px;
}

.add-review-btn:hover {
  background-color: #f0f7ff;
}

.reviews-section {
  margin-top: 15px;
}

.review {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 15px;
}

.review-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 14px;
}

.review-user {
  font-weight: bold;
  color: #333;
}

.review-date {
  color: #666;
}

.review-rating {
  color: #ffa000;
  font-weight: bold;
}

.review-comment {
  font-size: 14px;
  line-height: 1.5;
  color: #444;
  margin: 0;
}

.no-reviews {
  color: #999;
  font-size: 14px;
  margin-top: 20px;
  text-align: center;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 6px;
}

.add-review {
  width: 100%;
  margin-top: 40px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.add-review h3 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #333;
}

.add-review textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: Arial, sans-serif;
  font-size: 14px;
  margin-bottom: 15px;
  resize: vertical;
  min-height: 80px;
}

.rating-input {
  margin-bottom: 15px;
}

.rating-input label {
  margin-right: 10px;
  font-size: 14px;
}

.rating-input select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.rating-stars {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 15px;
    font-size: 24px;
}

.star {
    color: #ddd;
    cursor: pointer;
    transition: color 0.2s;
    position: relative;
}

.star.filled {
    color: #ffc107;
}

.star:hover {
    color: #ffc107;
}

.rating-text {
    margin-left: 10px;
    font-size: 14px;
    color: #666;
}

.star:hover ~ .star {
    color: #ddd;
}

.btn.in-cart {
  background-color: #6c757d;
}

.btn.in-cart:hover {
  background-color: #5a6268;
}

.btn.in-wishlist {
  background-color: #6c757d;
}

.btn.in-wishlist:hover {
  background-color: #5a6268;
}
</style>