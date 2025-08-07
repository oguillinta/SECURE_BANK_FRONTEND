import { Injectable } from '@angular/core';
import { environment } from '../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer } from './customer-update/customer-update';
import { GetAllCustomersResponse } from './interfaces/get-all-customers-response.interface';
import { GetCustomerByIdResponse } from './interfaces/get-customer-by-id-response.interface';
import { UpdateCustomerRequest } from './interfaces/update-customer-request.interface';
import { UpdateCustomerResponse } from './interfaces/update-customer-response.interface';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private baseUrl: string = environment.baseUrl;
  constructor(private http: HttpClient) {}

  getCustomerById(customerId: string): Observable<GetCustomerByIdResponse> {
    return this.http.get<GetCustomerByIdResponse>(
      `${this.baseUrl}/customers/${customerId}`
    );
  }

  getCustomerByEmail(email: string): Observable<GetCustomerByIdResponse> {
    return this.http.get<GetCustomerByIdResponse>(
      `${this.baseUrl}/customers/getByEmail/${email}`
    );
  }

  updateCustomerProfile(customer: UpdateCustomerRequest) {
    if (!customer.customerId) throw Error('Customer id is required');
    return this.http.put<UpdateCustomerResponse>(
      `${this.baseUrl}/customers/${customer.customerId}/profile`,
      customer
    );
  }

  getAll() {
    return this.http.get<GetAllCustomersResponse[]>(
      `${this.baseUrl}/customers`
    );
  }
}
