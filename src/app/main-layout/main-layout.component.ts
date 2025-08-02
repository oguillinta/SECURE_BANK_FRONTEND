import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterOutlet } from '@angular/router';
import Keycloak, { KeycloakProfile } from 'keycloak-js';

@Component({
  selector: 'main-layout',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    RouterOutlet,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayoutComponent {
  title = 'RedBank - Modern Banking Application';
  userProfile: KeycloakProfile | null = {};

  private keycloak = inject(Keycloak);

  ngOnInit(): void {
    this.loadUserProfile();
  }
  isSidenavOpen = true;

  constructor(private router: Router) {}

  menuItems = [
    { icon: 'dashboard', label: 'Dashboard', route: '/dashboard' },
    { icon: 'account_balance_wallet', label: 'Accounts', route: '/accounts' },
    { icon: 'people', label: 'Customers', route: '/customer-list' },
    // { icon: 'swap_horiz', label: 'Transfers', route: '/transfers' },
    // { icon: 'payment', label: 'Payments', route: '/payments' },
    // { icon: 'credit_card', label: 'Cards', route: '/cards' },
    { icon: 'trending_up', label: 'Report', route: '/account-summary' },
    // { icon: 'receipt_long', label: 'Statements', route: '/statements' },
    //{ icon: 'ac_unit', label: 'Account Freeze', route: '/account-freeze' },
    // { icon: 'support_agent', label: 'Support', route: '/support' },
  ];

  userNotifications = 3;
  userName = 'John Doe';
  userEmail = 'john.doe@email.com';

  toggleSidenav() {
    this.isSidenavOpen = !this.isSidenavOpen;
  }

  onMenuItemClick(item: any) {
    console.log('Navigate to:', item.route);
    // Navigation logic will be implemented later
    this.router.navigate([item.route]);
  }

  onNotificationClick() {
    console.log('Show notifications');
    // Notification logic will be implemented later
  }

  onProfileClick() {
    console.log('Show profile menu');
    // Profile menu logic will be implemented later
  }

  onLogout() {
    console.log('Logout user');
    this.keycloak.logout();
    // Logout logic will be implemented later
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
}
