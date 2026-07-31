export interface Token {
  exp: number;
  nbf: number;
  ver: string;
  iss: string;
  sub: string;
  aud: string;
  iat: number;
  auth_time: number;
  idp: string;
  name: string;
  oid: string;
  extension_Company: string;
  given_name: string;
  family_name: string;
  extension_Termos: boolean;
  emails: string[];
  extension_Roles: ExtensionRole[];
  extension_Entidade: string;
  tfp: string;
}

export interface ExtensionRole {
  Role: string;
  IdEntity: string;
  DisplayName: string;
}

export interface ExtensionEntidade {
  id: string;
  nome: string;
  CNPJ: string;
  sigla: string;
  logotipo: string;
  grau: string;
  UF: string;
  role: string;
}
