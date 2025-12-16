// src/loan/application/createLoanUseCase.ts

/**
 * Create Loan Use Case
 * Application layer (Clean Architecture)
 *
 * - Validates input via domain factory
 * - Persists loan using injected repository
 * - Returns explicit Result (no thrown errors)
 */

import {
  Loan,
  CreateLoanParams,
  createLoan,
  Result,
  err,
} from '../domain/Loan';
import { LoanRepo } from '../domain/Loan-Repo';

/* ---------------- Dependencies ---------------- */

export interface CreateLoanDeps {
  loanRepo: LoanRepo;
}

/* ---------------- Use Case ---------------- */

/**
 * Creates a new loan.
 *
 * @param deps - Injected dependencies (LoanRepo)
 * @param params - Parameters required to create a loan
 * @returns Result<Loan, string>
 */
export async function createLoanUseCase(
  deps: CreateLoanDeps,
  params: CreateLoanParams
): Promise<Result<Loan, string>> {
  // Step 1: Validate & create domain entity
  const loanResult = createLoan(params);

  if (!loanResult.ok) {
    // Domain validation failed
    return loanResult;
  }

  // Step 2: Persist loan
  try {
    await deps.loanRepo.create(loanResult.value);
    return loanResult;
  } catch (e: unknown) {
    const message =
      e instanceof Error
        ? e.message
        : 'Unknown error while saving loan';

    return err([`Failed to save loan: ${message}`]);
  }
}
