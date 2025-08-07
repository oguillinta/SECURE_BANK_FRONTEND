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
import { AuthService } from '../auth.service';
import { MsalService } from '@azure/msal-angular';
//import Keycloak, { KeycloakProfile } from 'keycloak-js';

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
  //userProfile: KeycloakProfile | null = {};

  //private keycloak = inject(Keycloak);

  ngOnInit(): void {
    this.loadUserProfile();
  }
  isSidenavOpen = true;

  constructor(private router: Router, private authService: MsalService) {}

  menuItems = [
    { icon: 'dashboard', label: 'Dashboard', route: '/app/dashboard' },
    {
      icon: 'account_balance_wallet',
      label: 'Accounts',
      route: '/app/accounts',
    },
    { icon: 'people', label: 'Customers', route: '/app/customer-list' },
    // { icon: 'swap_horiz', label: 'Transfers', route: '/transfers' },
    // { icon: 'payment', label: 'Payments', route: '/payments' },
    // { icon: 'credit_card', label: 'Cards', route: '/cards' },
    { icon: 'trending_up', label: 'Report', route: '/app/account-summary' },
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
    this.router.navigate([item.route]);
  }

  onNotificationClick() {
    console.log('Show notifications');
  }

  onProfileClick() {
    console.log('Show profile menu');
  }

  onLogout() {
    console.log('Logout user');
    this.authService.logout();
  }

  async loadUserProfile() {
    // if (this.keycloak?.authenticated) {
    //   this.userProfile = await this.keycloak.loadUserProfile();
    //   console.log(this.userProfile);
    // }
  }

  login() {
    //this.keycloak.login();
    sessionStorage.setItem('swLogin', '1');
  }
}
