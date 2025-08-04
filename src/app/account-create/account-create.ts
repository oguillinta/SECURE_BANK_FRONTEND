import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { AccountService } from '../account.service';
import { CustomerService } from '../customer.service';
import { GetAllCustomersResponse } from '../interfaces/get-all-customers-response.interface';

export interface AccountCreateRequest {
  customerId: string;
  accountType: string;
  initialBalance: number;
  dailyTransactionLimit: number;
  status: string;
}

export interface Customer {
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  customerType: 'BUSINESS' | 'PERSONAL' | 'VIP' | 'CORPORATE';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING' | 'CLOSED';
  totalBalance: number;
  accountsCount: number;
  lastActivity: Date;
  createdAt: Date;
}

@Component({
  selector: 'app-account-create',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatStepperModule,
    MatSnackBarModule,
    MatDividerModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatTableModule,
  ],
  templateUrl: './account-create.html',
  styleUrl: './account-create.css',
})
export class AccountCreateComponent implements OnInit {
  customerForm!: FormGroup;
  accountForm!: FormGroup;
  isLoading = false;
  currentStep = 1; // 1: Customer Selection, 2: Account Config, 3: Confirmation
  private accountService = inject(AccountService);
  private customerService = inject(CustomerService);

  customers: GetAllCustomersResponse[] = [];
  filteredCustomers: GetAllCustomersResponse[] = [];
  selectedCustomer: Customer | null = null;

  // Account types configuration
  accountTypes = [
    {
      value: 'CHECKING',
      label: 'Checking Account',
      description:
        'Everyday banking for transactions, bill payments, and daily expenses',
      icon: 'account_balance_wallet',
      minBalance: 0,
      defaultLimit: 5000,
    },
    {
      value: 'SAVINGS',
      label: 'Savings Account',
      description: 'Interest-bearing account for growing your money over time',
      icon: 'savings',
      minBalance: 100,
      defaultLimit: 2500,
    },
    {
      value: 'BUSINESS',
      label: 'Business Account',
      description: 'Comprehensive banking solution for business operations',
      icon: 'business',
      minBalance: 500,
      defaultLimit: 25000,
    },
    {
      value: 'INVESTMENT',
      label: 'Investment Account',
      description: 'Access to investment products and trading services',
      icon: 'trending_up',
      minBalance: 1000,
      defaultLimit: 10000,
    },
    {
      value: 'MONEY_MARKET',
      label: 'Money Market Account',
      description: 'Higher interest rates with limited monthly transactions',
      icon: 'account_balance',
      minBalance: 2500,
      defaultLimit: 5000,
    },
  ];

  // Table configuration
  displayedColumns: string[] = [
    'customer',
    'contact',
    'type',
    'status',
    'actions',
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    // this.filteredCustomers = this.customers.filter(
    //   (c) => c.status === 'ACTIVE'
    // );
    this.getAllFilteredCustomers();
  }

  private initializeForms(): void {
    this.customerForm = this.createCustomerForm();
    this.accountForm = this.createAccountForm();
  }

  createCustomerForm(): FormGroup {
    return this.formBuilder.group({
      customerSearch: [''],
      selectedCustomerId: ['', Validators.required],
      customerType: [''],
      status: [''],
      sortBy: ['lastName'],
      sortOrder: ['asc'],
    });
  }

  createAccountForm(): FormGroup {
    return this.formBuilder.group({
      accountType: ['', Validators.required],
      initialBalance: [0, [Validators.required, Validators.min(0)]],
      dailyTransactionLimit: [5000, [Validators.required, Validators.min(100)]],
      status: ['ACTIVE', Validators.required],
      agreementAccepted: [false, Validators.requiredTrue],
      notifyCustomer: [true],
    });
  }

  getAllFilteredCustomers(): void {
    this.customerService.getAll().subscribe({
      next: (customers) => {
        this.filteredCustomers = customers.filter(
          (customer) => customer.status === 'ACTIVE'
        );
      },
      error: (error: any) => {
        console.log(error);
      },
    });
  }

