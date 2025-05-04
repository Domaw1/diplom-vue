import {ref} from "vue";
import axios from "axios";


export const LoadProducts = async () => {
    let data = ref([]);

    axios.get("http://localhost:8080/api/v1/products").then(response => {
        data.value = response.data;
    })
        .catch(exc => {
            console.log(exc)
        });

    return data;
}

export const LoadProductById = async (productId) => {
    try {
        const response = await axios.get(`http://localhost:8080/api/v1/products/${productId}`);
        return response.data;
    } catch (exc) {
        console.error("Ошибка при получении продукта по ID:", exc);
        throw exc;
    }
};


export const LoadCategories = async () => {
    let data = ref([]);
    axios.get("http://localhost:8080/api/v1/category").then(response => {
        data.value = response.data;
    })
        .catch(exc => {
            console.log(exc);
        });

    return data;
}

export const LoadBrands = async () => {
    let data = ref([]);

    axios.get("http://localhost:8080/api/v1/brand").then(response => {
        data.value = response.data;
    })
        .catch(exc => {
            console.log(exc)
        });

    return data;
}

export const LoadSizes = async () => {
    try {
        const response = await axios.get("http://localhost:8080/api/v1/size");
        return response.data;
    } catch (exc) {
        console.log(exc);
        return [];
    }
};

export const LoadColors = async () => {
    try {
        const response = await axios.get("http://localhost:8080/api/v1/color");
        return response.data;
    } catch (exc) {
        console.log(exc);
        return [];
    }
}

export const AddReview = async (productId, comment, rating) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`http://localhost:8080/api/v1/reviews`,
            {   
                productId: productId,
                comment: comment,
                rating: rating
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (exc) {
        console.error("Ошибка при добавления отзыва:", exc);
        throw exc;
    }
}

export const fetchFilteredProducts = async (filters) => {
  try {
    let data = ref([])
    const params = new URLSearchParams();
    
    if (filters.brands?.length) {
      params.append('brand', filters.brands.join(','));
    }
    if (filters.colors?.length) {
      params.append('color', filters.colors.join(','));
    }
    if (filters.sizes?.length) {
      params.append('size', filters.sizes.join(','));
    }
    if(filters.subCategory) {
        params.append('subCategory', filters.subCategory);
    }
    if (filters.minPrice) {
      params.append('minPrice', filters.minPrice);
    }
    if (filters.maxPrice) {
      params.append('maxPrice', filters.maxPrice);
    }
    if (filters.sortBy) {
      params.append('sortBy', filters.sortBy);
      params.append('sortDirection', filters.sortDirection || 'asc');
    }

    const response = await axios.get('http://localhost:8080/api/v1/products/filter', { params });
    data.value = response.data;
    return data;
  } catch (error) {
    console.error('Ошибка фильтрации:', error);
    throw error;
  }
};