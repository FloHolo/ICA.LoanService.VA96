import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { v4 as uuidv4 } from 'uuid';
import { makeCreateLoan } from '../config/appServices';

const getCorsHeaders = () => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
});

async function createLoanHttp(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  if (request.method === 'OPTIONS') {
    return { status: 204, headers: getCorsHeaders() };
  }

  const createLoan = makeCreateLoan();
  const params = await request.json() as Record<string, any>;
  // Ensure id is present; generate if missing
  if (!params.id) {
    params.id = uuidv4();
  }
  // Remove loanedAt and dueAt if not provided, so backend sets them
  if (!params.loanedAt) {
    delete params.loanedAt;
  }
  if (!params.dueAt) {
    delete params.dueAt;
  }
  const result = await createLoan(params);

  const isSuccess = result.ok;
  const response: HttpResponseInit = {
    status: isSuccess ? 201 : 400,
    headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
    jsonBody: isSuccess
      ? result.value
      : { errors: (result as { errors: readonly string[] }).errors },
  };

  return response;
}

app.http('createLoanHttp', {
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'loans/create',
  handler: createLoanHttp,
});
