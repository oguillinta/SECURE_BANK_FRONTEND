import { Injectable } from '@angular/core';
import { environment } from '../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { AccountSummary } from './interfaces/account-summary-response.interface';
import { Observable, switchMap } from 'rxjs';
import { CreateAccountRequest } from './interfaces/create-account-request.interface';
import { CreateAccountResponse } from './interfaces/create-account-response.interface';
import { FreezeAccountRequest } from './interfaces/freeze-account-request.interface';
import { FreezeAccountResponse } from './interfaces/freeze-account-response.interface';
import { GetCustomerByIdResponse } from './interfaces/get-customer-by-id-response.interface';
import { AccountSummaryReport } from './account-summary/account-summary';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private baseUrl: string = environment.baseUrl;
  constructor(private http: HttpClient) {}

  getAccountSummaryByCustomerId(
    customerId: string
  ): Observable<AccountSummary[]> {
    return this.http.get<AccountSummary[]>(
      `${this.baseUrl}/accounts/${customerId}`
    );
  }

  getAccountsSummary(): Observable<AccountSummaryReport[]> {
    return this.http.get<AccountSummaryReport[]>(
      `${this.baseUrl}/accounts/reports/summary`
    );
  }

  getAccountsSummaryByEmail(email: string): Observable<AccountSummary[]> {
    return this.http
      .get<GetCustomerByIdResponse>(
        `${this.baseUrl}/customers/GetByEmail/${email}`
      )
      .pipe(
        switchMap((response: GetCustomerByIdResponse) => {
          const customerId = response.id;
          console.log('receiving response from get by email', response);

          return this.http.get<AccountSummary[]>(
            `${this.baseUrl}/accounts/GetByCustomerId/${customerId}`
          );
        })
      );
  }

  getAccountById(accountId: string): Observable<AccountSummary> {
    return this.http.get<AccountSummary>(
      `${this.baseUrl}/accounts/beta/${accountId}`
    );
  }

  createAccount(
    account: CreateAccountRequest
  ): Observable<CreateAccountResponse> {
    return this.http.post<CreateAccountResponse>(
      `${this.baseUrl}/accounts`,
      account
    );
  }

  freezeAccount(
    account: FreezeAccountRequest,
    accountId: string
  ): Observable<FreezeAccountResponse> {
    return this.http.put<FreezeAccountResponse>(
      `${this.baseUrl}/accounts/${accountId}/freeze`,
      account
    );
  }
}
