import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AccountService } from '../account.service';
import { FreezeAccountResponse } from '../interfaces/freeze-account-response.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountSummary } from '../interfaces/account-summary-response.interface';
import { FreezeAccountRequest } from '../interfaces/freeze-account-request.interface';

export interface AccountFreezeRequest {
  accountNumber: string;
  action: string;
  freezeType: string;
  reason: string;
  authorizedBy: string;
  comments: string;
  reviewDate: string;
}

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

@Component({
  selector: 'account-freeze',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatDividerModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatStepperModule,
  ],
  templateUrl: './account-freeze.html',
  styleUrl: './account-freeze.css',
})
export class AccountFreezeComponent {
  freezeForm: FormGroup;
  confirmationForm: FormGroup;
  isLoading = false;
  isLoadingAccount = true;
  isLinear = true;

  private accountService = inject(AccountService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private formBuilder = inject(FormBuilder);

  // Account data - will be populated from API
  selectedAccount: AccountSummary | null = null;
  accountId: string | null = null;

  freezeTypes = [
    {
      value: 'FULL_FREEZE',
      label: 'Full Freeze',
      description: 'Blocks all transactions completely',
    },
    {
      value: 'DEBIT_FREEZE',
      label: 'Debit Freeze',
      description: 'Blocks outgoing transactions only',
    },
    {
      value: 'CREDIT_FREEZE',
      label: 'Credit Freeze',
      description: 'Blocks incoming transactions only',
    },
    {
      value: 'PARTIAL_FREEZE',
      label: 'Partial Freeze',
      description: 'Blocks transactions above certain limit',
    },
    {
      value: 'TEMPORARY_FREEZE',
      label: 'Temporary Freeze',
      description: 'Time-limited freeze with auto-unfreeze',
    },
  ];

  freezeReasons = [
    { value: 'SUSPICIOUS_ACTIVITY', label: 'Suspicious Activity Detected' },
    { value: 'FRAUD_PREVENTION', label: 'Fraud Prevention Measure' },
    {
      value: 'MULTIPLE_FAILED_LOGINS',
      label: 'Multiple Failed Login Attempts',
    },
    { value: 'COURT_ORDER', label: 'Court Order / Legal Requirement' },
    { value: 'CUSTOMER_REQUEST', label: 'Customer Request' },
    { value: 'COMPLIANCE_REVIEW', label: 'Compliance Review' },
    { value: 'UNAUTHORIZED_ACCESS', label: 'Unauthorized Access Attempts' },
    { value: 'ACCOUNT_INVESTIGATION', label: 'Account Investigation' },
    { value: 'RISK_MANAGEMENT', label: 'Risk Management Decision' },
    { value: 'OTHER', label: 'Other (Specify in Comments)' },
  ];

  authorizedOfficers = [
    { value: 'SECURITY_OFFICER_001', label: 'John Smith - Security Officer' },
    { value: 'BRANCH_MANAGER_002', label: 'Sarah Johnson - Branch Manager' },
    {
      value: 'COMPLIANCE_OFFICER_003',
      label: 'Michael Brown - Compliance Officer',
    },
    { value: 'RISK_MANAGER_004', label: 'Emily Davis - Risk Manager' },
    { value: 'SUPERVISOR_005', label: 'David Wilson - Supervisor' },
  ];

  constructor() {
    this.freezeForm = this.createFreezeForm();
    this.confirmationForm = this.createConfirmationForm();
  }

  ngOnInit() {
    // Get account ID from route parameters
    this.accountId = this.route.snapshot.paramMap.get('accountId');

    if (this.accountId) {
      this.loadAccountData(this.accountId);
    } else {
      // Fallback: check query parameters
      this.route.queryParams.subscribe((params) => {
        const accountIdParam = params['accountId'];
        if (accountIdParam) {
          this.accountId = accountIdParam;
          this.loadAccountData(this.accountId!); // Use non-null assertion since we checked above
        } else {
          this.handleNoAccountId();
        }
      });
    }
  }

  private handleNoAccountId(): void {
    this.snackBar.open(
      'No account ID provided. Redirecting to accounts list.',
      'Close',
      {
        duration: 3000,
        panelClass: ['error-snackbar'],
      }
    );

    // Redirect to accounts list after 2 seconds
    setTimeout(() => {
      this.router.navigate(['/app/accounts']);
    }, 2000);
  }

  private loadAccountData(accountId: string): void {
    this.isLoadingAccount = true;

    this.accountService.getAccountById(accountId).subscribe({
      next: (account: AccountSummary) => {
        console.log('Account loaded:', account);
        this.selectedAccount = account;
        this.populateAccountFields();
        this.isLoadingAccount = false;
      },
      error: (error: any) => {
        console.error('Error loading account:', error);
        this.isLoadingAccount = false;

        this.snackBar.open('Failed to load account details', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });

        // Fallback to sample data for demo purposes
        this.loadSampleAccountData();
      },
    });
  }

