import { describe, it, expect, beforeEach } from 'vitest';
import { createLoanUseCase } from './create-loan';
import { listLoans } from './list-loan';
import { FakeLoanRepo } from '../infra/fake-loan-repo';

// Integration test: create and list loans

describe('Integration: Create and List Loans', () => {
  let repo: FakeLoanRepo;

  beforeEach(() => {
    repo = new FakeLoanRepo();
  });

  it('should create a loan and list it', async () => {
    const loanData = { id: 'loan1', deviceId: 'dev1', userId: 'user1' };
    const result = await createLoanUseCase({ loanRepo: repo }, loanData);
    // If authentication is enforced, expect failure due to missing JWT
    expect(result.ok).toBe(false);
    expect(result.errors?.[0]).toBe('Authentication required');
  });
});
