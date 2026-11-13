import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UnitDTO } from '@/types/api';

const STORAGE_KEY = 'aurelia_comparison_units_v1';
export const MAX_COMPARISON_UNITS = 4;

function loadStoredUnits(): UnitDTO[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_COMPARISON_UNITS) : [];
  } catch {
    return [];
  }
}

function saveStoredUnits(units: UnitDTO[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(units));
  } catch {
    // Ignore storage quota errors
  }
}

type ComparisonState = {
  items: UnitDTO[];
  isOpen: boolean;
};

const initialState: ComparisonState = {
  items: loadStoredUnits(),
  isOpen: false,
};

export const comparisonSlice = createSlice({
  name: 'comparison',
  initialState,
  reducers: {
    toggleCompareUnit(state, action: PayloadAction<UnitDTO>) {
      const exists = state.items.some((u) => u.id === action.payload.id);
      if (exists) {
        state.items = state.items.filter((u) => u.id !== action.payload.id);
      } else if (state.items.length < MAX_COMPARISON_UNITS) {
        state.items.push(action.payload);
      }
      saveStoredUnits(state.items);
    },
    removeCompareUnit(state, action: PayloadAction<string>) {
      state.items = state.items.filter((u) => u.id !== action.payload);
      saveStoredUnits(state.items);
    },
    clearComparison(state) {
      state.items = [];
      state.isOpen = false;
      saveStoredUnits([]);
    },
    setComparisonOpen(state, action: PayloadAction<boolean>) {
      state.isOpen = action.payload;
    },
  },
});

export const {
  toggleCompareUnit,
  removeCompareUnit,
  clearComparison,
  setComparisonOpen,
} = comparisonSlice.actions;

export default comparisonSlice.reducer;