  private loadSampleAccountData(): void {
    // Sample data as fallback
    this.selectedAccount = {
      accountNumber: 'BUS-456789012-004',
      customerId: 'BUS-4567890123',
      accountType: 'BUSINESS',
      balance: 85600.25,
      getDailyTransactionLimit: 25000.0,
      status: 'ACTIVE',
      createdAt: '2025-07-13T16:05:06Z',
      updatedAt: '2025-07-13T16:05:06Z',
    };

    this.populateAccountFields();
  }

  private populateAccountFields(): void {
    if (this.selectedAccount) {
      this.freezeForm.patchValue({
        accountNumber: this.selectedAccount.accountNumber,
      });
    }
  }

  createFreezeForm(): FormGroup {
    return this.formBuilder.group({
      accountNumber: [{ value: '', disabled: true }],
      freezeType: ['', Validators.required],
      reason: ['', Validators.required],
      authorizedBy: ['', Validators.required],
      comments: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500),
        ],
      ],
      reviewDate: ['', Validators.required],
      urgentFreeze: [false],
      notifyCustomer: [true],
      transactionLimit: [null],
    });
  }

  createConfirmationForm(): FormGroup {
    return this.formBuilder.group({
      confirmAccountNumber: ['', Validators.required],
      confirmFreeze: [false, Validators.requiredTrue],
      officerSignature: ['', Validators.required],
    });
  }

  onFreezeTypeChange() {
    const freezeType = this.freezeForm.get('freezeType')?.value;
    const transactionLimitControl = this.freezeForm.get('transactionLimit');

    if (freezeType === 'PARTIAL_FREEZE') {
      transactionLimitControl?.setValidators([
        Validators.required,
        Validators.min(0),
      ]);
      transactionLimitControl?.enable();
    } else {
      transactionLimitControl?.clearValidators();
      transactionLimitControl?.disable();
      transactionLimitControl?.setValue(null);
    }
    transactionLimitControl?.updateValueAndValidity();
  }

  onSubmitFreeze() {
    if (!this.selectedAccount) {
      this.snackBar.open('No account selected', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      return;
    }

    if (this.freezeForm.valid && this.confirmationForm.valid) {
      this.isLoading = true;

      const freezeRequest: FreezeAccountRequest = {
        accountNumber: this.selectedAccount.accountNumber,
        action: 'FREEZE',
        freezeType: this.freezeForm.value.freezeType,
        reason: this.freezeForm.value.reason,
        authorizedBy: this.freezeForm.value.authorizedBy,
        comments: this.freezeForm.value.comments,
        reviewDate: this.freezeForm.value.reviewDate,
      };

      // Call the actual API when ready
      this.accountService
        .freezeAccount(freezeRequest, this.selectedAccount.accountNumber)
        .subscribe({
          next: (response: FreezeAccountResponse) => {
            console.log('Account frozen:', response);
            this.selectedAccount!.status = 'FROZEN';
            this.isLoading = false;
            this.snackBar.open(
              `Account ${response.accountNumber} has been frozen successfully.`,
              'Close',
              {
                duration: 5000,
                panelClass: ['success-snackbar'],
              }
            );
            this.logFreezeAction(freezeRequest);
          },
          error: (error: any) => {
            console.error('Error freezing account:', error);
            this.isLoading = false;
            this.snackBar.open('Failed to freeze account', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar'],
            });
          },
        });
    } else {
      this.markFormGroupTouched(this.freezeForm);
      this.markFormGroupTouched(this.confirmationForm);

      this.snackBar.open('Please complete all required fields', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
    }
  }

  onCancel() {
    this.router.navigate(['/app/accounts']);
  }

  onUnfreezeAccount() {
    if (!this.selectedAccount) return;

    const confirmUnfreeze = confirm(
      'Are you sure you want to unfreeze this account? This will restore normal account operations.'
    );

    if (confirmUnfreeze) {
      this.isLoading = true;

      // Call actual API when ready
      // this.accountService.unfreezeAccount(this.selectedAccount.accountNumber).subscribe({
      //   next: (response) => {
      //     this.selectedAccount!.status = 'ACTIVE';
      //     this.isLoading = false;
      //     this.snackBar.open('Account has been unfrozen successfully', 'Close', {
      //       duration: 3000,
      //       panelClass: ['success-snackbar'],
      //     });
      //   },
      //   error: (error) => {
      //     this.isLoading = false;
      //     this.snackBar.open('Failed to unfreeze account', 'Close', {
      //       duration: 3000,
      //       panelClass: ['error-snackbar'],
      //     });
      //   }
      // });

      // Simulate API call
      setTimeout(() => {
        this.selectedAccount!.status = 'ACTIVE';
        this.isLoading = false;

        this.snackBar.open('Account has been unfrozen successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });
      }, 1000);
    }
  }

  onViewAccountDetails() {
    if (this.selectedAccount) {
      this.router.navigate([
        '/app/accounts',
        this.selectedAccount.accountNumber,
      ]);
    }
  }

  onViewTransactionHistory() {
    if (this.selectedAccount) {
      this.router.navigate([
        '/app/accounts',
        this.selectedAccount.accountNumber,
        'transactions',
      ]);
    }
  }

  onGenerateFreezeReport() {
    console.log(
      'Generate freeze report for account:',
      this.selectedAccount?.accountNumber
    );
  }

  private logFreezeAction(request: FreezeAccountRequest) {
    console.log('Freeze Action Logged:', {
      timestamp: new Date().toISOString(),
      ...request,
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private formatDate(date: Date): string {
    return new Date(date).toISOString().split('T')[0];
  }

  getErrorMessage(formGroup: FormGroup, fieldName: string): string {
    const control = formGroup.get(fieldName);

    if (control?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }

    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `${this.getFieldLabel(
        fieldName
      )} must be at least ${minLength} characters`;
    }

    if (control?.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength'].requiredLength;
      return `${this.getFieldLabel(
        fieldName
      )} cannot exceed ${maxLength} characters`;
    }

    if (control?.hasError('min')) {
      return `${this.getFieldLabel(fieldName)} must be greater than 0`;
    }

    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      freezeType: 'Freeze Type',
      reason: 'Reason',
      authorizedBy: 'Authorized By',
      comments: 'Comments',
      reviewDate: 'Review Date',
      transactionLimit: 'Transaction Limit',
      confirmAccountNumber: 'Account Number Confirmation',
      officerSignature: 'Officer Signature',
    };

    return labels[fieldName] || fieldName;
  }

  getStatusChipClass(): string {
    if (!this.selectedAccount) return 'status-default';

    switch (this.selectedAccount.status) {
      case 'ACTIVE':
        return 'status-active';
      case 'FROZEN':
        return 'status-frozen';
      case 'SUSPENDED':
        return 'status-suspended';
      case 'CLOSED':
        return 'status-closed';
      default:
        return 'status-default';
    }
  }

  getAccountTypeLabel(): string {
    if (!this.selectedAccount) return '';

    const typeLabels: { [key: string]: string } = {
      BUSINESS: 'Business Account',
      CHECKING: 'Checking Account',
      SAVINGS: 'Savings Account',
      INVESTMENT: 'Investment Account',
      CURRENT: 'Current Account',
    };

    return (
      typeLabels[this.selectedAccount.accountType] ||
      this.selectedAccount.accountType
    );
  }

  getCustomerName(): string {
    return this.selectedAccount?.customerId || 'Customer';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  isAccountFrozen(): boolean {
    return this.selectedAccount?.status === 'FROZEN';
  }

  isAccountLoaded(): boolean {
    return !this.isLoadingAccount && this.selectedAccount !== null;
  }
}
