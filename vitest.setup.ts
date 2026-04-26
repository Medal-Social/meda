import '@testing-library/jest-dom/vitest';
import * as React from 'react';
import { vi } from 'vitest';

// Mock window.matchMedia (not available in jsdom)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock HTMLCanvasElement.getContext for jsdom
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  fillText: vi.fn(),
  clearRect: vi.fn(),
  strokeRect: vi.fn(),
  fillStyle: '',
  font: '',
  lineWidth: 1,
  strokeStyle: '',
})) as unknown as (contextId: string, options?: unknown) => CanvasRenderingContext2D | null;

// Mock @react-three/fiber so tests run in jsdom without WebGL
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'r3f-canvas' }, children),
  useFrame: vi.fn(),
  useThree: () => ({ size: { width: 144, height: 144 }, gl: {} }),
}));

// Mock @react-three/drei (no-op any imports)
vi.mock('@react-three/drei', () => ({}));

// Mock the Scene component so R3F JSX doesn't reach jsdom
vi.mock('./src/voice/voice-orb-scene.js', () => ({
  Scene: () => null,
}));
vi.mock('./src/voice/voice-orb-scene.tsx', () => ({
  Scene: () => null,
}));

// Partially mock three — keep all real exports, stub the WebGLRenderer
vi.mock('three', async (importOriginal) => {
  const actual = (await importOriginal()) as object;
  return {
    ...actual,
    WebGLRenderer: vi.fn().mockImplementation(() => ({
      setSize: vi.fn(),
      render: vi.fn(),
      dispose: vi.fn(),
    })),
  };
});
