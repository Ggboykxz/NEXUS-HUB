import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useAuth } from './use-auth';
import { AuthProvider } from '@/components/providers/auth-provider';
import type { User } from 'firebase/auth';

// This will hold the callback function passed to onAuthStateChanged
let onAuthStateChangedCallback: (user: User | null) => void;

// Mock the firebase library
vi.mock('@/lib/firebase', () => ({
  auth: {
    onAuthStateChanged: (callback: (user: User | null) => void) => {
      // Store the callback so we can trigger it later
      onAuthStateChangedCallback = callback;
      // Return a dummy unsubscribe function
      return () => {};
    },
  },
  db: {}, // Mock Firestore db as well if needed
}));

describe('useAuth hook', () => {
  it('should provide the current user and loading state', async () => {
    const { result, rerender } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    // Initially, user is null and loading is true
    expect(result.current.currentUser).toBeNull();
    expect(result.current.loading).toBe(true);

    // Simulate Firebase finishing its initial auth check with no user
    await act(async () => {
      onAuthStateChangedCallback(null);
    });

    // Now, user should be null and loading should be false
    expect(result.current.currentUser).toBeNull();
    expect(result.current.loading).toBe(false);

    // Simulate a user logging in
    const mockUser = { uid: 'test-user-123', email: 'test@example.com' } as User;
    await act(async () => {
      onAuthStateChangedCallback(mockUser);
    });

    // The hook should now provide the user
    expect(result.current.currentUser).toEqual(mockUser);
    expect(result.current.loading).toBe(false);
    
    // Simulate the user logging out
    await act(async () => {
        onAuthStateChangedCallback(null);
    });
    
    // The user should be null again
    expect(result.current.currentUser).toBeNull();
    expect(result.current.loading).toBe(false);
  });
});
