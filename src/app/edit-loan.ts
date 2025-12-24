// src/loan/application/editLoanUseCase.ts

/**
 * Edit Loan Use Case
 * Application layer (Clean Architecture)
 *
 * Supports domain-safe mutations such as returning a loan.
 */

import { Loan, returnLoan, Result, err } from '../domain/Loan';
import type { LoanRepo } from '../domain/Loan-Repo';
import type { LoanEventPublisher } from './loan-event-publisher';

/* ---------------- Dependencies ---------------- */

export interface EditLoanDeps {
  loanRepo: LoanRepo;
  loanEventPublisher?: LoanEventPublisher;
}

/* ---------------- Command ---------------- */

export interface EditLoanCommand {
  loanId: string;
  action: 'return';
}

/* ---------------- Use Case ---------------- */

export async function editLoan(
  deps: EditLoanDeps,
  command: EditLoanCommand
): Promise<Result<Loan, string>> {
  // Step 1: Load loan
  const loan = await deps.loanRepo.getById(command.loanId);
  if (!loan) {
    return err(['Loan not found']);
  }

  // Step 2: Apply domain action
  let updatedResult: Result<Loan, string>;

  switch (command.action) {
    case 'return':
      updatedResult = returnLoan(loan);
      break;
    default:
      return err(['Unknown loan action']);
  }

  if (!updatedResult.ok) {
    return updatedResult;
  }

  // Step 3: Persist changes
  try {
    await deps.loanRepo.update(updatedResult.value);

    // Optionally publish event if publisher is provided
    if (deps.loanEventPublisher) {
      try {
        await deps.loanEventPublisher.publishLoanUpdated({
          catalogueItemId: updatedResult.value.deviceId, // Use deviceId as catalogue item
          delta: 1, // Loan returned, increase available
          availableUnits: null, // Not available in Loan entity
          reason: 'RETURNED',
          occurredAt: new Date().toISOString(),
        });
      } catch (eventErr) {
        // Log and continue, do not fail loan update
        // eslint-disable-next-line no-console
        console.error('Failed to publish loan event:', eventErr);
      }
    }

    return updatedResult;
  } catch (e: unknown) {
    const message =
      e instanceof Error
        ? e.message
        : 'Unknown error while updating loan';

    return err([`Failed to update loan: ${message}`]);
  }
}
