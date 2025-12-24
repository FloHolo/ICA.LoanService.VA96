import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';

const getCorsHeaders = () => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
});

async function healthHttp(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  if (request.method === 'OPTIONS') {
    return { status: 204, headers: getCorsHeaders() };
  }

  return {
    status: 200, 
    headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
    jsonBody: { status: 'ok' },
  };
}

app.http('healthHttp', {
  methods: ['GET', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'health',
  handler: healthHttp,
});
