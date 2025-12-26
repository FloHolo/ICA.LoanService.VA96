import {
    CosmosLoanRepo,
    CosmosRepoOptions,
} from "../infra/cosmos-Loan-repo";
import { LoanRepo } from "../domain/Loan-Repo";
import { getEnvConfig } from "./envConfig";
import { EventGridLoanEventPublisher, EventGridOptions } from '../infra/eventgrid-loan-event-publisher';
import { DummyLoanEventPublisher } from '../infra/dummy-loan-event-publisher';
import type { LoanEventPublisher } from '../app/loan-event-publisher';
import { OAuth2Validator } from '../infra/oauth2-validator';
import type { AuthContext } from '../app/auth-context';
import type { HttpRequest } from '@azure/functions';
let cachedOAuth2Validator: OAuth2Validator | null = null;

export const getOAuth2Validator = (): OAuth2Validator | null => {
    if (!cachedOAuth2Validator) {
        const jwksUri = process.env.OAUTH2_JWKS_URI;
        const issuer = process.env.OAUTH2_ISSUER;
        const audience = process.env.OAUTH2_AUDIENCE;

        if (jwksUri && issuer && audience) {
            cachedOAuth2Validator = new OAuth2Validator({
                jwksUri,
                issuer,
                audience,
            });
        }
    }
    return cachedOAuth2Validator;
};
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


// Factory for listLoans use case with auth support
export async function makeListLoans(request: HttpRequest) {
    const validator = getOAuth2Validator();
    const authContext: AuthContext = validator
        ? await validator.validate(request)
        : { authenticated: false, scopes: [] };
    const deps = { loanRepo: getLoanRepo(), authContext };
    return (command: any) =>
        require('../app/list-loan').listLoans(deps, command);
}


// Factory for createLoan use case with auth support
export async function makeCreateLoan(request: HttpRequest) {
    const validator = getOAuth2Validator();
    const authContext: AuthContext = validator
        ? await validator.validate(request)
        : { authenticated: false, scopes: [] };
    const deps = {
        loanRepo: getLoanRepo(),
        loanEventPublisher: getLoanEventPublisher(),
        authContext,
    };
    return (params: any) => require('../app/create-loan').createLoanUseCase(deps, params);
}



// Factory for editLoan use case with auth support
export async function makeEditLoan(request: HttpRequest) {
    const validator = getOAuth2Validator();
    const authContext: AuthContext = validator
        ? await validator.validate(request)
        : { authenticated: false, scopes: [] };
    const deps = {
        loanRepo: getLoanRepo(),
        loanEventPublisher: getLoanEventPublisher(),
        authContext,
    };
    return (command: any) => require('../app/edit-loan').editLoan(deps, command);
}
