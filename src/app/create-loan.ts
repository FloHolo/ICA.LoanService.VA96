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
import type { LoanRepo } from '../domain/Loan-Repo';
import type { LoanEventPublisher } from './loan-event-publisher';
// import type { AuthContext } from './auth-context';
import type { AuthContext } from './auth-context';

/* ---------------- Dependencies ---------------- */

export interface CreateLoanDeps {
  loanRepo: LoanRepo;
  loanEventPublisher: LoanEventPublisher;
  authContext: AuthContext;
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
  // Enforce authentication
  if (!deps.authContext?.authenticated) {
    return err(['Authentication required']);
  }
  // Step 1: Validate & create domain entity
  const loanResult = createLoan(params);

  if (!loanResult.ok) {
    // Domain validation failed
    return loanResult;
  }

  // Step 2: Persist loan
  try {
    await deps.loanRepo.create(loanResult.value);


    try {
      await deps.loanEventPublisher.publishLoanUpdated({
        catalogueItemId: loanResult.value.deviceId, // Use deviceId as catalogue item
        delta: -1, // Loan created, reserve one
        availableUnits: null, // Not available in Loan entity
        reason: 'RESERVED',
        occurredAt: new Date().toISOString(),
      });
    } catch (eventErr) {
      // Log and continue, do not fail loan creation
      // eslint-disable-next-line no-console
      console.error('Failed to publish loan event:', eventErr);
    }

    return loanResult;
  } catch (e: unknown) {
    const message =
      e instanceof Error
        ? e.message
        : 'Unknown error while saving loan';

    return err([`Failed to save loan: ${message}`]);
  }
}
