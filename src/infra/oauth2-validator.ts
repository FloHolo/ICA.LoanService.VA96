import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { HttpRequest } from '@azure/functions';
import type { AuthContext } from '../app/auth-context';

export type OAuth2ValidatorOptions = {
  jwksUri: string;
  issuer: string;
  audience: string;
};

export class OAuth2Validator {
  private jwks: ReturnType<typeof createRemoteJWKSet>;
  private issuer: string;
  private audience: string;

  constructor(options: OAuth2ValidatorOptions) {
    this.jwks = createRemoteJWKSet(new URL(options.jwksUri));
    this.issuer = options.issuer;
    this.audience = options.audience;
  }

  /**
   * Extract Bearer token from Authorization header
   */
  private extractToken(request: HttpRequest): string | null {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      return null;
    }

    return parts[1];
  }

  /**
   * Validate the access token and extract authentication context
   */
  async validate(request: HttpRequest): Promise<AuthContext> {
    const token = this.extractToken(request);

    if (!token) {
      return { authenticated: false, scopes: [] };
    }

    try {
      const { payload } = await jwtVerify(token, this.jwks, {
        issuer: this.issuer,
        audience: this.audience,
      });

      // Extract scopes from token
      // OAuth2 tokens typically include scopes in the 'scope' claim as a space-separated string
      // or as a 'scp' claim (Azure AD style) as an array or string
      let scopes: string[] = [];

      if (typeof payload.scope === 'string') {
        scopes = payload.scope.split(' ').filter((s) => s.trim() !== '');
      } else if (typeof payload.scp === 'string') {
        scopes = payload.scp.split(' ').filter((s) => s.trim() !== '');
      } else if (Array.isArray(payload.scp)) {
        scopes = payload.scp;
      }

      return {
        authenticated: true,
        scopes,
        subject: typeof payload.sub === 'string' ? payload.sub : undefined,
      };
    } catch (error) {
      // Token validation failed (expired, invalid signature, wrong issuer/audience, etc.)
      console.warn('Token validation failed:', (error as Error).message);
      return { authenticated: false, scopes: [] };
    }
  }

  /**
   * Check if the auth context has a specific scope
   */
  hasScope(authContext: AuthContext, scope: string): boolean {
    return authContext.authenticated && authContext.scopes.includes(scope);
  }
}