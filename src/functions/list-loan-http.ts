import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { makeListLoans } from '../config/appServices';

const getCorsHeaders = () => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
});

async function listLoanHttp(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  if (request.method === 'OPTIONS') {
    return { status: 204, headers: getCorsHeaders() };
  }

  const listLoans = await makeListLoans(request);
  const command = {};
  const result = await listLoans(command);

  if (!result.success) {
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
      jsonBody: { errors: result.errors },
    };
  }

  return {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
    jsonBody: {
      loans: result.loans,          // ✅ FIX
      totalCount: result.totalCount,
    },
  };
}

app.http('listLoanHttp', {
  methods: ['GET', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'loans',
  handler: listLoanHttp,
});
