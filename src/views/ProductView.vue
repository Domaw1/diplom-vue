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
                <span class="brand">{{ product.brand }}</span>
                <span class="dot">●</span>
                <span class="rating">
                    ⭐ {{ product.rating !== 0 ? product.rating : 'Нет оценок' }}
                </span>
                </div>

                <p class="description">{{ product.description }}</p>

                <div class="price">{{ formattedPrice }}</div>

                <div class="variants" v-if="product.productVariants?.length">
                <div
                    v-for="(variant, index) in product.productVariants"
                    :key="index"
                    class="variant"
                >
                    <p style="margin-bottom: 10px; font-size: 20px;">Размер: {{ variant.size }} </p>
                    <p style="margin-bottom: 10px; font-size: 20px;">Цвет: {{ variant.color }} </p>
                    <p style="margin-bottom: 10px; font-size: 20px;">В наличии: {{ variant.quantity }} </p>
                </div>
                </div>

                <div v-if="product.reviews?.length" class="reviews">
                <h3>Отзывы:</h3>
                <div v-for="(review, i) in product.reviews" :key="i">
                    <p>{{ review.user }}</p>
                    <p>{{ review.createdAt }}</p>
                    <p>{{ review.comment }}</p>
                    <p>{{ review.rating }}</p>
                </div>
                </div>
                <div v-else class="no-reviews">Пока нет отзывов.</div>
                <div class="actions">
                    <button class="btn" @click="addToCart">Добавить в корзину</button>
                    <button class="btn wish" @click="addToWishlist">В избранное</button>
                </div>
                
            </div>
            <div class="add-review">
                <h3>Оставить отзыв</h3>
                <textarea v-model="newReviewText" placeholder="Ваш отзыв..." rows="3"></textarea>
                
                <div class="rating-input">
                    <label>Оценка:</label>
                    <select v-model="newReviewRating">
                    <option disabled value="">Выберите</option>
                    <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
                    </select>
                </div>
                
                <button class="btn" @click="submitReview">Отправить</button>
            </div>

        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import router from '@/router';
import { LoadProductById } from '@/db/api';
import NavBar from '@/components/NavBar.vue';

const product = ref({});

const route = useRoute();

const id = route.params.id;

onMounted(async () => {
    try {
        product.value = await LoadProductById(id);
    } catch (error) {
        console.error('Ошибка загрузки товара:', error);
    }
});

const formattedPrice = computed(() => {
return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2
}).format(product.value.price);
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
}

.detail-container {
display: flex;
flex-wrap: wrap;
gap: 40px;
}

.images-section {
flex: 1;
min-width: 300px;
}

.product-image {
width: 100%;
max-width: 400px;
object-fit: contain;
border: 1px solid #ddd;
margin-bottom: 15px;
}

.info-section {
flex: 2;
min-width: 300px;
}

.brand-rating {
font-size: 14px;
color: #666;
display: flex;
align-items: center;
gap: 6px;
margin-bottom: 10px;
}

.description {
font-size: 16px;
margin: 15px 0;
}

.price {
font-size: 24px;
font-weight: bold;
color: #333;
margin-bottom: 20px;
}

.variants {
margin-top: 20px;
font-size: 14px;
}

.variant {
margin-bottom: 10px;
background-color: #f9f9f9;
padding: 10px;
border-radius: 6px;
}

.reviews {
margin-top: 30px;
}

.no-reviews {
color: #999;
margin-top: 20px;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: white;
  background-color: #4caf50;
  transition: background 0.2s;
}

.btn:hover {
  background-color: #45a045;
}

.btn.wish {
  background-color: #ff4081;
}

.btn.wish:hover {
  background-color: #e73370;
}

.add-review {
  margin-top: 30px;
  padding: 15px;
  border-top: 1px solid #ddd;
}

.add-review textarea {
  width: 100%;
  padding: 8px;
  margin: 10px 0;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.rating-input {
  margin-bottom: 10px;
}

.rating-input select {
  padding: 6px;
  font-size: 14px;
  margin-left: 10px;
}

</style>
