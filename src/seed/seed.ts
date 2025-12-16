import { createLoan, CreateLoanParams } from '../domain/Loan';
import { getLoanRepo } from '../config/appServices';

export async function seedLoans(): Promise<void> {
  const repo = getLoanRepo();

  const sampleLoans: CreateLoanParams[] = [
    {
      id: 'loan-1',
      deviceId: 'device-1',
      userId: 'user-1',
      loanedAt: '2025-12-01T10:00:00Z',
      loanDurationHours: 24,
    },
    {
      id: 'loan-2',
      deviceId: 'device-2',
      userId: 'user-2',
      loanedAt: '2025-12-02T11:00:00Z',
      loanDurationHours: 48,
    },
  ];

  for (const params of sampleLoans) {
    const loanResult = createLoan(params);
    if (!loanResult.ok) {
      console.error(`Failed to create loan ${params.id}:`, (loanResult as { ok: false; errors: string[] }).errors);
      continue;
    }
    await repo.create(loanResult.value);
    console.log(`Seeded loan: ${params.id}`);
  }
}

// If run directly
if (require.main === module) {
  seedLoans().then(() => console.log('Seeding complete')).catch(console.error);
}
