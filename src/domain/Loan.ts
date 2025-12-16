/** -----------------------------
 * Functional domain model for Loan Service
 * Purely in-memory logic, framework-independent.
 * ----------------------------- */

export type Result<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; errors: E[] };

export const ok = <T>(value: T): Result<T> => ({ ok: true, value });
export const err = <E = string>(errors: E[]): Result<never, E> => ({
  ok: false,
  errors,
});

/* ---------------- Types ---------------- */

export type LoanStatus = 'active' | 'returned' | 'overdue';

export type Loan = Readonly<{
  id: string;

  deviceId: string;
  userId: string;

  loanedAt: string;
  dueAt: string;
  returnedAt?: string;

  status: LoanStatus;

  createdAt: string;
  updatedAt: string;
}>;

export type CreateLoanParams = Readonly<{
  id: string;
  deviceId: string;
  userId: string;
  loanedAt?: string;
  loanDurationHours?: number; // default: 48
}>;

/* ---------------- Validation helpers ---------------- */

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === 'string' && v.trim().length > 0;

const nowIso = (): string => new Date().toISOString();

const addHours = (iso: string, hours: number): string =>
  new Date(new Date(iso).getTime() + hours * 60 * 60 * 1000).toISOString();

/* ---------------- Factory ---------------- */

/**
 * Creates a new Loan (pure)
 */
export const createLoan = (
  params: CreateLoanParams
): Result<Loan, string> => {
  const errors: string[] = [];

  if (!isNonEmptyString(params.id)) errors.push('id is required.');
  if (!isNonEmptyString(params.deviceId)) errors.push('deviceId is required.');
  if (!isNonEmptyString(params.userId)) errors.push('userId is required.');

  if (errors.length > 0) return err(errors);

  const loanedAt = params.loanedAt ?? nowIso();
  const duration = params.loanDurationHours ?? 48;

  const loan: Loan = Object.freeze({
    id: params.id.trim(),
    deviceId: params.deviceId.trim(),
    userId: params.userId.trim(),

    loanedAt,
    dueAt: addHours(loanedAt, duration),

    status: 'active',

    createdAt: loanedAt,
    updatedAt: loanedAt,
  });

  return ok(loan);
};

/* ---------------- Pure domain operations ---------------- */

/** Marks the loan as returned */
export const returnLoan = (loan: Loan): Result<Loan, string> => {
  if (loan.status === 'returned')
    return err(['Loan has already been returned.']);

  const now = nowIso();

  const updated: Loan = Object.freeze({
    ...loan,
    status: 'returned',
    returnedAt: now,
    updatedAt: now,
  });

  return ok(updated);
};

/** Marks loan as overdue if past due date */
export const markOverdue = (loan: Loan): Result<Loan, string> => {
  if (loan.status !== 'active')
    return err(['Only active loans can become overdue.']);

  if (new Date() <= new Date(loan.dueAt))
    return err(['Loan is not overdue yet.']);

  const updated: Loan = Object.freeze({
    ...loan,
    status: 'overdue',
    updatedAt: nowIso(),
  });

  return ok(updated);
};

/* ---------------- Computed helpers ---------------- */

/** True if loan is overdue right now */
export const isOverdue = (loan: Loan): boolean =>
  loan.status === 'active' && new Date() > new Date(loan.dueAt);

/** Remaining time in milliseconds (0 if overdue) */
export const remainingTimeMs = (loan: Loan): number =>
  Math.max(0, new Date(loan.dueAt).getTime() - Date.now());
