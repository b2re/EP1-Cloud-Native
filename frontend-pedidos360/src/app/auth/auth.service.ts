import { computed, inject, Injectable, signal } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { AccountInfo, InteractionRequiredAuthError } from '@azure/msal-browser';
import { environment } from '../../environments/environment';
import { Role, Roles } from './roles';

// Claims del access token que usa la aplicación
export interface TokenClaims {
  oid?: string;
  name?: string;
  preferred_username?: string;
  roles?: string[];
  scp?: string;
  aud?: string;
  iss?: string;
  exp?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly msal = inject(MsalService);

  readonly account = signal<AccountInfo | null>(null);
  readonly claims = signal<TokenClaims | null>(null);

  readonly roles = computed(() => this.claims()?.roles ?? []);
  readonly scopes = computed(() => (this.claims()?.scp ?? '').split(' ').filter(Boolean));
  readonly isAdmin = computed(() => this.roles().includes(Roles.ADMIN));
  readonly isOperador = computed(() => this.roles().includes(Roles.OPERADOR));
  readonly isCliente = computed(() => this.roles().includes(Roles.CLIENTE));
  readonly isStaff = computed(() => this.isAdmin() || this.isOperador());

  // Cuenta activa de MSAL (después de procesar el redirect)
  refreshAccount(): AccountInfo | null {
    const instance = this.msal.instance;
    let active = instance.getActiveAccount();

    if (!active && instance.getAllAccounts().length > 0) {
      active = instance.getAllAccounts()[0];
      instance.setActiveAccount(active);
    }

    this.account.set(active);
    return active;
  }

  isLoggedIn(): boolean {
    return this.refreshAccount() !== null;
  }

  // Obtiene el access token de la API y lee sus claims (roles y scopes)
  async loadClaims(): Promise<TokenClaims | null> {
    if (this.claims()) {
      return this.claims();
    }

    const account = this.refreshAccount();
    if (!account) {
      return null;
    }

    const request = { scopes: [environment.api.scope], account };

    try {
      const result = await this.msal.instance.acquireTokenSilent(request);
      this.claims.set(decodeJwt(result.accessToken));
      return this.claims();
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        await this.msal.instance.acquireTokenRedirect(request);
      }
      throw error;
    }
  }

  hasAnyRole(...roles: Role[]): boolean {
    return roles.some((role) => this.roles().includes(role));
  }

  login(): void {
    this.msal.loginRedirect({
      scopes: [environment.api.scope],
      redirectStartPage: `${window.location.origin}/dashboard`,
    });
  }

  logout(): void {
    this.claims.set(null);
    this.msal.logoutRedirect({
      account: this.account(),
      postLogoutRedirectUri: `${window.location.origin}/login`,
    });
  }
}

// Decodifica el payload de un JWT (solo lectura; la firma la validan API Gateway y el BFF)
export function decodeJwt(token: string): TokenClaims {
  const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  const json = decodeURIComponent(
    atob(payload)
      .split('')
      .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join(''),
  );
  return JSON.parse(json);
}
