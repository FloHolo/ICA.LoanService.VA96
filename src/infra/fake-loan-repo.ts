import { Loan } from '../domain/Loan';
import { LoanRepo } from '../domain/Loan-Repo';

/**
 * Fake in-memory implementation of LoanRepo for tests and local dev.
 * Not safe for concurrency across processes — intended as a fake.
 */
export class FakeLoanRepo implements LoanRepo {
  private store: Map<string, Loan> = new Map();

  constructor(initial: Loan[] = []) {
    for (const l of initial) this.store.set(l.id, { ...l });
  }

  async getById(id: string): Promise<Loan | null> {
    const found = this.store.get(id) ?? null;
    return found ? { ...found } : null;
  }

  async list(): Promise<Loan[]> {
    return Array.from(this.store.values()).map((l) => ({ ...l }));
  }

  async save(loan: Loan): Promise<Loan> {
    const toStore = { ...loan } as Loan;
    this.store.set(toStore.id, toStore);
    return { ...toStore };
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }

  // Optional: clear all loans (useful for test setup/teardown)
  clear() {
    this.store.clear();
  }

  // Implementing missing methods from LoanRepo interface

  async create(loan: Loan): Promise<Loan> {
    return this.save(loan);
  }

  async update(loan: Loan): Promise<void> {
    if (!this.store.has(loan.id)) {
      throw new Error(`Loan with id ${loan.id} does not exist`);
    }
    await this.save(loan);
  }

  async listAll(): Promise<Loan[]> {
    return this.list();
  }

  async findActiveByUserId(userId: string): Promise<Loan[]> {
    return Array.from(this.store.values())
      .filter((l) => (l as any).userId === userId && (l as any).active)
      .map((l) => ({ ...l }));
  }
}