
import { describe, it, expect } from 'vitest';
import { createLoan, returnLoan, markOverdue } from '../domain/Loan';

describe('editLoan (integration)', () => {
	it('should mark a loan as returned', () => {
		const params = {
			id: 'loan-1',
			deviceId: 'device-1',
			userId: 'user-1',
			loanedAt: '2025-01-01T00:00:00.000Z',
		};
		const result = createLoan(params);
		expect(result.ok).toBe(true);
		if (result.ok) {
			const returned = returnLoan(result.value);
			expect(returned.ok).toBe(true);
			if (returned.ok) {
				expect(returned.value.status).toBe('returned');
				expect(returned.value.returnedAt).toBeDefined();
			}
		}
	});

	it('should mark a loan as overdue', () => {
		const params = {
			id: 'loan-2',
			deviceId: 'device-2',
			userId: 'user-2',
			loanedAt: '2020-01-01T00:00:00.000Z', // way in the past
			loanDurationHours: 1,
		};
		const result = createLoan(params);
		expect(result.ok).toBe(true);
		if (result.ok) {
			const overdue = markOverdue(result.value);
			// This may fail if the test runs before dueAt, but with old date it should pass
			expect(overdue.ok).toBe(true);
			if (overdue.ok) {
				expect(overdue.value.status).toBe('overdue');
			}
		}
	});
	it('should not return a loan that is already returned', () => {
		const params = {
			id: 'loan-3',
			deviceId: 'device-3',
			userId: 'user-3',
			loanedAt: '2025-01-01T00:00:00.000Z',
		};
		const result = createLoan(params);
		expect(result.ok).toBe(true);
		if (result.ok) {
			const returned1 = returnLoan(result.value);
			expect(returned1.ok).toBe(true);
			if (returned1.ok) {
				const returned2 = returnLoan(returned1.value);
				expect(returned2.ok).toBe(false);
				if (!returned2.ok) {
					expect(returned2.errors[0]).toMatch(/already been returned/i);
				}
			}
		}
	});

	it('should not mark a non-active loan as overdue', () => {
		const params = {
			id: 'loan-4',
			deviceId: 'device-4',
			userId: 'user-4',
			loanedAt: '2020-01-01T00:00:00.000Z',
			loanDurationHours: 1,
		};
		const result = createLoan(params);
		expect(result.ok).toBe(true);
		if (result.ok) {
			const returned = returnLoan(result.value);
			expect(returned.ok).toBe(true);
			if (returned.ok) {
				const overdue = markOverdue(returned.value);
				expect(overdue.ok).toBe(false);
				if (!overdue.ok) {
					expect(overdue.errors[0]).toMatch(/only active loans/i);
				}
			}
		}
	});

	it('should not mark a loan as overdue if not past due date', () => {
		const now = new Date();
		const params = {
			id: 'loan-5',
			deviceId: 'device-5',
			userId: 'user-5',
			loanedAt: now.toISOString(),
			loanDurationHours: 24,
		};
		const result = createLoan(params);
		expect(result.ok).toBe(true);
		if (result.ok) {
			const overdue = markOverdue(result.value);
			expect(overdue.ok).toBe(false);
			if (!overdue.ok) {
				expect(overdue.errors[0]).toMatch(/not overdue yet/i);
			}
		}
	});
});
