import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomerService } from '../customer.service';
import { GetAllCustomersResponse } from '../interfaces/get-all-customers-response.interface';

export interface Customer {
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  customerType: 'INDIVIDUAL' | 'BUSINESS' | 'CORPORATE';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  totalBalance?: number;
  accountsCount?: number;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-customer-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule,
  ],
  templateUrl: './customer-list.html',
  styleUrl: './customer-list.css',
})
export class CustomerListComponent {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private customerService = inject(CustomerService);

  searchForm!: FormGroup;
  customers: GetAllCustomersResponse[] = [];
  filteredCustomers: GetAllCustomersResponse[] = [];

  // Summary statistics
  totalCustomers = 0;
  activeCustomers = 0;
  newThisMonth = 0;

  // Table configuration
  displayedColumns: string[] = [
    'customer',
    'contact',
    'type',
    'status',
    'lastActivity',
    'actions',
  ];

  ngOnInit(): void {
    this.initializeForm();
    this.loadCustomers();
  }

  private initializeForm(): void {
    this.searchForm = this.formBuilder.group({
      searchText: [''],
      customerType: [''],
      status: [''],
      sortBy: ['lastName'],
      sortOrder: ['asc'],
    });
  }

  private loadCustomers(): void {
    this.customerService.getAll().subscribe({
      next: (customers: GetAllCustomersResponse[]) => {
        console.log('Customers loaded:', customers);
        this.customers = customers;
        this.filteredCustomers = [...customers];
        this.calculateStatistics();
      },
      error: (error: any) => {
        console.error('Error loading customers:', error);
        this.snackBar.open('Failed to load customers', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  private loadSampleData(): void {
    // Sample data as fallback
    this.customers = [
      {
        customerId: 'TEST-003',
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@email.com',
        customerType: 'INDIVIDUAL',
        status: 'ACTIVE',
        createdAt: '2025-07-27T03:29:35.946133900Z',
        updatedAt: '2025-07-27T03:29:35.946133900Z',
      },
      {
        customerId: 'TEST-004',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@business.com',
        customerType: 'BUSINESS',
        status: 'ACTIVE',
        createdAt: '2025-06-15T10:30:00.000Z',
        updatedAt: '2025-07-26T14:22:30.000Z',
      },
      {
        customerId: 'TEST-005',
        firstName: 'David',
        lastName: 'Wilson',
        email: 'david.wilson@corporate.com',
        customerType: 'CORPORATE',
        status: 'ACTIVE',
        createdAt: '2025-05-20T09:15:00.000Z',
        updatedAt: '2025-07-25T16:45:15.000Z',
      },
      {
        customerId: 'TEST-006',
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@email.com',
        customerType: 'INDIVIDUAL',
        status: 'INACTIVE',
        createdAt: '2025-03-10T12:00:00.000Z',
        updatedAt: '2025-07-20T08:30:00.000Z',
      },
    ];

    this.filteredCustomers = [...this.customers];
    this.calculateStatistics();
  }

  private calculateStatistics(): void {
    this.totalCustomers = this.customers.length;
    this.activeCustomers = this.customers.filter(
      (c) => c.status === 'ACTIVE'
    ).length;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    this.newThisMonth = this.customers.filter((c) => {
      const createdDate = new Date(c.createdAt);
      return (
        createdDate.getMonth() === currentMonth &&
        createdDate.getFullYear() === currentYear
      );
    }).length;
  }

  onSearch(): void {
    const searchText =
      this.searchForm.get('searchText')?.value?.toLowerCase() || '';
    const customerType = this.searchForm.get('customerType')?.value || '';
    const status = this.searchForm.get('status')?.value || '';
    const sortBy = this.searchForm.get('sortBy')?.value || 'lastName';
    const sortOrder = this.searchForm.get('sortOrder')?.value || 'asc';

    let filtered = [...this.customers];

    // Apply text search
    if (searchText) {
      filtered = filtered.filter(
        (customer) =>
          customer.firstName.toLowerCase().includes(searchText) ||
          customer.lastName.toLowerCase().includes(searchText) ||
          customer.email.toLowerCase().includes(searchText) ||
          customer.customerId.toLowerCase().includes(searchText)
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
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
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

  onClearFilters(): void {
    this.searchForm.reset({
      customerType: '',
      status: '',
      sortBy: 'lastName',
      sortOrder: 'asc',
    });
    this.onSearch();
  }

  // Customer action methods
  onViewCustomer(customer: Customer): void {
    console.log('View customer:', customer.customerId);
    // Navigate to customer details
    // this.router.navigate(['/customers', customer.customerId]);
  }

  onEditCustomer(customer: Customer): void {
    console.log('Edit customer:', customer.customerId);
    this.router.navigate(['/app/customer-update', customer.customerId]);
  }

  onViewAccounts(customer: Customer): void {
    console.log('View accounts for customer:', customer.customerId);
  }

  onCreateAccount(customer: Customer): void {
    console.log('Create account for customer:', customer.customerId);
    this.router.navigate(['/app/account-create'], {
      queryParams: { customerId: customer.customerId },
    });
  }

  onViewTransactions(customer: Customer): void {
    console.log('View transactions for customer:', customer.customerId);
  }

  onSuspendCustomer(customer: Customer): void {
    console.log('Suspend customer:', customer.customerId);
    this.snackBar.open(
      `Customer ${customer.firstName} ${customer.lastName} has been suspended`,
      'Close',
      { duration: 3000, panelClass: ['warning-snackbar'] }
    );
  }

  onActivateCustomer(customer: Customer): void {
    console.log('Activate customer:', customer.customerId);
    this.snackBar.open(
      `Customer ${customer.firstName} ${customer.lastName} has been activated`,
      'Close',
      { duration: 3000, panelClass: ['success-snackbar'] }
    );
  }

  onCreateNewCustomer(): void {
    console.log('Create new customer');
  }

  onExportCustomers(): void {
    console.log('Export customers');
    this.snackBar.open('Exporting customer data...', 'Close', {
      duration: 3000,
      panelClass: ['info-snackbar'],
    });
  }

  // Utility methods
  getCustomerTypeChipClass(customerType: string): string {
    switch (customerType) {
      case 'INDIVIDUAL':
        return 'type-individual';
      case 'BUSINESS':
        return 'type-business';
      case 'CORPORATE':
        return 'type-corporate';
      default:
        return 'type-individual';
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
      default:
        return 'status-inactive';
    }
  }

  getBalanceClass(balance: number): string {
    return balance >= 0 ? 'positive' : 'negative';
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

  getCustomerFullName(customer: Customer): string {
    return `${customer.firstName} ${customer.lastName}`;
  }
}
