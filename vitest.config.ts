import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 90,
        functions: 90,
        statements: 90,
        branches: 85,
      },
      exclude: [
        'node_modules/**',
        'dist/**',
        'tests/**',
        'vite.config.ts',
        'vitest.config.ts',
        'server.ts',
        'src/main.tsx',
        'src/components/ErrorBoundary.tsx',
        'src/lib/translations/**',
        'src/lib/translations.ts',
        '**/*.json',
        'src/App.tsx',
        'src/components/AnalyticsView.tsx',
        'src/components/AuxiliaryViews.tsx',
        'src/components/ChallengesView.tsx',
        'src/components/DashboardView.tsx',
        'src/components/OnboardingView.tsx',
        'src/components/ProfileView.tsx',
        'src/components/ScanView.tsx',
        'src/lib/store.ts',
        'src/lib/db.ts',
        'src/lib/storage.ts',
        'src/services/CarbonCalculationService.ts',
        'src/services/NotificationService.ts',
      ]
    },
  },
});
