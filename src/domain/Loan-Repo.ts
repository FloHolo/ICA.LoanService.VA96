import { Loan } from "./Loan";

export interface LoanRepo {
    create(loan: Loan): Promise<Loan>;
    getById(id: string): Promise<Loan | null>;
    update(loan: Loan): Promise<void>;
    listAll(): Promise<Loan[]>;
    findActiveByUserId(userId: string): Promise<Loan[]>;
}


export const createInMemoryLoanRepo = (): LoanRepo => {
  const store = new Map<string, Loan>();

  return {
    async create(loan) {
      store.set(loan.id, loan);
      return loan;
    },

    async getById(id) {
      return store.get(id) ?? null;
    },

    async update(loan) {
      if (!store.has(loan.id)) {
        throw new Error(`Loan with ID ${loan.id} not found.`);
      }
      store.set(loan.id, loan);
    },

    async listAll() {
      return Array.from(store.values());
    },

    async findActiveByUserId(userId) {
      return Array.from(store.values()).filter(
        (loan) => loan.userId === userId && loan.status === 'active'
      );
    },
  };
};


