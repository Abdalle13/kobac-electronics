import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const initialState = {
  products: [],
  product: null,
  loading: false,
  error: null,
  page: 1,
  pages: 1,
  total: 0,
  filters: { categories: [], brands: [], priceRange: { min: 0, max: 0 } },
  reviewLoading: false,
  reviewError: null,
  reviewSuccess: false,
};

// Fetch products. Accepts a params object, or a plain string (treated as keyword).
export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = typeof params === 'string' ? { keyword: params } : { ...params };
      const search = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          search.append(key, value);
        }
      });
      const response = await api.get(`/products?${search.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Fetch available filter options for the shop (categories, brands, price range)
export const fetchProductFilters = createAsyncThunk(
  'products/fetchFilters',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/products/filters');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const fetchProductDetails = createAsyncThunk(
  'products/fetchDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const createProductReview = createAsyncThunk(
  'products/createReview',
  async ({ productId, rating, comment }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post(`/products/${productId}/reviews`, { rating, comment });
      // Refresh the product so the new review + updated average show immediately
      dispatch(fetchProductDetails(productId));
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductDetails: (state) => {
      state.product = null;
    },
    resetReviewState: (state) => {
      state.reviewLoading = false;
      state.reviewError = null;
      state.reviewSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const payload = action.payload;
        if (Array.isArray(payload)) {
          state.products = payload;
          state.page = 1;
          state.pages = 1;
          state.total = payload.length;
        } else {
          state.products = payload.products || [];
          state.page = payload.page || 1;
          state.pages = payload.pages || 1;
          state.total = payload.total ?? state.products.length;
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProductFilters.fulfilled, (state, action) => {
        state.filters = action.payload;
      })
      .addCase(fetchProductDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
        state.error = null;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createProductReview.pending, (state) => {
        state.reviewLoading = true;
        state.reviewError = null;
        state.reviewSuccess = false;
      })
      .addCase(createProductReview.fulfilled, (state) => {
        state.reviewLoading = false;
        state.reviewSuccess = true;
      })
      .addCase(createProductReview.rejected, (state, action) => {
        state.reviewLoading = false;
        state.reviewError = action.payload;
      });
  },
});

export const { clearProductDetails, resetReviewState } = productSlice.actions;
export default productSlice.reducer;
