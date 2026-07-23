import { b2cAuthServices } from "@/lib/nextAuth/services/auth.b2c";
import { NextAuthOptions } from "next-auth";
import AzureADB2CProvider from "next-auth/providers/azure-ad-b2c";

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  debug: false,
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    AzureADB2CProvider({
      tenantId: process.env.AZURE_AD_B2C_TENANT_NAME,
      clientId: process.env.AZURE_AD_B2C_CLIENT_ID!,
      clientSecret: "none", // necessário só para o TS não quebrar, será ignorado
      primaryUserFlow: process.env.AZURE_AD_B2C_PRIMARY_USER_FLOW,
      authorization: { params: { scope: "offline_access openid" } },
      checks: ["pkce"],
      client: {
        token_endpoint_auth_method: "none",
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      try {
        if (trigger === undefined && token.id_token_expires_in && !account) {
          const refreshIdToken = await b2cAuthServices.refreshToken(
            token,
            session
          );

          return refreshIdToken;
        }

        const jwtResponse = await b2cAuthServices.handleSignIn({
          account,
          token,
          user,
          session,
          trigger,
        });

        return jwtResponse;
      } catch {
        token.error = "refresh-token-expired";
        delete token.access_token;
        delete token.refresh_token;
        delete token.id_token_expires_in;
        delete token.user;
      }
      return token;
    },
    async session({ session, token }) {
      session.name = token.name;
      session.status = token.status;
      session.image = token.image;
      session.email = token.email;
      session.company = token.company;
      session.idEntidadeSessao = token.company?.id;
      session.id_token = token?.id_token;
      session.error = token.error;
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Se a url de destino contiver 'denied', redireciona para a home
      if (url.includes("denied")) return baseUrl;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
};
