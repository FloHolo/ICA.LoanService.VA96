import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
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
  const params = await request.json();
  const result = await createLoan(params);

  const isSuccess = result.success;
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
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'loans/create',
  handler: createLoanHttp,
});
