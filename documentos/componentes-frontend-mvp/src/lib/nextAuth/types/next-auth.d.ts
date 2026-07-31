import { DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface EntityAccessAndRoles {
    Role: "basic" | "manager" | "admin";
    IdEntity: string;
    DisplayName: string;
  }
  interface Session {
    id_token?: string;
    idEntidadeSessao?: string;
    name?: string | null | undefined;
    status?: string;
    image?: string;
    email?: string;
    lastAccess?: date | null;
    company?: {
      id?: string;
      name?: string;
      cnpj?: string;
      sigla?: string;
      role?: string;
      logoTipo?: string;
      tipo?: string;
      uf?: string;
    };
    error?: "refresh-token-expired" | null;
  }

  interface User extends DefaultUser {
    userId?: number;
    role?: string;
    status?: string;
    image?: string;
    lastAccess?: date | null;
    company: {
      sigla: string;
      cnpj: string;
      tipo: string;
    };
    companyName?: string | null | undefined;
    companyCode?: string | null | undefined;
    companyUrlImage?: string | null | undefined;
  }

  interface Account extends DefaultAccount {
    id_token_expires_in: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    name?: string | null | undefined;
    status?: string;
    image?: string;
    email?: string;
    lastAccess?: date | null;
    company?: {
      id?: string;
      name?: string;
      cnpj?: string;
      sigla?: string;
      role?: string;
      logoTipo?: string;
      tipo?: string;
      uf?: string;
    };
    // entities: any;
    access_token?: string;
    refresh_token?: string;
    expires_at?: number;
    id_token_expires_in?: number;
    id_token?: string;
    error?: "refresh-token-expired" | null;
  }
}
