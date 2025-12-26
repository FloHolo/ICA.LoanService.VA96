export type AuthContext = {
  authenticated: boolean;
  scopes: string[];
  subject?: string;
  error?: string;
};

export const __authContextModule = {};