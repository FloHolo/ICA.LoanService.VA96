import { createLoan, CreateLoanParams } from '../domain/Loan';
import { getLoanRepo } from '../config/appServices';

export async function seedTestLoans(): Promise<void> {
  const repo = getLoanRepo();

  // Clear existing
  const allLoans = await repo.listAll();
  for (const loan of allLoans) {
    // Note: if repo has delete, but it doesn't. Assume for test, or just add.
    // For simplicity, just add test loans with unique ids.
  }

  const testLoans: CreateLoanParams[] = [
    {
      id: 'test-loan-1',
      deviceId: 'test-device-1',
      userId: 'test-user-1',
      loanedAt: '2025-12-15T10:00:00Z',
      loanDurationHours: 24,
    },
    {
      id: 'test-loan-2',
      deviceId: 'test-device-2',
      userId: 'test-user-1', // same user
      loanedAt: '2025-12-15T12:00:00Z',
      loanDurationHours: 48,
    },
  ];

  for (const params of testLoans) {
    const loanResult = createLoan(params);
    if (!loanResult.ok) {
      console.error(`Failed to create test loan ${params.id}:`, (loanResult as { ok: false; errors: string[] }).errors);
      continue;
    }
    await repo.create(loanResult.value);
    console.log(`Seeded test loan: ${params.id}`);
  }
}

// If run directly
if (require.main === module) {
  seedTestLoans().then(() => console.log('Test seeding complete')).catch(console.error);
}
