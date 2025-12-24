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

async function readyHttp(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  if (request.method === 'OPTIONS') {
    return { status: 204, headers: getCorsHeaders() };
  }

  return {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...getCorsHeaders() },
    jsonBody: { status: 'ready' },
  };
}

app.http('readyHttp', {
  methods: ['GET', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'ready',
  handler: readyHttp,
});
