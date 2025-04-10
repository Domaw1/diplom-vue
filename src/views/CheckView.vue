<template>
    <div class="receipt-container">
      <div class="receipt" ref="receiptContent">
        <h2>Чек № {{ order.id }}</h2>
        <p>Дата: {{ formattedDate }}</p>
        
        <div class="items">
          <div v-for="item in order.orderItems" :key="item.id" class="item">
            <div class="item-name">
              {{ item.productVariant.product.name }} ({{ item.productVariant.size }})
            </div>
            <div class="item-quantity">×{{ item.quantity }}</div>
            <div class="item-price">{{ itemTotal(item) }} ₽</div>
          </div>
        </div>
        
        <div class="total">Итого: {{ orderTotal }} ₽</div>
        
        <div class="qr-code" v-if="showQR">
          <img :src="qrCodeUrl" alt="QR код для оплаты">
        </div>
        <div style="display: flex; justify-content: center; margin-top: 30px;">
          <h2>Спасибо за покупку!</h2>
        </div>
      </div>
  
      <div class="actions">
        <button @click="downloadReceipt" class="btn">Скачать чек</button>
        <button @click="sendByEmail" class="btn">Отправить на email</button>
        <button @click="toggleQR" class="btn">
          {{ showQR ? 'Скрыть QR' : 'Показать QR' }}
        </button>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue';
  import html2canvas from 'html2canvas';
  import QRCode from 'qrcode';
  import { useRoute } from 'vue-router';
  import axios from 'axios';
  
  export default {
    setup() {
      const route = useRoute();
      const order = ref({
        id: '',
        orderItems: [],
        createdAt: ''
      });
      const showQR = ref(false);
      const qrCodeUrl = ref('');
      const receiptContent = ref(null);
  
      const loadOrder = async () => {
        try {
          const response = await axios.get(`http://localhost:8080/api/v1/order/user/${route.params.id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          order.value = response.data;
        } catch (error) {
          console.error('Ошибка загрузки заказа:', error);
        }
      };
  
      const formattedDate = computed(() => {
        return new Date(order.value.createdAt).toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      });
  
      const itemTotal = (item) => {
        return (item.productVariant.product.price * item.quantity).toFixed(2);
      };
  
      const orderTotal = computed(() => {
        return order.value.orderItems.reduce((total, item) => {
          return total + (item.productVariant.product.price * item.quantity);
        }, 0).toFixed(2);
      });
  
      const generateQR = async () => {
        const paymentData = JSON.stringify({
          orderId: order.value.id,
          amount: orderTotal.value,
          items: order.value.orderItems.map(item => ({
            name: item.productVariant.product.name,
            quantity: item.quantity
          }))
        });
        qrCodeUrl.value = await QRCode.toDataURL(paymentData);
      };
  
      const toggleQR = async () => {
        if (!qrCodeUrl.value) {
          await generateQR();
        }
        showQR.value = !showQR.value;
      };
  
      const downloadReceipt = async () => {
        const canvas = await html2canvas(receiptContent.value);
        const link = document.createElement('a');
        link.download = `чек-${order.value.id}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      };
  
      const sendByEmail = async () => {
        try {
          const canvas = await html2canvas(receiptContent.value);
          const receiptImage = canvas.toDataURL('image/png');
          
          await axios.post('http://localhost:8080/api/v1/email/send-receipt', {
            orderId: order.value.id,
            receiptImage: receiptImage
          }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          alert('Чек успешно отправлен на email!');
        } catch (error) {
          console.error('Ошибка отправки чека:', error);
          alert('Не удалось отправить чек');
        }
      };
  
      onMounted(loadOrder);
  
      return {
        order,
        formattedDate,
        itemTotal,
        orderTotal,
        showQR,
        qrCodeUrl,
        receiptContent,
        toggleQR,
        downloadReceipt,
        sendByEmail
      };
    }
  };
  </script>
  
  <style scoped>
  .receipt-container {
    max-width: 500px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .receipt {
    background: white;
    padding: 20px;
    border: 1px solid #ddd;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    font-family: 'Courier New', monospace;
  }
  
  .items {
    margin: 20px 0;
  }
  
  .item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    border-bottom: 1px dashed #eee;
    padding-bottom: 5px;
  }
  
  .item-name {
    flex: 2;
  }
  
  .item-quantity {
    flex: 1;
    text-align: center;
  }
  
  .item-price {
    flex: 1;
    text-align: right;
  }
  
  .total {
    font-weight: bold;
    text-align: right;
    margin-top: 20px;
    font-size: 1.2em;
    border-top: 2px solid #000;
    padding-top: 10px;
  }
  
  .qr-code {
    margin: 20px auto;
    text-align: center;
  }
  
  .qr-code img {
    width: 200px;
    height: 200px;
  }
  
  .actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
    justify-content: center;
  }
  
  .btn {
    padding: 10px 15px;
    background: #42b983;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .btn:hover {
    background: #369f6e;
  }
  </style>