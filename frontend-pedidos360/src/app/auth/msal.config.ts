import {
  BrowserCacheLocation,
  InteractionType,
  IPublicClientApplication,
  LogLevel,
  PublicClientApplication,
} from '@azure/msal-browser';
import { MsalGuardConfiguration, MsalInterceptorConfiguration } from '@azure/msal-angular';
import { environment } from '../../environments/environment';

// Aplicación MSAL: Microsoft Entra ID (single tenant)
export function msalInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: environment.msal.clientId,
      authority: `https://login.microsoftonline.com/${environment.msal.tenantId}`,
      redirectUri: window.location.origin,
      postLogoutRedirectUri: `${window.location.origin}/login`,
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
    },
    system: {
      loggerOptions: {
        logLevel: LogLevel.Warning,
        loggerCallback: (level, message) => {
          if (level === LogLevel.Error) {
            console.error(message);
          }
        },
      },
    },
  });
}

// MsalGuard: si no hay sesión, redirige al login de Entra ID
export function msalGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: { scopes: [environment.api.scope] },
    loginFailedRoute: '/login',
  };
}

// MsalInterceptor: adjunta "Authorization: Bearer <access_token>" a toda llamada al API Gateway
export function msalInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, string[]>();
  protectedResourceMap.set(`${environment.api.baseUrl}/api/*`, [environment.api.scope]);

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap,
  };
}
