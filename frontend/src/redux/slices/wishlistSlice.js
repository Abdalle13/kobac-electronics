import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Full product objects for the current user's wishlist
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/users/wishlist');
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addToWishlist = createAsyncThunk(
  'wishlist/add',
  async (product, { rejectWithValue }) => {
    try {
      await api.post(`/users/wishlist/${product._id}`);
      return product; // add the full product to state
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/remove',
  async (productId, { rejectWithValue }) => {
    try {
      await api.delete(`/users/wishlist/${productId}`);
      return productId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearWishlist: (state) => {
      state.items = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        if (!state.items.some((p) => p._id === action.payload._id)) {
          state.items.push(action.payload);
        }
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p._id !== action.payload);
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
