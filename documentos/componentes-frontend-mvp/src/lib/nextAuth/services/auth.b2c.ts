import { jwtDecode } from "jwt-decode";
import { Account, Session, User } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import { JWT } from "next-auth/jwt";
import { ExtensionEntidade, Token } from "../types/jwt-giac";

interface IRequestHandleSignin {
  token: JWT;
  user: User | AdapterUser;
  account: Account | null;
  trigger?: "signIn" | "signUp" | "update";
  session?: Session;
}

interface IResponseRefreshTokenB2C {
  id_token: string;
  token_type: string;
  not_before: number;
  /** @default 3600 1h */
  id_token_expires_in: number;
  profile_info: string;
  scope: string;
  refresh_token: string;
  refresh_token_expires_in: number;
}

const URL_REFRESH_TOKEN = `https://${process.env.AZURE_AD_B2C_TENANT_NAME}.b2clogin.com/${process.env.AZURE_AD_B2C_TENANT_NAME}.onmicrosoft.com/${process.env.AZURE_AD_B2C_PRIMARY_USER_FLOW}/oauth2/v2.0/token`;
/**
 * Serviços de autenticação para Azure AD B2C.
 * Este módulo fornece funções auxiliares para lidar com o fluxo de autenticação do B2C,
 * incluindo o tratamento do sign-in e a atualização de tokens.
 */
export const b2cAuthServices = {
  /**
   * Lida com o processo de sign-in, extraindo informações do usuário e configurando o token.
   *
   * @param token - O token JWT atual.
   * @param account - As informações da conta do provedor de identidade (Azure AD B2C).
   * @returns Um novo token JWT com as informações do usuário e configurações adicionais.
   */
  handleSignIn: async ({
    account,
    token,
    user,
    session,
    trigger,
  }: IRequestHandleSignin) => {
    let email = "";
    let username = "";
    let userImage = "";
    let extension_Entidade;

    if (account?.id_token) {
      const decodedToken = (await jwtDecode(account.id_token)) as Token;
      token.dataAccessToken = decodedToken;

      if (
        decodedToken &&
        Object.keys(decodedToken?.extension_Entidade).length != 0
      ) {
        extension_Entidade = JSON.parse(
          decodedToken?.extension_Entidade
        ) as ExtensionEntidade;
      }
    }

    if (trigger === "update" && session?.idEntidadeSessao) {
      return { ...token, ...session };
    } else {
      email = user?.email ?? token?.email ?? "";
    }

    username = user?.name ?? token?.name ?? "";
    userImage = user?.image ?? token?.picture ?? "";

    const newToken: JWT = token;

    if (!newToken.company) {
      newToken.company = {};
    }

    // newToken.user.userId = 0;
    newToken.id = 0;

    newToken.nome = username;
    newToken.status = "A"; // ja estava assim, verificar se da pra pegar essa info
    newToken.image = userImage;
    newToken.email = email;
    newToken.company.id = extension_Entidade?.id;
    newToken.company.name = extension_Entidade?.nome;
    newToken.company.cnpj = extension_Entidade?.CNPJ;
    newToken.company.sigla = extension_Entidade?.sigla;
    newToken.company.role = extension_Entidade?.role;
    newToken.company.logoTipo = extension_Entidade?.logotipo;
    newToken.company.tipo = extension_Entidade?.grau; //conferir se tipo entra no gau
    newToken.company.uf = extension_Entidade?.UF;

    newToken.id_token = account?.id_token;
    newToken.refresh_token = account?.refresh_token;

    // if (entidade) {
    //   newToken.user.company = entidade;
    // }
    /**
     * Calcula o timestamp de expiração do id_token em milissegundos.
     * Soma o tempo de expiração do id_token (em segundos) ao timestamp atual (em milissegundos).
     */
    const idTokenExpiresAt = account?.id_token_expires_in
      ? Date.now() + account.id_token_expires_in * 1000
      : undefined;

    newToken.id_token_expires_in = idTokenExpiresAt;

    delete newToken.dataAccessToken;

    return newToken;
  },
  /**
   * Atualiza o token de acesso usando o refresh token.
   *
   * @param token - O token JWT atual, contendo o refresh token.
   * @returns Um novo token JWT com o access token atualizado, ou o token original
   *          se a atualização falhar ou não for necessária.
   * @throws Lança um erro se houver problemas durante a atualização do token.
   */
  refreshToken: async (token: JWT, session: Session): Promise<JWT> => {
    if (!token.refresh_token) {
      throw new Error("refresh-token-expired");
    }

    if (token.id_token_expires_in && Date.now() < token.id_token_expires_in) {
      return { ...token, ...session };
    }
    const refreshResponse = await fetch(URL_REFRESH_TOKEN, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: process.env.AZURE_AD_B2C_CLIENT_ID!,
        refresh_token: token.refresh_token!,
      }),
    });

    if (!refreshResponse.ok) throw new Error("refresh-token-expired");

    const data: IResponseRefreshTokenB2C = await refreshResponse.json();

    /**
     * Calcula o timestamp de expiração do id_token em milissegundos.
     * Soma o tempo de expiração do id_token (em segundos) ao timestamp atual (em milissegundos).
     */
    const idTokenExpiresAt = data?.id_token_expires_in
      ? Date.now() + data.id_token_expires_in * 1000
      : undefined;

    token.id_token = data.id_token;

    return {
      ...token,
      ...session,
      id_token_expires_in: idTokenExpiresAt,
      refresh_token: data.refresh_token,
      error: null,
    };
  },
};
