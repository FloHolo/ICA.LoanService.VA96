export type AuthContext = {
  authenticated: boolean;
  scopes: string[];
  subject?: string;
};

export const __authContextModule = {};