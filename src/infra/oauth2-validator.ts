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
      return { authenticated: false, scopes: [], error: 'No Authorization header or Bearer token found' };
    }

    try {
      const { payload } = await jwtVerify(token, this.jwks, {
        issuer: this.issuer,
        audience: this.audience,
      });

      // Extract scopes from token
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
      const errMsg = (error as Error).message || 'Unknown token validation error';
      console.warn('Token validation failed:', errMsg);
      return { authenticated: false, scopes: [], error: errMsg };
    }
  }

  /**
   * Check if the auth context has a specific scope
   */
  hasScope(authContext: AuthContext, scope: string): boolean {
    return authContext.authenticated && authContext.scopes.includes(scope);
  }
}