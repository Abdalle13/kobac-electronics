import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Create Order
export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (order, thunkAPI) => {
    try {
      const { data } = await api.post('/orders', order);
      return data;
    } catch (error) {
      const message = error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get Order Details
export const getOrderDetails = createAsyncThunk(
  'order/getOrderDetails',
  async (id, thunkAPI) => {
    try {
      const { data } = await api.get(`/orders/${id}`);
      return data;
    } catch (error) {
      const message = error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Pay Order
export const payOrder = createAsyncThunk(
  'order/payOrder',
  async ({ id, paymentResult }, thunkAPI) => {
    try {
      const { data } = await api.put(`/orders/${id}/pay`, paymentResult);
      return data;
    } catch (error) {
      const message = error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get User Orders
export const listMyOrders = createAsyncThunk(
  'order/listMyOrders',
  async (_, thunkAPI) => {
    try {
      const { data } = await api.get('/orders/myorders');
      return data;
    } catch (error) {
      const message = error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get All Orders (Admin)
export const listOrders = createAsyncThunk(
  'order/listOrders',
  async (_, thunkAPI) => {
    try {
      const { data } = await api.get('/orders');
      return data;
    } catch (error) {
      const message = error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Deliver Order (Admin)
export const deliverOrder = createAsyncThunk(
  'order/deliverOrder',
  async (id, thunkAPI) => {
    try {
      const { data } = await api.put(`/orders/${id}/deliver`, {});
      return data;
    } catch (error) {
      const message = error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Pay Order (Admin manual)
export const payOrderAdmin = createAsyncThunk(
  'order/payOrderAdmin',
  async (id, thunkAPI) => {
    try {
      const { data } = await api.put(`/orders/${id}/payadmin`, {});
      return data;
    } catch (error) {
      const message = error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    order: null,
    orders: [],
    loading: false,
    success: false,
    error: null,
  },
  reducers: {
    resetOrder: (state) => {
      state.order = null;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.order = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Order Details
      .addCase(getOrderDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(getOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Pay Order
      .addCase(payOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(payOrder.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(payOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // List My Orders
      .addCase(listMyOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(listMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(listMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // List All Orders (Admin)
      .addCase(listOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(listOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(listOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Deliver Order (Admin)
      .addCase(deliverOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(deliverOrder.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(deliverOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Pay Order (Admin)
      .addCase(payOrderAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(payOrderAdmin.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(payOrderAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetOrder } = orderSlice.actions;
export default orderSlice.reducer;
