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
    expect(result.ok).toBe(true);
    const listResult = await listLoans({ loanRepo: repo });
    expect(listResult.success).toBe(true);
    if (listResult.success) {
      expect(listResult.loans).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'loan1', deviceId: 'dev1', userId: 'user1' })
        ])
      );
    }
  });
});
