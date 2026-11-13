import { MotionConfig } from 'framer-motion';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/app/store/store';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </Provider>
  );
}
