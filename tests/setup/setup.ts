import '@testing-library/jest-dom';
import { vi } from 'vitest';

// ResizeObserver mock
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// matchMedia mock
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock standard storage
const mockStorage = (): Storage => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    length: 0,
    key: () => '',
  };
};

Object.defineProperty(window, 'localStorage', { value: mockStorage() });
Object.defineProperty(window, 'sessionStorage', { value: mockStorage() });

// Mock HTMLElement prototype scrollIntoView for test environments
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// Mock global fetch to handle relative URLs and mock API responses in test environments
global.fetch = vi.fn().mockImplementation((url: string) => {
  if (url.includes('/api/gemini/analyze-image')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      headers: {
        get: (name: string) => name.toLowerCase() === 'content-type' ? 'application/json' : null,
      },
      json: () => Promise.resolve({
        objectDetected: 'Organic Bananas',
        category: 'food',
        co2: '0.4',
        totalImpact: 0.4,
        carbonImpactScore: 92,
        status: 'success',
        detectedItems: [
          { name: 'Organic Bananas', quantity: '1 bunch', co2: 0.4, rating: 'Excellent' }
        ],
        summary: 'Excellent organic purchase with minimal transport footprint.',
        betterAlternatives: [],
        personalizedSuggestions: ['Buy unpackaged banana bundles to reduce single-use plastic waste.']
      }),
    } as any);
  }
  if (url.includes('/api/gemini/get-insights') || url.includes('/api/gemini/chat')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      headers: {
        get: (name: string) => name.toLowerCase() === 'content-type' ? 'application/json' : null,
      },
      json: () => Promise.resolve({
        personalizedInsight: 'Intelligent Climate Insights\nYour carbon savings this week have increased by 14% compared to localized baselines.',
        predictedImpact: 'Predicted Impact\nWith your current commute routine, you are on track to meet your targets easily.',
        warning: '',
        isFallback: false
      }),
    } as any);
  }
  return Promise.resolve({
    ok: true,
    status: 200,
    headers: {
      get: (name: string) => name.toLowerCase() === 'content-type' ? 'application/json' : null,
    },
    json: () => Promise.resolve({}),
  } as any);
});

// Mock motion/react to run synchronously and render standard plain HTML elements without animation delays
vi.mock('motion/react', () => {
  const React = require('react');
  const motionProxy = new Proxy({}, {
    get: (_target, key) => {
      return ({ children, ...props }: any) => {
        // Strip off custom framer-motion specific props that standard components wouldn't expect
        const {
          initial, animate, exit, transition, variants, whileHover, whileTap,
          onAnimationComplete, layout, ...validProps
        } = props;
        return React.createElement(key, validProps, children);
      };
    }
  });

  return {
    motion: motionProxy,
    AnimatePresence: ({ children }: any) => children,
  };
});

// Mock Dexie db.ts to run in-memory without breaking
vi.mock('@/src/lib/db', () => {
  const createMockTable = (initialData: any[] = []) => {
    let data = [...initialData];
    return {
      get: vi.fn(async (id: string) => data.find(item => item && (item.id === id || item === id))),
      toArray: vi.fn(async () => [...data]),
      put: vi.fn(async (item: any) => {
        const id = item.id || 'user';
        const idx = data.findIndex(x => x && (x.id === id || x === id));
        if (idx !== -1) {
          data[idx] = item;
        } else {
          data.push(item);
        }
        return id;
      }),
      add: vi.fn(async (item: any) => {
        const id = item.id || Date.now().toString();
        data.push({ ...item, id });
        return id;
      }),
      bulkAdd: vi.fn(async (items: any[]) => {
        items.forEach(item => {
          const id = item.id || Date.now().toString();
          data.push({ ...item, id });
        });
        return items.map(item => item.id);
      }),
      bulkPut: vi.fn(async (items: any[]) => {
        items.forEach(item => {
          const id = item.id || Date.now().toString();
          const idx = data.findIndex(x => x && (x.id === id || x === id));
          if (idx !== -1) {
            data[idx] = item;
          } else {
            data.push(item);
          }
        });
        return items.map(item => item.id);
      }),
      delete: vi.fn(async (id: string) => {
        data = data.filter(item => item && item.id !== id);
      }),
      clear: vi.fn(async () => {
        data = [];
      }),
      count: vi.fn(async () => data.length),
      filter: vi.fn((fn: any) => ({
        toArray: async () => data.filter(fn),
        first: async () => {
          const res = data.filter(fn);
          return res.length > 0 ? res[0] : null;
        },
      })),
    };
  };

  return {
    db: {
      isOpen: vi.fn(() => true),
      open: vi.fn(async () => {}),
      delete: vi.fn(async () => {}),
      profile: createMockTable([{
        id: 'user',
        name: 'Jane Doe',
        avatar: '🌱',
        level: 3,
        levelRank: 'Earth Guardian',
        totalXP: 1800,
        xp: 1800,
        xpNeeded: 3000,
        currentStreak: 5,
        streak: 5,
        ecoPoints: 1200,
        dailyMissionClaimedDate: '',
        lastClaimDate: '',
        lastRewardClaimDate: '',
        hasCompletedOnboarding: true,
      }]),
      activities: createMockTable([]),
      goals: createMockTable([]),
      challenges: createMockTable([]),
      community: createMockTable([]),
      badges: createMockTable([]),
      transactions: createMockTable([]),
      chats: createMockTable([]),
      scans: createMockTable([]),
      notifications: createMockTable([]),
      learningArticles: createMockTable([]),
      settings: createMockTable([{ id: 'global', theme: 'light', language: 'en', dailyReminder: true }]),
    }
  };
});
