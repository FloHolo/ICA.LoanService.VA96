import { describe, it, expect, beforeEach } from 'vitest';
import { createLoanUseCase } from './create-loan';
import { FakeLoanRepo } from '../infra/fake-loan-repo';

// Concurrency/idempotency test: simulate parallel create-loan requests

describe('Concurrency/Idempotency: Create Loan', () => {
  let repo: FakeLoanRepo;

  beforeEach(() => {
    repo = new FakeLoanRepo();
  });

  it('should handle concurrent createLoanUseCase calls with same id idempotently', async () => {
    const loanData = { id: 'loan2', deviceId: 'dev2', userId: 'user2' };
    // Simulate two parallel requests with the same loan id
    await Promise.all([
      createLoanUseCase({ loanRepo: repo }, loanData),
      createLoanUseCase({ loanRepo: repo }, loanData)
    ]);
    // Only one loan should exist with that id
    const allLoans = await repo.list();
    const filtered = allLoans.filter(l => l.id === 'loan2');
    expect(filtered.length).toBe(1);
    expect(filtered[0]).toMatchObject({ id: 'loan2', deviceId: 'dev2', userId: 'user2' });
  });
});
