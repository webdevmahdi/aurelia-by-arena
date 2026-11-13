import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ConversionMode =
  | 'SITE_VISIT'
  | 'BROCHURE'
  | 'PRICING'
  | 'UNIT_INQUIRY'
  | 'GENERAL_INQUIRY';

export type ConversionContextPayload = {
  mode: ConversionMode;
  projectId?: string;
  projectName?: string;
  unitId?: string;
  unitNumber?: string;
  defaultBudget?: string;
};

type ConversionState = {
  isOpen: boolean;
  mode: ConversionMode;
  projectId?: string;
  projectName?: string;
  unitId?: string;
  unitNumber?: string;
  defaultBudget?: string;
};

const initialState: ConversionState = {
  isOpen: false,
  mode: 'GENERAL_INQUIRY',
};

export const conversionSlice = createSlice({
  name: 'conversion',
  initialState,
  reducers: {
    openConversionModal(state, action: PayloadAction<ConversionContextPayload>) {
      state.isOpen = true;
      state.mode = action.payload.mode;
      state.projectId = action.payload.projectId;
      state.projectName = action.payload.projectName;
      state.unitId = action.payload.unitId;
      state.unitNumber = action.payload.unitNumber;
      state.defaultBudget = action.payload.defaultBudget;
    },
    closeConversionModal(state) {
      state.isOpen = false;
    },
    switchConversionMode(state, action: PayloadAction<ConversionMode>) {
      state.mode = action.payload;
    },
  },
});

export const { openConversionModal, closeConversionModal, switchConversionMode } =
  conversionSlice.actions;

export default conversionSlice.reducer;
