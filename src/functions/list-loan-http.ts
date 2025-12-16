import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { listLoans } from '../app/list-loan';
import { getLoanRepo } from '../config/appServices';

app.http('list-loan-http', {
  methods: ['GET'],
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const url = new URL(request.url);
      const userId = url.searchParams.get('userId') || undefined;

      const deps = { loanRepo: getLoanRepo() };
      const command = { userId };
      const loans = await listLoans(deps, command);

      return {
        status: 200,
        body: JSON.stringify(loans),
      };
    } catch (error) {
      return {
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      };
    }
  },
});
