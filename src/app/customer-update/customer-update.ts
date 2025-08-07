import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CustomerService } from '../customer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GetCustomerByIdResponse } from '../interfaces/get-customer-by-id-response.interface';
import { UpdateCustomerRequest } from '../interfaces/update-customer-request.interface';
import { UpdateCustomerResponse } from '../interfaces/update-customer-response.interface';

export interface Customer {
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  customerType: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

@Component({
  selector: 'customer-update',
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
  ],
  templateUrl: './customer-update.html',
  styleUrl: './customer-update.css',
})
export class CustomerUpdateComponent implements OnInit {
  customerForm: FormGroup;
  isLoading = false;
  isLoadingCustomer = true;
  isEditing = false;

  private customerService = inject(CustomerService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private formBuilder = inject(FormBuilder);

  customerId: string | null = null;
  currentCustomer: GetCustomerByIdResponse | null = null;

  customerTypes = [
    { value: 'INDIVIDUAL', label: 'Individual Customer' },
    { value: 'BUSINESS', label: 'Business Customer' },
    { value: 'CORPORATE', label: 'Corporate Customer' },
  ];

  statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'SUSPENDED', label: 'Suspended' },
  ];

  constructor() {
    this.customerForm = this.createForm();
  }

  ngOnInit() {
    // Get customer ID from route parameters
    this.customerId = this.route.snapshot.paramMap.get('customerId');

    if (this.customerId) {
      this.loadCustomerData(this.customerId);
    } else {
      // Fallback: check query parameters
      this.route.queryParams.subscribe((params) => {
        const customerIdParam = params['id'];
        if (customerIdParam) {
          this.customerId = customerIdParam;
          this.loadCustomerData(this.customerId!);
        } else {
          this.handleNoCustomerId();
        }
      });
    }
  }

  private handleNoCustomerId(): void {
    this.snackBar.open(
      'No customer ID provided. Redirecting to customer list.',
      'Close',
      {
        duration: 3000,
        panelClass: ['error-snackbar'],
      }
    );

    // Redirect to customer list after 2 seconds
    setTimeout(() => {
      this.router.navigate(['/app/customers']);
    }, 2000);
  }

  private loadCustomerData(customerId: string): void {
    this.isLoadingCustomer = true;

    this.customerService.getCustomerById(customerId).subscribe({
      next: (customer: GetCustomerByIdResponse) => {
        console.log('Customer loaded:', customer);
        this.currentCustomer = customer;
        this.populateForm();
        this.isLoadingCustomer = false;
      },
      error: (error: any) => {
        console.error('Error loading customer:', error);
        this.isLoadingCustomer = false;

        this.snackBar.open('Failed to load customer details', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });

        // Fallback to sample data for demo purposes
        this.loadSampleCustomerData();
      },
    });
  }

  private loadSampleCustomerData(): void {
    // Sample data as fallback
    this.currentCustomer = {
      id: 'TEST-003',
      firstName: 'Michael',
      lastName: 'Brown',
      email: 'michael.brown@email.com',
      customerType: 'INDIVIDUAL',
      status: 'ACTIVE',
      createdAt: '2025-07-27T03:29:35.946133900Z',
      updatedAt: '2025-07-27T03:29:35.946133900Z',
    };

    this.populateForm();
  }

  private populateForm(): void {
    if (this.currentCustomer) {
      this.customerForm.patchValue({
        customerId: this.currentCustomer.id,
        firstName: this.currentCustomer.firstName,
        lastName: this.currentCustomer.lastName,
        email: this.currentCustomer.email,
        customerType: this.currentCustomer.customerType,
        status: this.currentCustomer.status,
      });

      // Disable form initially
      this.customerForm.disable();
    }
  }

  createForm(): FormGroup {
    return this.formBuilder.group({
      customerId: [{ value: '', disabled: true }],
      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^\+?[\d\s\-\(\)]{10,}$/)]],
      customerType: ['', Validators.required],
      status: ['', Validators.required],
      dateOfBirth: [''],
      occupation: ['', Validators.maxLength(100)],
      nationalId: ['', Validators.maxLength(50)],
      address: ['', Validators.maxLength(200)],
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;

    if (this.isEditing) {
      this.customerForm.enable();
      this.customerForm.get('customerId')?.disable(); // Keep ID always disabled
    } else {
      this.customerForm.disable();
      this.populateForm(); // Reset to original data
    }
  }

  onSubmit() {
    if (!this.currentCustomer) {
      this.snackBar.open('No customer data available', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      return;
    }

    if (this.customerForm.valid) {
      this.isLoading = true;

      const updateRequest: UpdateCustomerRequest = {
        customerId: this.currentCustomer.id,
        firstName: this.customerForm.get('firstName')?.value,
        lastName: this.customerForm.get('lastName')?.value,
        email: this.customerForm.get('email')?.value,
        customerType: this.customerForm.get('customerType')?.value,
        status: this.customerForm.get('status')?.value,
      };

      this.customerService.updateCustomerProfile(updateRequest).subscribe({
        next: (updatedCustomer: UpdateCustomerResponse) => {
          console.log('Customer updated:', updatedCustomer);
          this.currentCustomer = updatedCustomer;
          this.isLoading = false;
          this.isEditing = false;
          this.customerForm.disable();
          this.populateForm();

          this.snackBar.open(
            'Customer profile updated successfully!',
            'Close',
            {
              duration: 3000,
              panelClass: ['success-snackbar'],
            }
          );
        },
        error: (error: any) => {
          console.error('Error updating customer:', error);
          this.isLoading = false;
          this.snackBar.open('Failed to update customer profile', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
        },
      });
    } else {
      this.markFormGroupTouched();
      this.snackBar.open('Please correct the errors in the form', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
    }
  }

  onCancel() {
    this.isEditing = false;
    this.customerForm.disable();
    this.populateForm();
  }

  onDeactivateCustomer() {
    if (!this.currentCustomer) return;

    const confirmDeactivation = confirm(
      'Are you sure you want to deactivate this customer? This action will suspend all their accounts.'
    );

    if (confirmDeactivation) {
      this.isLoading = true;

      // Simulate API call
      setTimeout(() => {
        this.currentCustomer!.status = 'INACTIVE';
        this.customerForm.patchValue({ status: 'INACTIVE' });
        this.isLoading = false;

        this.snackBar.open('Customer has been deactivated', 'Close', {
          duration: 3000,
          panelClass: ['warning-snackbar'],
        });
      }, 1000);
    }
  }

  onViewAccounts() {
    if (this.currentCustomer) {
      this.router.navigate([
        '/app/customers',
        this.currentCustomer.id,
        'accounts',
      ]);
    }
  }

  onViewTransactions() {
    if (this.currentCustomer) {
      this.router.navigate([
        '/app/customers',
        this.currentCustomer.id,
        'transactions',
      ]);
    }
  }

  onGenerateReport() {
    console.log('Generate customer report for:', this.currentCustomer?.id);
    // Implement report generation
  }

  private markFormGroupTouched() {
    Object.keys(this.customerForm.controls).forEach((key) => {
      const control = this.customerForm.get(key);
      control?.markAsTouched();
    });
  }

  private formatDate(date: Date): string {
    return new Date(date).toISOString().split('T')[0];
  }

  getErrorMessage(fieldName: string): string {
    const control = this.customerForm.get(fieldName);

    if (control?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }

    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
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

    if (control?.hasError('pattern')) {
      return `Please enter a valid ${fieldName.toLowerCase()}`;
    }

    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      customerType: 'Customer Type',
      status: 'Status',
      dateOfBirth: 'Date of Birth',
      occupation: 'Occupation',
      nationalId: 'National ID',
      address: 'Address',
    };

    return labels[fieldName] || fieldName;
  }

  getStatusChipClass(): string {
    if (!this.currentCustomer) return 'status-default';

    switch (this.currentCustomer.status) {
      case 'ACTIVE':
        return 'status-active';
      case 'INACTIVE':
        return 'status-inactive';
      case 'SUSPENDED':
        return 'status-suspended';
      default:
        return 'status-default';
    }
  }

  isCustomerLoaded(): boolean {
    return !this.isLoadingCustomer && this.currentCustomer !== null;
  }
}
