import { describe, it, expect } from 'vitest';
import { createLoan } from './Loan';

describe('createLoan', () => {
	describe('valid loan creation', () => {
		it('should create a loan with valid parameters', () => {
			// Arrange
			const params = {
				id: 'loan-123',
				deviceId: 'device-1',
				userId: 'user-1',
				loanedAt: '2025-01-01T00:00:00.000Z',
				loanDurationHours: 24,
			};

			// Act
			const result = createLoan(params);

			// Assert
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.value).toMatchObject({
					id: 'loan-123',
					deviceId: 'device-1',
					userId: 'user-1',
					loanedAt: '2025-01-01T00:00:00.000Z',
					dueAt: '2025-01-02T00:00:00.000Z',
					status: 'active',
					createdAt: '2025-01-01T00:00:00.000Z',
					updatedAt: '2025-01-01T00:00:00.000Z',
				});
			}
		});

		// TODO: Additional valid creation tests can be added here (e.g. check default duration)
	});

	describe('id validation', () => {
		it('should return error when id is only whitespace', () => {
			// Arrange
			const params = {
				id: '   ',
				deviceId: 'device-2',
				userId: 'user-2',
			};

			// Act
			const result = createLoan(params);

			// Assert
			expect(result.ok).toBe(false);
			if (!result.ok) {
				expect(result.errors).toContain('id is required.');
			}
		});

		// TODO: Additional validation tests can be added here
	});
});
