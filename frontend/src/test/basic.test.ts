import { describe, it, expect } from 'vitest';

describe('Basic Tests', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle string operations', () => {
    const greeting = 'Hello World';
    expect(greeting).toBe('Hello World');
    expect(greeting.length).toBe(11);
  });

  it('should handle array operations', () => {
    const numbers = [1, 2, 3, 4, 5];
    expect(numbers).toHaveLength(5);
    expect(numbers[0]).toBe(1);
    expect(numbers.includes(3)).toBe(true);
  });
});
