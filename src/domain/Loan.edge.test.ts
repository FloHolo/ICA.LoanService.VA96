import { describe, it, expect } from 'vitest';
import { createLoanUseCase } from '../app/create-loan';
import { listLoans } from '../app/list-loan';
import { FakeLoanRepo } from '../infra/fake-loan-repo';
import { isOverdue, remainingTimeMs, createLoan } from './Loan';

describe('Edge/Error Cases', () => {
  it('createLoanUseCase returns error if domain validation fails', async () => {
    const repo = new FakeLoanRepo();
    const result = await createLoanUseCase({ loanRepo: repo }, { id: '', deviceId: '', userId: '' });
    expect(result.ok).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it('createLoanUseCase returns error if repo throws', async () => {
    const badRepo = { create: async () => { throw new Error('fail'); } } as any;
    const params = { id: 'x', deviceId: 'y', userId: 'z' };
    const result = await createLoanUseCase({ loanRepo: badRepo }, params);
    expect(result.ok).toBe(false);
    expect(result.errors?.[0]).toMatch(/Failed to save loan/);
  });

  it('listLoans returns error if repo throws', async () => {
    const badRepo = { listAll: async () => { throw new Error('fail'); } } as any;
    const result = await listLoans({ loanRepo: badRepo });
    expect(result.success).toBe(false);
    expect(result.errors[0]).toMatch(/fail/);
  });

  it('isOverdue returns true for overdue loan', () => {
    const loan = createLoan({ id: 'a', deviceId: 'b', userId: 'c', loanedAt: '2000-01-01T00:00:00.000Z', loanDurationHours: 1 });
    expect(loan.ok).toBe(true);
    if (loan.ok) {
      expect(isOverdue(loan.value)).toBe(true);
    }
  });

  it('remainingTimeMs returns 0 for overdue loan', () => {
    const loan = createLoan({ id: 'a', deviceId: 'b', userId: 'c', loanedAt: '2000-01-01T00:00:00.000Z', loanDurationHours: 1 });
    expect(loan.ok).toBe(true);
    if (loan.ok) {
      expect(remainingTimeMs(loan.value)).toBe(0);
    }
  });
});
