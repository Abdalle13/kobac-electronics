import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Store-wide settings managed from the admin dashboard.
export const fetchSettings = createAsyncThunk(
  'settings/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/settings');
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  storeName: 'Kobac Electronics',
  supportEmail: '',
  supportPhone: '',
  freeShippingThreshold: 400,
  heroBanners: [],
  loaded: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
        state.loaded = true;
      });
  },
});

export default settingsSlice.reducer;
