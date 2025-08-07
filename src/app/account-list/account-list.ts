import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AccountService } from '../account.service';
import { AccountSummary } from '../interfaces/account-summary-response.interface';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { filter, take } from 'rxjs';
import { InteractionStatus } from '@azure/msal-browser';
import { MsalBroadcastService } from '@azure/msal-angular';

export interface BankAccount {
  accountNumber: string;
  customerId: string;
  accountType: string;
  balance: number;
  getDailyTransactionLimit: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

type ProfileType = {
  givenName?: string;
  surname?: string;
  userPrincipalName?: string;
  id?: string;
  displayName?: string;
};

@Component({
  selector: 'account-list',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatDividerModule,
    MatProgressBarModule,
  ],
  templateUrl: './account-list.html',
  styleUrl: './account-list.css',
})
export class AccountListComponent implements OnInit {
  private accountService = inject(AccountService);
  private userService = inject(UserService);
  private router = inject(Router);
  private http = inject(HttpClient);
  profile: ProfileType | undefined;
  // customerName = 'John Doe';
  customerId = 'BUS-456789123';

  accounts: AccountSummary[] = [];

  totalBalance: number = 0;
  activeAccounts: number = 0;

  ngOnInit() {
    this.calculateTotals();
    this.getProfile(environment.apiConfig.uri);
    //this.loadAccountsByCustomerEmail();

    this.loadAccountsByCustomerEmail();

    //this.authService.getToken();
  }

  // get userFullName() {
  //   return 'Dummy user';
  // }

  loadAccountsByCustomerEmail() {
    //const userPrincipal: string = this.profile?.userPrincipalName ?? '';

    this.userService.getCurrentUserEmail().subscribe({
      next: (email) => {
        console.log('User email:', email);

        this.accountService.getAccountsSummaryByEmail(email).subscribe({
          next: (accounts) => {
            console.log('Accounts loaded:', accounts);
            this.accounts = accounts;
          },
          error: (error) => {
            console.error('Error loading accounts:', error);
          },
        });
      },
      error: (error) => {
        console.error('Error getting user email:', error);
      },
    });
  }

  calculateTotals() {
    this.activeAccounts = this.accounts.filter(
      (account) => account.status === 'ACTIVE'
    ).length;
    this.totalBalance = this.accounts
      .filter((account) => account.accountType !== 'LOAN')
      .reduce((sum, account) => sum + account.balance, 0);
  }

  getAccountIcon(accountType: string): string {
    const icons: { [key: string]: string } = {
      BUSINESS: 'business',
      CHECKING: 'account_balance_wallet',
      SAVINGS: 'savings',
      INVESTMENT: 'trending_up',
      LOAN: 'credit_score',
    };
    return icons[accountType] || 'account_balance';
  }

  getAccountTypeLabel(accountType: string): string {
    const labels: { [key: string]: string } = {
      BUSINESS: 'Business Account',
      CHECKING: 'Checking Account',
      SAVINGS: 'Savings Account',
      INVESTMENT: 'Investment Account',
      LOAN: 'Loan Account',
    };
    return labels[accountType] || accountType;
  }

  getStatusChipClass(status: string): string {
    return status === 'ACTIVE' ? 'status-active' : 'status-inactive';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getUsagePercentage(account: AccountSummary): number {
    if (
      account.accountType === 'LOAN' ||
      account.getDailyTransactionLimit === 0
    ) {
      return 0;
    }
    return Math.min(
      (Math.abs(account.balance) / account.getDailyTransactionLimit) * 100,
      100
    );
  }

  onViewStatement(account: AccountSummary) {
    console.log('View statement for account:', account.accountNumber);
  }

  onTransfer(account: AccountSummary) {
    console.log('Transfer from account:', account.accountNumber);
  }

  onPayBills(account: AccountSummary) {
    console.log('Pay bills from account:', account.accountNumber);
  }

  onAccountDetails(account: AccountSummary) {
    console.log('View details for account:', account.accountNumber);
  }

  onDownloadStatement(account: AccountSummary) {
    console.log('Download statement for account:', account.accountNumber);
  }

  onFreezeAccount(account: AccountSummary) {
    console.log('Freeze account:', account.accountNumber);
    this.router.navigate(['/app/account-freeze', account.accountNumber]);
  }

  onOpenNewAccount() {
    console.log('Account create redirect...');

    this.router.navigate(['/app/account-create']);
  }

  countActiveAccounts(): Number {
    return this.accounts.filter((account) => account.status == 'ACTIVE').length;
  }

  getProfile(url: string) {
    this.http.get(url).subscribe((profile) => {
      this.profile = profile;
      console.log(profile);
    });
  }
}
