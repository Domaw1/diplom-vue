<template>
<nav-bar></nav-bar>
<div class="admin-tabs">
    <button 
        @click="activeTab = 'products'" 
        :class="{ active: activeTab === 'products' }"
    >
        Товары
    </button>
    <button 
        @click="activeTab = 'orders'" 
        :class="{ active: activeTab === 'orders' }"
    >
        Заказы
    </button>
    <button 
    @click="activeTab = 'dictionaries'" 
    :class="{ active: activeTab === 'dictionaries' }"
    >
        Справочники
    </button>
</div>
<div v-if="activeTab === 'products'">
    <div class="admin-panel">
        <h1>Панель администратора</h1>
        
        <div class="admin-actions">
        <button @click="showCreateForm = true" class="btn create-btn">
            + Добавить товар
        </button>
        </div>
        
        <div class="products-list">
        <div v-if="loading" class="loading">Загрузка...</div>
        
        <div v-else-if="products.length === 0" class="no-products">
            Товары не найдены
        </div>
        
        <div v-else class="product-cards">
            <div v-for="product in products" :key="product.id" class="product-card">
            <div class="product-images">
                <img 
                v-if="product.imageUrls && product.imageUrls.length > 0"
                :src="product.imageUrls[0]" 
                :alt="product.name"
                class="product-image"
                >
                <div v-else class="no-image">Нет изображения</div>
            </div>
            
            <div class="product-info">
                <h3>{{ product.name }}</h3>
                <p class="brand">{{ product.brand }}</p>
                <p class="price">{{ formatPrice(product.price) }}</p>
                <p class="description">{{ truncateDescription(product.description) }}</p>
                
                <div class="product-variants">
                <span v-for="variant in product.productVariants" :key="variant.id" class="variant-tag">
                    {{ variant.size }}/{{ variant.color }} ({{ variant.quantity }})
                </span>
                </div>
            </div>
            
            <div class="product-actions">
                <button @click="openVariantsEditor(product)" class="btn edit-btn">
                    Редактировать
                </button>
                <button @click="confirmDelete(product.id)" class="btn delete-btn">
                    Удалить
                </button>
            </div>
            </div>
        </div>
        </div>
        
        <div v-if="showCreateForm || currentProduct" class="modal-overlay">
        <div class="modal-content">
            <h2>{{ currentProduct ? 'Редактирование товара' : 'Создание товара' }}</h2>
            
            <form @submit.prevent="submitProductForm" class="product-form">
            <div class="form-group">
                <label>Название</label>
                <input v-model="productForm.name" required>
            </div>
            
            <div class="form-group">
                <label>Бренд</label>
                <select v-model="productForm.brand" required>
                    <option disabled value="">Выберите бренд</option>
                    <option v-for="b in brands.value" :key="b.id" :value="b.name">{{ b.name }}</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Описание</label>
                <textarea v-model="productForm.description" rows="3"></textarea>
            </div>
            
            <div class="form-group">
                <label>Цена</label>
                <input type="number" v-model="productForm.price" min="0" step="0.01" required>
            </div>
            
            <div class="form-group">
                <label>Пол</label>
                <select v-model="productForm.gender">
                    <option value="MALE">Мужской</option>
                    <option value="FEMALE">Женский</option>
                    <option value="UNISEX">Унисекс</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Категория</label>
                <select v-model="productForm.subCategory" required>
                    <option disabled value="">Выберите категорию</option>
                    <option v-for="cat in categories.value" :key="cat.id" :value="cat.name">{{ cat.name }}</option>
                </select>
            </div>

            
            <div class="form-group">
                <label>URL изображений (через запятую)</label>
                <textarea 
                    v-model="productForm.imageUrlsString" 
                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                    rows="2"
                ></textarea>
            </div>
            
            <h3>Варианты товара</h3>
            <div v-for="(variant, index) in productForm.variants" :key="index" class="variant-form">
                <div class="form-group">
                    <label>Размеры</label>
                    <select v-model="variant.size" required>
                        <option v-for="s in sizes" :key="s.id" :value="s.size">{{ s.size }}</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Цвет</label>
                    <select v-model="variant.color" required>
                        <option v-for="c in colors" :key="c.id" :value="c.color">{{ c.color }}</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Количество</label>
                    <input type="number" v-model="variant.quantity" min="0" required>
                </div>
                
                <button 
                    type="button" 
                    @click="removeVariant(index)" 
                    class="btn remove-variant-btn"
                >
                    Удалить вариант
                </button>
            </div>
            
            <button 
                type="button" 
                @click="addVariant" 
                class="btn add-variant-btn"
            >
                + Добавить вариант
            </button>
            
            <div class="form-actions">
                <button 
                    type="button" 
                    @click="closeModal" 
                    class="btn cancel-btn"
                >
                    Отмена
                </button>
                <button type="submit" class="btn submit-btn">
                    {{ currentProduct ? 'Сохранить' : 'Создать' }}
                </button>
            </div>
            </form>
        </div>
        </div>
        <div v-if="showDeleteConfirm" class="modal-overlay">
        <div class="confirm-modal">
            <h3>Подтвердите удаление</h3>
                <p>Вы уверены, что хотите удалить этот товар?</p>
            <div class="confirm-actions">
                <button @click="showDeleteConfirm = false" class="btn cancel-btn">
                    Отмена
                </button>
                <button @click="deleteProduct" class="btn delete-btn">
                    Удалить
                </button>
            </div>
        </div>
        </div>
    </div>