  // Step management methods
  getStepClass(step: number): string {
    if (step < this.currentStep) return 'completed';
    if (step === this.currentStep) return 'current';
    return '';
  }

  getStepIcon(step: number): string {
    if (step < this.currentStep) return 'check_circle';

    switch (step) {
      case 1:
        return 'person_search';
      case 2:
        return 'settings';
      case 3:
        return 'verified';
      default:
        return 'radio_button_unchecked';
    }
  }

  onCustomerSearch(): void {
    const searchText = this.customerForm.get('customerSearch')?.value || '';
    const customerType = this.customerForm.get('customerType')?.value || '';
    const status = this.customerForm.get('status')?.value || '';
    const sortBy = this.customerForm.get('sortBy')?.value || 'lastName';
    const sortOrder = this.customerForm.get('sortOrder')?.value || 'asc';

    let filtered = [...this.customers];

    // Apply text search
    if (searchText.length > 0) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(
        (customer) =>
          customer.firstName.toLowerCase().includes(searchLower) ||
          customer.lastName.toLowerCase().includes(searchLower) ||
          customer.email.toLowerCase().includes(searchLower) ||
          customer.customerId.toLowerCase().includes(searchLower)
      );
    }

    // Apply customer type filter
    if (customerType) {
      filtered = filtered.filter(
        (customer) => customer.customerType === customerType
      );
    }

