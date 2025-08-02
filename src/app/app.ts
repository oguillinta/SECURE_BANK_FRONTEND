import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import Keycloak, { KeycloakProfile } from 'keycloak-js';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  title = 'Secure Bank - Modern Banking Application';
  userProfile: KeycloakProfile | null = {};

  private keycloak = inject(Keycloak);

  ngOnInit(): void {
    this.loadUserProfile();
  }

  async loadUserProfile() {
    if (this.keycloak?.authenticated) {
      this.userProfile = await this.keycloak.loadUserProfile();
      console.log(this.userProfile);
    }
  }

  login() {
    this.keycloak.login();
    sessionStorage.setItem('swLogin', '1');
  }

  logout() {
    this.keycloak.logout();
  }
}
