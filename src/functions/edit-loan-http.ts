import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { makeEditLoan } from '../config/appServices';

const getCorsHeaders = () => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
});

async function editLoanHttp(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  if (request.method === 'OPTIONS') {
    return { status: 204, headers: getCorsHeaders() };
  }

  const editLoan = makeEditLoan();
  const command = await request.json();
  const result = await editLoan(command);

  const isSuccess = result.success;
  const response: HttpResponseInit = {
    status: isSuccess ? 200 : 400,
    headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
    jsonBody: isSuccess
      ? result.value
      : { errors: (result as { errors: readonly string[] }).errors },
  };

  return response;
}

app.http('editLoanHttp', {
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'loans/edit',
  handler: editLoanHttp,
});
