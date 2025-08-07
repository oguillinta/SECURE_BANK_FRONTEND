import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'unauthorized',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './unauthorized.html',
  styleUrl: './unauthorized.css',
})
export class UnauthorizedComponent {
  constructor(private router: Router) {}

  goToDashboard() {
    this.router.navigate(['/app/dashboard']);
  }

  goBack() {
    window.history.back();
  }

  contactSupport() {
    // In a real app, this would open a support ticket or redirect to support
    console.log('Contact support clicked');
    this.router.navigate(['/app/support']);
  }

  logout() {
    // In a real app, this would clear authentication tokens and redirect to login
    console.log('Logout clicked');
    // Clear any stored auth tokens here
    // this.authService.logout();

    // For now, just navigate to a login route (you'll implement this later)
    console.log('Redirecting to login...');
  }
}
