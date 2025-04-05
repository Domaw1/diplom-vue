<template>
    <nav-bar></nav-bar>
    <div class="cart-page">
      <div class="page-header">
        <h1>Корзина</h1>
        <button v-if="cartItems.length > 0" @click="clearCart" class="clear-btn">Очистить корзину</button>
      </div>
  
      <div class="cart-content">
        <div v-if="loading" class="loading">Загрузка...</div>
        
        <div v-else-if="cartItems.length === 0" class="empty-cart">
          <p>Ваша корзина пуста</p>
          <router-link to="/" class="browse-btn">Перейти к покупкам</router-link>
        </div>
        
        <div v-else class="cart-items">
          <div class="items-list">
            <div v-for="item in cartItems" :key="item.id" class="cart-item">
              <div class="item-image">
                <img
                  v-if="item.productVariant.product.imageUrls && item.productVariant.product.imageUrls.length > 0"
                  :src="item.productVariant.product.imageUrls[0]"
                  :alt="item.productVariant.product.name"
                >
              </div>
              
              <div class="item-details">
                <h3>{{ item.productVariant.product.name }}</h3>
                <div class="item-attributes">
                  <span class="attribute">Размер: {{ item.productVariant.size }}</span>
                  <span class="attribute">Цвет: {{ item.productVariant.color }}</span>
                </div>
                <div class="item-price">
                  {{ item.productVariant.product.price.toLocaleString('ru-RU') }} ₽
                </div>
              </div>
              
              <div class="item-quantity">
                <button @click="decreaseQuantity(item)" class="quantity-btn">-</button>
                <span class="quantity">{{ item.quantity }}</span>
                <button @click="increaseQuantity(item)" class="quantity-btn">+</button>
              </div>
              
              <div class="item-total">
                {{ (item.quantity * item.productVariant.product.price).toLocaleString('ru-RU') }} ₽
              </div>
              
              <button @click="removeItem(item)" class="remove-btn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <div class="cart-summary">
            <div class="summary-header">
              <h3>Итого</h3>
            </div>
            <div class="summary-details">
              <div class="summary-row">
                <span>Товары ({{ totalItems }})</span>
                <span>{{ subtotal.toLocaleString('ru-RU') }} ₽</span>
              </div>
              <div class="summary-row total">
                <span>К оплате</span>
                <span>{{ total.toLocaleString('ru-RU') }} ₽</span>
              </div>
            </div>
            <button @click="checkout" class="checkout-btn">Оформить заказ</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import NavBar from '@/components/NavBar.vue';
  import { cartService } from '@/services/cartService';
  
  const router = useRouter();
  
  const cartItems = ref([]);
  const loading = ref(true);
  
  onMounted(async () => {
    try {
      const response = await cartService.getCart();
      
      cartItems.value = response.cartItems || [];
      
    } catch (error) {
      console.error('Ошибка загрузки корзины:', error);
    } finally {
      loading.value = false;
    }
  });
  
  const subtotal = computed(() => {
    return cartItems.value.reduce((sum, item) => {
      return sum + (item.quantity * item.productVariant.product.price);
    }, 0);
  });
  
  const totalItems = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + item.quantity, 0);
  });
  
  const total = computed(() => {
    return subtotal.value;
  });
  
  const increaseQuantity = async (item) => {
    try {
      await cartService.updateItem(item.productVariant.id, item.quantity + 1);
      item.quantity++;
    } catch (error) {
      console.error('Ошибка обновления количества:', error);
    }
  };
  
  const decreaseQuantity = async (item) => {
    if (item.quantity > 1) {
      try {
        await cartService.removeItem(item.id);
        item.quantity--;
      } catch (error) {
        console.error('Ошибка обновления количества:', error);
      }
    }
  };
  
  const removeItem = async (item) => {
    try {
      await cartService.removeItem(item.id);
      cartItems.value = cartItems.value.filter(i => i.id !== item.id);
    } catch (error) {
      console.error('Ошибка удаления товара:', error);
    }
  };
  
  const clearCart = async () => {
    try {
      await cartService.clearCart();
      cartItems.value = [];
    } catch (error) {
      console.error('Ошибка очистки корзины:', error);
    }
  };
  
  const checkout = () => {
    router.push('/checkout');
  };
  </script>
  
  <style scoped>
  .cart-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  .clear-btn {
    padding: 0.5rem 1rem;
    background-color: #ff4444;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .clear-btn:hover {
    background-color: #cc0000;
  }
  
  .loading, .empty-cart {
    text-align: center;
    padding: 3rem;
    color: #666;
  }
  
  .empty-cart p {
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }
  
  .browse-btn {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background-color: #005BFF;
    color: white;
    border-radius: 4px;
    text-decoration: none;
    transition: background-color 0.2s;
  }
  
  .browse-btn:hover {
    background-color: #0044cc;
  }
  
  .cart-items {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 2rem;
  }
  
  .items-list {
    display: grid;
    gap: 1.5rem;
  }
  
  .cart-item {
    display: grid;
    grid-template-columns: 100px 1fr 150px 100px 40px;
    gap: 1.5rem;
    align-items: center;
    padding: 1.5rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .item-image img {
    width: 100%;
    height: auto;
    border-radius: 4px;
    object-fit: cover;
  }
  
  .item-details h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    color: #333;
  }
  
  .item-attributes {
    display: flex;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }
  
  .attribute {
    font-size: 0.9rem;
    color: #666;
  }
  
  .item-price {
    font-weight: 500;
    color: #333;
  }
  
  .item-quantity {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .quantity-btn {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    font-size: 1rem;
  }
  
  .quantity-btn:hover {
    background-color: #f5f5f5;
  }
  
  .quantity {
    min-width: 30px;
    text-align: center;
  }
  
  .item-total {
    font-weight: 600;
    color: #005BFF;
    text-align: right;
  }
  
  .remove-btn {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: none;
    cursor: pointer;
    color: #999;
  }
  
  .remove-btn:hover {
    color: #ff4444;
  }
  
  .remove-btn svg {
    width: 20px;
    height: 20px;
  }
  
  .cart-summary {
    padding: 1.5rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    align-self: flex-start;
    position: sticky;
    top: 1rem;
  }
  
  .summary-header {
    padding-bottom: 1rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid #eee;
  }
  
  .summary-header h3 {
    margin: 0;
    font-size: 1.2rem;
  }
  
  .summary-details {
    display: grid;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .summary-row {
    display: flex;
    justify-content: space-between;
  }
  
  .summary-row.total {
    font-weight: 600;
    font-size: 1.1rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
  }
  
  .checkout-btn {
    width: 100%;
    padding: 1rem;
    background-color: #005BFF;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .checkout-btn:hover {
    background-color: #0044cc;
  }
  
  @media (max-width: 768px) {
    .cart-items {
      grid-template-columns: 1fr;
    }
    
    .cart-item {
      grid-template-columns: 80px 1fr;
      grid-template-areas:
        "image details"
        "quantity total"
        "remove remove";
      gap: 1rem;
    }
    
    .item-image {
      grid-area: image;
    }
    
    .item-details {
      grid-area: details;
    }
    
    .item-quantity {
      grid-area: quantity;
      justify-self: start;
    }
    
    .item-total {
      grid-area: total;
      justify-self: end;
      align-self: center;
    }
    
    .remove-btn {
      grid-area: remove;
      justify-self: end;
      margin-top: 1rem;
    }
    
    .cart-summary {
      position: static;
    }
  }
  </style>