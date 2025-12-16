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
    databaseName: process.env.DATABASE_NAME || 'defaultdb',
    containerName: process.env.CONTAINER_NAME || 'catalogue',
    loanContainerName: process.env.LOAN_CONTAINER_NAME || 'loans',
  };
}
