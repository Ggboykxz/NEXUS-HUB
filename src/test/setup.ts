import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock pour matchMedia (souvent utilisé par les composants shadcn/ui comme Sheet ou Dialog)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Dépréchié
    removeListener: vi.fn(), // Dépréchié
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});