import { describe, it, expect } from 'vitest';
import { cn } from '../lib/utils';

describe('cn utility', () => {
  it('merges class names correctly', () => {
    expect(cn('px-2 py-1', 'bg-red-500')).toBe('px-2 py-1 bg-red-500');
  });

  it('handles conditional classes', () => {
    expect(cn('px-2', { 'bg-blue-500': true, 'text-white': false })).toBe('px-2 bg-blue-500');
  });

  it('merges tailwind classes properly using tailwind-merge', () => {
    expect(cn('px-2 py-1 bg-red-500', 'bg-blue-500')).toBe('px-2 py-1 bg-blue-500');
  });
});
