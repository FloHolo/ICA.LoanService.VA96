import { CosmosClient, Container } from '@azure/cosmos';
import { LoanRepo } from '../domain/Loan-Repo';
import { Loan } from '../domain/Loan';

/* ---------------------------------------------------------------------- */
/*                             DTO Definition                              */
/* ---------------------------------------------------------------------- */

type LoanDTO = {
  id: string;
  deviceId: string;
  userId: string;
  loanedAt: string;
  dueAt: string;
  returnedAt?: string;
  status: 'active' | 'returned' | 'overdue';
  createdAt: string;
  updatedAt: string;
};

/* ---------------------------------------------------------------------- */
/*                        Options & Initialization                         */
/* ---------------------------------------------------------------------- */

export interface CosmosRepoOptions {
  endpoint: string;
  databaseId: string;
  containerId: string;
  key?: string;
  connectionPolicy?: any;
}

/* ---------------------------------------------------------------------- */
/*                       Cosmos Loan Repo Impl                        */
/* ---------------------------------------------------------------------- */

export class CosmosLoanRepo implements LoanRepo {
  private readonly container: Container;

  constructor(options: CosmosRepoOptions) {
    const client = new CosmosClient({
      endpoint: options.endpoint,
      key: options.key,
      connectionPolicy: options.connectionPolicy,
    });

    const database = client.database(options.databaseId);
    this.container = database.container(options.containerId);
  }

  /* ------------------------- Create new loan -------------------------- */
  async create(loan: Loan): Promise<Loan> {
    const dto = this.toDTO(loan);
    const { resource } = await this.container.items.create(dto);
    return this.fromDTO(resource as LoanDTO);
  }

  /* --------------------------- Get by ID ------------------------------ */
  async getById(id: string): Promise<Loan | null> {
    try {
      const { resource } = await this.container
        .item(id, id)
        .read<LoanDTO>();
      return resource ? this.fromDTO(resource) : null;
    } catch (error: any) {
      if (error.code === 404) return null;
      throw error;
    }
  }

  /* ----------------------------- Update ------------------------------- */
  async update(loan: Loan): Promise<void> {
    const dto = this.toDTO(loan);
    await this.container.item(loan.id, loan.id).replace(dto);
  }

  /* ----------------------------- List all ----------------------------- */
  async listAll(): Promise<Loan[]> {
    const query = 'SELECT * FROM c';
    const { resources } = await this.container.items
      .query<LoanDTO>(query)
      .fetchAll();
    return resources.map(this.fromDTO);
  }

  /* -------------------------- Find active by user ID ------------------------ */
  async findActiveByUserId(userId: string): Promise<Loan[]> {
    const query = {
      query: 'SELECT * FROM c WHERE c.userId = @userId AND c.status = @status',
      parameters: [
        { name: '@userId', value: userId },
        { name: '@status', value: 'active' },
      ],
    };
    const { resources } = await this.container.items
      .query<LoanDTO>(query)
      .fetchAll();
    return resources.map(this.fromDTO);
  }

  /* -------------------------------------------------------------------- */
  /*                        Mapping Helpers (DTO <-> Domain)              */
  /* -------------------------------------------------------------------- */

  private toDTO(loan: Loan): LoanDTO {
    return {
      id: loan.id,
      deviceId: loan.deviceId,
      userId: loan.userId,
      loanedAt: loan.loanedAt,
      dueAt: loan.dueAt,
      returnedAt: loan.returnedAt,
      status: loan.status,
      createdAt: loan.createdAt,
      updatedAt: loan.updatedAt,
    };
  }

  private fromDTO(dto: LoanDTO): Loan {
    return Object.freeze({
      id: dto.id,
      deviceId: dto.deviceId,
      userId: dto.userId,
      loanedAt: dto.loanedAt,
      dueAt: dto.dueAt,
      returnedAt: dto.returnedAt,
      status: dto.status,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    });
  }
}