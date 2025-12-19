
import { describe, it, expect } from 'vitest';
import { FakeLoanRepo } from '../infra/fake-loan-repo';
import { createLoan } from '../domain/Loan';

describe('listLoan (integration)', () => {
	it('should list all loans in the repo', async () => {
		const repo = new FakeLoanRepo();
		const params1 = { id: 'loan-1', deviceId: 'd1', userId: 'u1' };
		const params2 = { id: 'loan-2', deviceId: 'd2', userId: 'u2' };
		const l1 = createLoan(params1);
		const l2 = createLoan(params2);
		if (l1.ok) await repo.save(l1.value);
		if (l2.ok) await repo.save(l2.value);
		const all = await repo.list();
		expect(all.length).toBe(2);
		expect(all.map(l => l.id)).toEqual(expect.arrayContaining(['loan-1', 'loan-2']));
	});
});