</div>

<div v-if="activeTab === 'orders'">
  <admin-orders></admin-orders>
</div>

<div v-if="activeTab === 'dictionaries'" class="admin-panel">
  <h1>Справочники</h1>

  <div class="dictionary-section">
    <h2>Категории</h2>
    <div v-for="cat in categories.value" :key="cat.id" class="dictionary-item">
      <input v-model="cat.name" />
      <button @click="updateCategory(cat)">Сохранить</button>
      <button @click="deleteCategory(cat)">Удалить</button>
    </div>
    <div class="add-form">
      <input v-model="newCategory" placeholder="Новая категория" />
      <button @click="addCategory()">Добавить</button>
    </div>
  </div>

  <div class="dictionary-section">
    <h2>Бренды</h2>
    <div v-for="b in brands.value" :key="b.id" class="dictionary-item">
      <input v-model="b.name" />
      <textarea v-model="b.logoUrl" placeholder="Логотип URL" style="height: 50px; width: 300px;"></textarea>
      <button @click="updateBrand(b)">Сохранить</button>
      <button @click="deleteBrand(b)">Удалить</button>
    </div>
    <div class="add-form">
      <input v-model="newBrand" placeholder="Новый бренд" />
      <textarea v-model="newBrandLogo" placeholder="Логотип URL" style="height: 50px; width: 300px;"></textarea>
      <button @click="addBrand">Добавить</button>
    </div>
  </div>
</div>

</template>

<script setup>
import { ref, onMounted } from 'vue';
import NavBar from '@/components/NavBar.vue';
import { productService } from '@/services/productService';
import { useToast } from 'vue-toastification';
import { LoadCategories, LoadBrands, LoadColors, LoadSizes } from '@/db/api';
import AdminOrders from '@/components/AdminOrders.vue';
import { brandService } from '@/services/brandService';
import { categoryService } from '@/services/categoryService';

const categories = ref([]);
const brands = ref([]);
const colors = ref([]);
const sizes = ref([]);

const toast = useToast();

const products = ref([]);
const loading = ref(true);
const showCreateForm = ref(false);
const currentProduct = ref(null);
const productToDelete = ref(null);
const showDeleteConfirm = ref(false);

const activeTab = ref('products');

const newCategory = ref('');
const newBrand = ref('');
const newBrandLogo = ref('');
const newColor = ref('');

const productForm = ref({
    name: '',
    brand: '',
    description: '',
    price: 0,
    gender: 'UNISEX',
    subCategory: '',
    imageUrlsString: '',
    color: '',
    sizes: [],
    variants: [
        { size: '', color: '', quantity: 0 }
    ]
});

