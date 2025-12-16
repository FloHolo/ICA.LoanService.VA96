import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { editLoan, EditLoanCommand } from '../app/edit-loan';
import { getLoanRepo } from '../config/appServices';

app.http('edit-loan-http', {
  methods: ['POST'],
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const command = await request.json() as EditLoanCommand;

      if (!command || !command.loanId || !command.action) {
        return {
          status: 400,
          body: JSON.stringify({ error: 'loanId and action are required' }),
        };
      }

      const deps = { loanRepo: getLoanRepo() };
      const result = await editLoan(deps, command);

      if (!result.ok) {
        return {
          status: 400,
          body: JSON.stringify({ errors: (result as { ok: false; errors: string[] }).errors }),
        };
      }

      return {
        status: 200,
        body: JSON.stringify(result.value),
      };
    } catch (error) {
      return {
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      };
    }
  },
});
