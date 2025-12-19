export interface EnvConfig {
  cosmosKey?: string;
  cosmosEndpoint?: string;
  databaseName: string;
  containerName: string;
  loanContainerName: string;
}

export function getEnvConfig(): EnvConfig {
  return {
    cosmosKey: process.env.COSMOS_KEY,
    cosmosEndpoint: process.env.COSMOS_ENDPOINT,
    databaseName: process.env.DATABASE_NAME || 'loan-db',
    containerName: process.env.CONTAINER_NAME || 'loan',
    loanContainerName: process.env.LOAN_CONTAINER_NAME || 'loan',
  };
}

