import {
    CosmosLoanRepo,
    CosmosRepoOptions,
} from "../infra/cosmos-Loan-repo";
import { LoanRepo } from "../domain/Loan-Repo";
import { getEnvConfig } from "./envConfig";
import { EventGridLoanEventPublisher, EventGridOptions } from '../infra/eventgrid-loan-event-publisher';
import { DummyLoanEventPublisher } from '../infra/dummy-loan-event-publisher';
import type { LoanEventPublisher } from '../app/loan-event-publisher';
let cachedLoanEventPublisher: LoanEventPublisher | null = null;

function getLoanEventPublisher(): LoanEventPublisher {
    if (!cachedLoanEventPublisher) {
        const endpoint = process.env.EVENTGRID_ENDPOINT || process.env.EVENTGRID_URL;
        const key = process.env.EVENTGRID_KEY;
        if (endpoint && key) {
            const options: EventGridOptions = { endpoint, key };
            cachedLoanEventPublisher = new EventGridLoanEventPublisher(options);
        } else {
            // Fallback to dummy for local/test
            cachedLoanEventPublisher = new DummyLoanEventPublisher();
        }
    }
    return cachedLoanEventPublisher;
}

let cachedLoanRepo: LoanRepo | null = null;

export function getLoanRepo(): LoanRepo {
    if (!cachedLoanRepo) {
        const cfg = getEnvConfig();

        if (!cfg.cosmosKey) throw new Error('COSMOS_KEY is missing.');
        if (!cfg.cosmosEndpoint) throw new Error('COSMOS_ENDPOINT is missing.');

        const options: CosmosRepoOptions = {
            endpoint: cfg.cosmosEndpoint,
            key: cfg.cosmosKey,
            databaseId: cfg.databaseName,
            containerId: cfg.containerName,
        };

        cachedLoanRepo = new CosmosLoanRepo(options);
    }
    return cachedLoanRepo;
}

// Factory for listLoans use case
export function makeListLoans() {
    const deps = { loanRepo: getLoanRepo() };
    return (command: any) =>
        require('../app/list-loan').listLoans(deps, command);
}
export function makeCreateLoan() {
  const deps = { loanRepo: getLoanRepo() };
  return (params: any) => require('../app/create-loan').createLoanUseCase(deps, params);
}

export function makeEditLoan() {
  const deps = { loanRepo: getLoanRepo() };
  return (command: any) => require('../app/edit-loan').editLoan(deps, command);
}
