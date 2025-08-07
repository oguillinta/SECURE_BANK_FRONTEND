import { Component, inject } from '@angular/core';
import { AccountService } from '../account.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface AccountSummaryReport {
  accountType: string;
  totalAccounts: number;
  totalBalance: number;
  averageBalance: number;
  activeAccountsCount: number;
  frozenAccountsCount: number;
  closedAccountsCount: number;
}

@Component({
  selector: 'app-account-summary',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  templateUrl: './account-summary.html',
  styleUrl: './account-summary.css',
})
export class AccountSummaryComponent {
  private accountService = inject(AccountService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  isLoading = true;
  summaryData: AccountSummaryReport[] = [];
  totalAccounts = 0;
  totalBalance = 0;
  lastUpdated = '';

  // Chart data
  chartData: any[] = [];
  balanceChartData: any[] = [];

  ngOnInit(): void {
    this.loadAccountsSummary();
  }

  private loadAccountsSummary(): void {
    this.isLoading = true;

    this.accountService.getAccountsSummary().subscribe({
      next: (response: AccountSummaryReport[]) => {
        console.log('Accounts summary loaded:', response);
        this.summaryData = response;
        this.calculateTotals();
        this.prepareChartData();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading accounts summary:', error);
        this.isLoading = false;
        this.snackBar.open('Failed to load accounts summary', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
        this.loadSampleData();
      },
    });
  }

  private calculateTotals(): void {
    this.totalAccounts = this.summaryData.reduce(
      (sum, item) => sum + item.totalAccounts,
      0
    );
    this.totalBalance = this.summaryData.reduce(
      (sum, item) => sum + item.totalBalance,
      0
    );
    this.lastUpdated = new Date().toISOString();
  }

  private loadSampleData(): void {
    // Sample data based on your API response
    const sampleData: AccountSummaryReport[] = [
      {
        accountType: 'BUSINESS',
        totalAccounts: 3,
        totalBalance: 242850.25,
        averageBalance: 80950.083333,
        activeAccountsCount: 1,
        frozenAccountsCount: 2,
        closedAccountsCount: 0,
      },
      {
        accountType: 'SAVINGS',
        totalAccounts: 3,
        totalBalance: 123751.3,
        averageBalance: 41250.433333,
        activeAccountsCount: 2,
        frozenAccountsCount: 1,
        closedAccountsCount: 0,
      },
    ];

    this.summaryData = sampleData;
    this.calculateTotals();
    this.prepareChartData();
    this.isLoading = false;
  }

  private prepareChartData(): void {
    this.chartData = this.summaryData.map((item) => ({
      name: this.getAccountTypeLabel(item.accountType),
      value: item.totalAccounts,
      color: this.getAccountTypeColor(item.accountType),
    }));

    this.balanceChartData = this.summaryData.map((item) => ({
      name: this.getAccountTypeLabel(item.accountType),
      value: item.totalBalance,
      percentage: (item.totalBalance / this.totalBalance) * 100,
      color: this.getAccountTypeColor(item.accountType),
    }));
  }

  getAccountTypeLabel(accountType: string): string {
    const labels: { [key: string]: string } = {
      BUSINESS: 'Business Accounts',
      CHECKING: 'Checking Accounts',
      SAVINGS: 'Savings Accounts',
      INVESTMENT: 'Investment Accounts',
      CURRENT: 'Current Accounts',
    };
    return labels[accountType] || accountType;
  }

  getAccountTypeColor(accountType: string): string {
    const colors: { [key: string]: string } = {
      BUSINESS: '#007bff',
      CHECKING: '#dc3545',
      SAVINGS: '#28a745',
      INVESTMENT: '#6f42c1',
      CURRENT: '#fd7e14',
    };
    return colors[accountType] || '#6c757d';
  }

  getAccountTypeIcon(accountType: string): string {
    const icons: { [key: string]: string } = {
      BUSINESS: 'business',
      CHECKING: 'account_balance_wallet',
      SAVINGS: 'savings',
      INVESTMENT: 'trending_up',
      CURRENT: 'account_balance',
    };
    return icons[accountType] || 'account_balance';
  }

  getStatusPercentage(activeCount: number, totalCount: number): number {
    return totalCount > 0 ? (activeCount / totalCount) * 100 : 0;
  }

  onRefreshData(): void {
    this.loadAccountsSummary();
    this.snackBar.open('Data refreshed successfully', 'Close', {
      duration: 2000,
      panelClass: ['success-snackbar'],
    });
  }

  onExportReport(): void {
    console.log('Exporting accounts summary report...');
    this.snackBar.open('Report export started...', 'Close', {
      duration: 3000,
      panelClass: ['info-snackbar'],
    });
  }

  onViewAccountDetails(accountType: string): void {
    console.log('View details for account type:', accountType);
    this.router.navigate(['/app/accounts'], {
      queryParams: { type: accountType },
    });
  }

  onGenerateDetailedReport(): void {
    console.log('Generate detailed report...');
    this.snackBar.open('Generating detailed report...', 'Close', {
      duration: 3000,
      panelClass: ['info-snackbar'],
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US').format(num);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  getTotalActiveAccounts(): number {
    return this.summaryData.reduce(
      (sum, item) => sum + item.activeAccountsCount,
      0
    );
  }

  getTotalFrozenAccounts(): number {
    return this.summaryData.reduce(
      (sum, item) => sum + item.frozenAccountsCount,
      0
    );
  }

  getTotalClosedAccounts(): number {
    return this.summaryData.reduce(
      (sum, item) => sum + item.closedAccountsCount,
      0
    );
  }

  getOverallAverageBalance(): number {
    return this.totalAccounts > 0 ? this.totalBalance / this.totalAccounts : 0;
  }

  getHealthPercentage(): number {
    const activeAccounts = this.getTotalActiveAccounts();
    return this.totalAccounts > 0
      ? (activeAccounts / this.totalAccounts) * 100
      : 0;
  }

  getHealthStatus(): string {
    const healthPercentage = this.getHealthPercentage();
    if (healthPercentage >= 80) return 'Excellent';
    if (healthPercentage >= 60) return 'Good';
    if (healthPercentage >= 40) return 'Fair';
    return 'Needs Attention';
  }

  getHealthStatusClass(): string {
    const healthPercentage = this.getHealthPercentage();
    if (healthPercentage >= 80) return 'health-excellent';
    if (healthPercentage >= 60) return 'health-good';
    if (healthPercentage >= 40) return 'health-fair';
    return 'health-poor';
  }
}
