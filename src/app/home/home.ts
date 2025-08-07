import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import {
  AuthenticationResult,
  EventMessage,
  EventType,
  InteractionStatus,
} from '@azure/msal-browser';
import { filter } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  imports: [CommonModule],
})
export class HomeComponent implements OnInit {
  loginDisplay = false;

  constructor(
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS)
      )
      .subscribe((result: EventMessage) => {
        console.log(result);
        const payload = result.payload as AuthenticationResult;
        this.authService.instance.setActiveAccount(payload.account);

        // Redirect to dashboard after successful login
        this.router.navigate(['/app/dashboard']);
      });

    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None)
      )
      .subscribe(() => {
        this.setLoginDisplay();
      });
  }

  setLoginDisplay() {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;

    // If user is already logged in when component loads, redirect to dashboard
    if (this.loginDisplay) {
      this.router.navigate(['/app/dashboard']);
    }
  }

  // Login method to trigger MSAL redirect
  login() {
    this.authService.loginRedirect();
  }

  // Optional: Add logout method for your template
  logout() {
    this.authService.logoutRedirect();
  }
}