onMounted(async () => {
    loadProducts();
    categories.value = await LoadCategories();
    brands.value = await LoadBrands();
    sizes.value = await LoadSizes();
    colors.value = await LoadColors();
});

const loadProducts = async () => {
try {
    loading.value = true;
    const response = await productService.getAllProducts();
    products.value = response.data;
} catch (error) {
    toast.error('Ошибка загрузки товаров');
    console.error(error);
} finally {
    loading.value = false;
}
};

const confirmDelete = (productId) => {
    productToDelete.value = productId;
    showDeleteConfirm.value = true;
};

const addBrand = async () => {
  if (!newBrand.value.trim()) {
    toast.warning('Введите название бренда');
    return;
  }

  try {
    const response = await brandService.addBrand(newBrand.value, newBrandLogo.value);
    newBrand.value = '';
    newBrandLogo.value = '';
    toast.success('Бренд добавлен', {
      timeout: 3000
    });
    brands.value = await LoadBrands();
  } catch (error) {
    toast.error('Ошибка при добавлении бренда', {
      timeout: 3000
    });
    console.error(error);
  }
};

const deleteBrand = async (brand) => {
  try {
    await brandService.deleteBrand(brand.name, brand.logoUrl);
    toast.success('Бренд удалён', {
      timeout: 3000
    });
    brands.value = await LoadBrands();
  } catch (error) {
    toast.error('Ошибка при удалении бренда', {
      timeout: 3000
    });
    console.error(error);
  }
};

const updateBrand = async (brand) => {
  try {
    console.log(brand.id);
    
    await brandService.updateBrand(brand.id, brand.name, brand.logoUrl);
    toast.success('Бренд обновлён', {
      timeout: 3000
    });
  } catch (error) {
    toast.error('Ошибка при обновлении бренда', {
      timeout: 3000
    });
    console.error(error);
  }
};

const addCategory = async () => {
  try {
    await categoryService.add(newCategory.value);
    toast.success('Подкатегория добавлена', {
      timeout: 3000
    });
    categories.value = await LoadCategories();
    newCategory.value = '';
  } catch (err) {
    toast.error('Ошибка при добавлении подкатегории', {
      timeout: 3000
    });
    console.log(err);
    
  }
};

const updateCategory = async (sub) => {
  try {
    await categoryService.update(sub.id, sub.name, {
      timeout: 3000
    });
    toast.success('Подкатегория обновлена');
  } catch (err) {
    toast.error('Ошибка при обновлении подкатегории', {
      timeout: 3000
    });
  }
};

const deleteCategory = async (sub) => {
  try {
    await categoryService.delete(sub.id);
    toast.success('Подкатегория удалена', {
      timeout: 3000
    });
    categories.value = await LoadCategories();
  } catch (err) {
    toast.error('Ошибка при удалении подкатегории', {
      timeout: 3000
    });
  }
};



const deleteProduct = async () => {
try {
    await productService.deleteProduct(productToDelete.value);
    toast.success('Товар успешно удален');
    loadProducts();
} catch (error) {
    toast.error('Ошибка при удалении товара', {
        timeout: 3000
    });
    console.error(error);
} finally {
    showDeleteConfirm.value = false;
    productToDelete.value = null;
}
};

const openVariantsEditor = (product) => {
    currentProduct.value = product;
    showCreateForm.value = true;

    productForm.value = {
            name: product.name,
            brand: product.brand,
            description: product.description,
            price: product.price,
            gender: product.gender,
            subCategory: product.subCategory,
            imageUrlsString: product.imageUrls ? product.imageUrls.join(', ') : '',
            variants: product.productVariants.map(variant => ({
            size: variant.size,
            color: variant.color,
            quantity: variant.quantity
        }))
    };
}

