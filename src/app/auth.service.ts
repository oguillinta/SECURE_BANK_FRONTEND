import { inject, Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Direct injection of Keycloak instance (new way)
  private readonly keycloak = inject(Keycloak);

  getToken(): string | undefined {
    console.log('Current token:', this.keycloak.token);
    return this.keycloak.token;
  }

  getUsername(): string | undefined {
    return this.keycloak.tokenParsed?.['preferred_username'];
  }

  getUserRoles(): string[] {
    return this.keycloak.tokenParsed?.realm_access?.roles || [];
  }

  getClientRoles(clientId?: string): string[] {
    const resourceAccess = this.keycloak.tokenParsed?.resource_access;
    if (!resourceAccess || !clientId) return [];
    return resourceAccess[clientId]?.roles || [];
  }

  hasRole(role: string): boolean {
    return this.getUserRoles().includes(role);
  }

  hasClientRole(role: string, clientId?: string): boolean {
    return this.getClientRoles(clientId).includes(role);
  }

  logout(): void {
    this.keycloak.logout({
      redirectUri: window.location.origin,
    });
  }

  login(): void {
    this.keycloak.login();
  }

  isAuthenticated(): boolean {
    return this.keycloak.authenticated || false;
  }

  async refreshToken(): Promise<boolean> {
    try {
      return await this.keycloak.updateToken(30);
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.login();
      return false;
    }
  }

  // Get user profile information
  getUserProfile() {
    return {
      username: this.getUsername(),
      email: this.keycloak.tokenParsed?.['email'],
      firstName: this.keycloak.tokenParsed?.['given_name'],
      lastName: this.keycloak.tokenParsed?.['family_name'],
      roles: this.getUserRoles(),
      authenticated: this.isAuthenticated(),
    };
  }

  // Get token information for debugging
  getTokenInfo() {
    return {
      authenticated: this.isAuthenticated(),
      token: this.getToken()?.substring(0, 50) + '...',
      tokenParsed: this.keycloak.tokenParsed,
      refreshToken: this.keycloak.refreshToken?.substring(0, 50) + '...',
      timeLeft: this.keycloak.tokenParsed?.exp
        ? this.keycloak.tokenParsed.exp * 1000 - Date.now()
        : 0,
    };
  }

  // Get the Keycloak instance for advanced usage
  getKeycloakInstance(): Keycloak {
    return this.keycloak;
  }
}
