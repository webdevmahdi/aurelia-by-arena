import { configureStore } from '@reduxjs/toolkit';
import conversionReducer from '@/components/conversion/conversionSlice';
import comparisonReducer from '@/features/comparison/comparisonSlice';
import { apiSlice } from '@/services/api/apiSlice';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    comparison: comparisonReducer,
    conversion: conversionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
