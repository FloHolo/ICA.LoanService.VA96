az group create \
 --name Loan-dev-va96-rg \
 --location uksouth

az cosmosdb create \
 --resource-group Loan-dev-va96-rg \
 --name loan-dev-va96-cosmos \
 --capabilities EnableServerless \
 --backup-policy-type Periodic \
 --backup-redundancy Local

az cosmosdb sql database create \
 --resource-group Loan-dev-va96-rg \
 --account-name loan-dev-va96-cosmos \
 --name loan-db

az cosmosdb sql container create \
 --resource-group Loan-dev-va96-rg \
 --account-name loan-dev-va96-cosmos \
 --database loan-db \
 --name products \
 --partition-key-path "/id"

export COSMOS_KEY=$(\
 az cosmosdb keys list \
 --resource-group shopping-dev-ab47-rg \
 --name shopping-dev-ab47-cosmos \
 --query primaryMasterKey \
 -o tsv \
)


npm install @azure/cosmos


cd /workspaces/ICA.LoanService.VA96 && npx tsc --noEmit