const submitProductForm = async () => {
  try {
    const productData = {
      name: productForm.value.name,
      description: productForm.value.description,
      price: productForm.value.price,
      gender: productForm.value.gender,
      brand: productForm.value.brand,
      subCategory: productForm.value.subCategory,
      imageUrls: productForm.value.imageUrlsString
        .split(',')
        .map(url => url.trim())
        .filter(url => url),
      productVariants: productForm.value.variants
    };

    if (currentProduct.value) {
        productData.id = currentProduct.value.id
        await productService.updateProduct(productData);
        toast.success('Товар успешно обновлен', {
            timeout: 3000
        });
    } else {
        await productService.createProduct(productData);
        toast.success('Товар успешно создан', {
            timeout: 3000
        });
    }

    closeModal();
    loadProducts();
  } catch (error) {
    toast.error('Ошибка при сохранении товара', {
        timeout: 3000
      });
    console.error(error);
  }
};

const addVariant = () => {
    productForm.value.variants.push({ size: '', color: '', quantity: 0 });
};

const removeVariant = (index) => {
    productForm.value.variants.splice(index, 1);
};

const closeModal = () => {
    showCreateForm.value = false;
    currentProduct.value = null;
    productForm.value = {
        name: '',
        brand: '',
        description: '',
        price: 0,
        gender: 'UNISEX',
        subCategory: '',
        imageUrlsString: '',
        variants: [
            { size: '', color: '', quantity: 0 }
        ]
    };
};

const formatPrice = (price) => {
return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB'
}).format(price);
};

const truncateDescription = (text) => {
if (!text) return '';
return text.length > 100 ? text.substring(0, 100) + '...' : text;
};
</script>

<style scoped>
.admin-panel {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #fafafa;
}

h1, h2, h3 {
  text-align: center;
  color: #333;
  margin-bottom: 1rem;
}

.admin-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.products-list {
  margin-top: 2rem;
}

.loading, .no-products {
  text-align: center;
  padding: 2rem;
  color: #777;
}

.product-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.product-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.product-images {
  height: 200px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.no-image {
  color: #aaa;
  font-size: 14px;
}

.product-info {
  padding: 1rem;
  flex-grow: 1;
}

.product-info h3 {
  margin: 0 0 0.25rem;
  font-size: 1.1rem;
}

.brand {
  color: #666;
  font-size: 0.9rem;
}

.price {
  font-weight: 600;
  font-size: 1.1rem;
  margin: 0.5rem 0;
  color: #1a73e8;
}

.description {
  font-size: 0.85rem;
  color: #444;
  margin-bottom: 1rem;
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
  font-size: 0.75rem;
  color: #1a73e8;
}

.product-actions {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #eee;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s;
}

.create-btn {
  background-color: #43a047;
  color: white;
}

.create-btn:hover {
  background-color: #388e3c;
}

.edit-btn {
  background-color: #1e88e5;
  color: white;
}

.edit-btn:hover {
  background-color: #1565c0;
}

.delete-btn {
  background-color: #e53935;
  color: white;
}

.delete-btn:hover {
  background-color: #c62828;
}

.cancel-btn {
  background-color: #e0e0e0;
  color: #333;
}

.cancel-btn:hover {
  background-color: #bdbdbd;
}

.submit-btn {
  background-color: #1e88e5;
  color: white;
}

.submit-btn:hover {
  background-color: #1565c0;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  background: #fff;
  padding: 2rem;
  border-radius: 10px;
  max-width: 800px;
  width: 95%;
  max-height: 90vh;
  overflow-y: auto;
}

.product-form {
  display: grid;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
}

.variant-form {
  background: #f9f9f9;
  border: 1px solid #ddd;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.add-variant-btn {
  background: #43a047;
  color: white;
}

.remove-variant-btn {
  background: #ef5350;
  color: white;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.confirm-modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  text-align: center;
}

.confirm-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.admin-tabs {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 2rem 0;
}

.admin-tabs button {
  padding: 0.6rem 1.2rem;
  background: #f5f5f5;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  transition: 0.2s ease;
  cursor: pointer;
}

.admin-tabs button.active {
  background: #1e88e5;
  color: white;
}

/* Dictionary section */
.dictionary-section {
  margin-bottom: 2rem;
}

.dictionary-item,
.add-form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.dictionary-item input,
.add-form input,
.dictionary-item textarea,
.add-form textarea {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  flex: 1;
  min-width: 200px;
}
</style>