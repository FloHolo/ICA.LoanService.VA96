import type { Loan } from '../domain/Loan';
import type { LoanRepo } from '../domain/Loan-Repo';

export type ListLoansCommand = {
  userId?: string;
};

export type ListLoansResult =
  | {
      success: true;
      loans: readonly Loan[];
      totalCount: number;
    }
  | {
      success: false;
      errors: readonly string[];
    };

export type ListLoansDeps = {
  loanRepo: LoanRepo;
};

export async function listLoans(
  deps: ListLoansDeps,
  command: ListLoansCommand = {}
): Promise<ListLoansResult> {
  try {
    const loans = command.userId
      ? await deps.loanRepo.findActiveByUserId(command.userId)
      : await deps.loanRepo.listAll();

    return {
      success: true,
      loans,
      totalCount: loans.length,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Unknown error while listing loans';

    return {
      success: false,
      errors: [message],
    };
  }
}
