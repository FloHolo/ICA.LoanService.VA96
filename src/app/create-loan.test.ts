import { describe, it, expect } from 'vitest';
import { createLoan } from '../domain/Loan';

describe('createLoan (integration)', () => {
  it('should create a loan with valid params', () => {
    const params = {
      id: 'loan-abc',
      deviceId: 'device-xyz',
      userId: 'user-123',
      loanedAt: '2025-01-01T00:00:00.000Z',
      loanDurationHours: 12,
    };
    const result = createLoan(params);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toMatchObject({
        id: 'loan-abc',
        deviceId: 'device-xyz',
        userId: 'user-123',
        loanedAt: '2025-01-01T00:00:00.000Z',
        dueAt: '2025-01-01T12:00:00.000Z',
        status: 'active',
      });
    }
  });

  it('should fail with missing deviceId', () => {
    const params = {
      id: 'loan-abc',
      deviceId: '',
      userId: 'user-123',
    };
    const result = createLoan(params);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContain('deviceId is required.');
    }
  });
  it('should fail with missing userId', () => {
    const params = {
      id: 'loan-abc',
      deviceId: 'device-xyz',
      userId: '',
    };
    const result = createLoan(params);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContain('userId is required.');
    }
  });

  it('should fail with missing id', () => {
    const params = {
      id: '   ',
      deviceId: 'device-xyz',
      userId: 'user-123',
    };
    const result = createLoan(params);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContain('id is required.');
    }
  });

  it('should use default loanDurationHours and loanedAt if not provided', () => {
    const params = {
      id: 'loan-default',
      deviceId: 'device-default',
      userId: 'user-default',
    };
    const result = createLoan(params);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.loanedAt).toBeDefined();
      expect(result.value.dueAt).toBeDefined();
      expect(result.value.status).toBe('active');
    }
  });

  it('should create a loan with zero duration (edge case)', () => {
    const params = {
      id: 'loan-zero',
      deviceId: 'device-zero',
      userId: 'user-zero',
      loanedAt: '2025-01-01T00:00:00.000Z',
      loanDurationHours: 0,
    };
    const result = createLoan(params);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.dueAt).toBe('2025-01-01T00:00:00.000Z');
    }
  });

  it('should create a loan with negative duration (edge case)', () => {
    const params = {
      id: 'loan-neg',
      deviceId: 'device-neg',
      userId: 'user-neg',
      loanedAt: '2025-01-01T00:00:00.000Z',
      loanDurationHours: -5,
    };
    const result = createLoan(params);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.dueAt < result.value.loanedAt).toBe(true);
    }
  });

});