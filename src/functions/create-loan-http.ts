import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { CreateLoanParams } from '../domain/Loan';
import { createLoanUseCase } from '../app/create-loan';
import { getLoanRepo } from '../config/appServices';

app.http('create-loan-http', {
  methods: ['POST'],
  handler: async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const params: CreateLoanParams = await request.json() as CreateLoanParams;

      if (!params) {
        return {
          status: 400,
          body: JSON.stringify({ error: 'Request body is required' }),
        };
      }

      const deps = { loanRepo: getLoanRepo() };
      const result = await createLoanUseCase(deps, params);

      if (!result.ok) {
        return {
          status: 400,
          body: JSON.stringify({ errors: (result as { ok: false; errors: string[] }).errors }),
        };
      }

      return {
        status: 201,
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