    // Apply status filter
    if (status) {
      filtered = filtered.filter((customer) => customer.status === status);
    } else {
      // Default to showing only active customers
      filtered = filtered.filter((customer) => customer.status === 'ACTIVE');
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'firstName':
          aValue = a.firstName;
          bValue = b.firstName;
          break;
        case 'lastName':
          aValue = a.lastName;
          bValue = b.lastName;
          break;
        case 'customerType':
          aValue = a.customerType;
          bValue = b.customerType;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'createdAt':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        default:
          aValue = a.lastName;
          bValue = b.lastName;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });

    this.filteredCustomers = filtered;
  }

  onCustomerSelect(customer: Customer): void {
    this.selectedCustomer = customer;
    this.customerForm.patchValue({
      customerSearch: `${customer.firstName} ${customer.lastName} (${customer.customerId})`,
      selectedCustomerId: customer.customerId,
    });

    this.snackBar.open(
      `Selected ${customer.firstName} ${customer.lastName}`,
      'Close',
      {
        duration: 3000,
        panelClass: ['success-snackbar'],
      }
    );
  }

  onDeselectCustomer(): void {
    this.selectedCustomer = null;
    this.customerForm.patchValue({
      customerSearch: '',
      selectedCustomerId: '',
    });
  }

  // Navigation methods
  onNextStep(): void {
    if (this.selectedCustomer && this.customerForm.valid) {
      this.currentStep = 2;
      this.snackBar.open('Proceeding to account configuration', 'Close', {
        duration: 2000,
        panelClass: ['success-snackbar'],
      });
    }
  }

  goBackToCustomerSelection(): void {
    this.currentStep = 1;
  }

  proceedToConfirmation(): void {
    if (this.accountForm.valid && this.selectedCustomer) {
      this.currentStep = 3;
      this.snackBar.open('Review your account configuration', 'Close', {
        duration: 2000,
        panelClass: ['info-snackbar'],
      });
    } else {
      this.markFormGroupTouched(this.accountForm);
      this.snackBar.open('Please complete all required fields', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
    }
  }

  // Account configuration methods
  selectAccountType(accountType: string): void {
    const selectedType = this.accountTypes.find(
      (type) => type.value === accountType
    );
    if (selectedType) {
      this.accountForm.patchValue({
        accountType: accountType,
        initialBalance: selectedType.minBalance,
        dailyTransactionLimit: selectedType.defaultLimit,
      });

      this.snackBar.open(`Selected ${selectedType.label}`, 'Close', {
        duration: 2000,
        panelClass: ['success-snackbar'],
      });
    }
  }

  getSelectedAccountType() {
    const accountType = this.accountForm.get('accountType')?.value;
    return this.accountTypes.find((type) => type.value === accountType);
  }

  hasEnabledFeatures(): boolean {
    return this.accountForm.get('notifyCustomer')?.value;
  }

  // Account creation
  onCreateAccount(): void {
    if (!this.accountForm.valid || !this.selectedCustomer) {
      this.snackBar.open('Please complete all required fields', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      return;
    }

    this.isLoading = true;

    const accountRequest: AccountCreateRequest = {
      customerId: this.selectedCustomer.customerId,
      accountType: this.accountForm.get('accountType')?.value,
      initialBalance: this.accountForm.get('initialBalance')?.value,
      dailyTransactionLimit: this.accountForm.get('dailyTransactionLimit')
        ?.value,
      status: this.accountForm.get('status')?.value,
      // notifyCustomer: this.accountForm.get('notifyCustomer')?.value,
    };

    this.accountService.createAccount(accountRequest).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('created account', response);
        this.snackBar.open(
          `Account ${response.accountNumber} created successfully for ${this.selectedCustomer?.firstName} ${this.selectedCustomer?.lastName}`,
          'Close',
          {
            duration: 5000,
            panelClass: ['success-snackbar'],
          }
        );
      },
      error: (error: any) => {
        console.log('error:', error);
      },
    });

    // Simulate API call
    // setTimeout(() => {
    //   this.isLoading = false;

    //   // Generate a random account number for demo
    //   const accountNumber = 'ACC' + Math.random().toString().substr(2, 8);

    //   this.snackBar.open(
    //     `Account ${accountNumber} created successfully for ${this.selectedCustomer?.firstName} ${this.selectedCustomer?.lastName}`,
    //     'Close',
    //     {
    //       duration: 5000,
    //       panelClass: ['success-snackbar'],
    //     }
    //   );

    //   // Navigate back to customers or accounts list
    //   setTimeout(() => {
    //     this.router.navigate(['/customers']);
    //   }, 2000);
    // }, 2000);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    this.router.navigate(['/customers']);
  }

  onReset(): void {
    this.currentStep = 1;
    this.customerForm.reset({
      customerType: '',
      status: '',
      sortBy: 'lastName',
      sortOrder: 'asc',
    });
    this.accountForm.reset({
      status: 'ACTIVE',
      agreementAccepted: false,
      notifyCustomer: true,
    });
    this.selectedCustomer = null;
    this.filteredCustomers = this.customers.filter(
      (c) => c.status === 'ACTIVE'
    );
  }

  onResetFilters(): void {
    this.customerForm.patchValue({
      customerSearch: '',
      customerType: '',
      status: '',
      sortBy: 'lastName',
      sortOrder: 'asc',
    });
    this.onCustomerSearch();
  }

  getErrorMessage(formGroup: FormGroup, fieldName: string): string {
    const control = formGroup.get(fieldName);

    if (control?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }

    if (control?.hasError('min')) {
      const minValue = control.errors?.['min'].min;
      return `${this.getFieldLabel(fieldName)} must be at least ${minValue}`;
    }

    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      customerSearch: 'Customer',
      selectedCustomerId: 'Customer',
      accountType: 'Account Type',
      initialBalance: 'Initial Balance',
      dailyTransactionLimit: 'Daily Transaction Limit',
      status: 'Account Status',
      agreementAccepted: 'Agreement Acceptance',
    };

    return labels[fieldName] || fieldName;
  }

  // Chip styling methods
  getCustomerTypeChipClass(customerType: string): string {
    switch (customerType) {
      case 'VIP':
        return 'type-vip';
      case 'CORPORATE':
        return 'type-corporate';
      case 'BUSINESS':
        return 'type-business';
      case 'PERSONAL':
        return 'type-personal';
      default:
        return 'type-personal';
    }
  }

  getStatusChipClass(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'status-active';
      case 'INACTIVE':
        return 'status-inactive';
      case 'SUSPENDED':
        return 'status-suspended';
      case 'PENDING':
        return 'status-pending';
      case 'CLOSED':
        return 'status-closed';
      default:
        return 'status-inactive';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }).format(date);
  }

  formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  getCustomerFullName(customer: Customer): string {
    return `${customer.firstName} ${customer.lastName}`;
  }
}
