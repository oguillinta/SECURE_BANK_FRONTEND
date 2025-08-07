import { Routes } from '@angular/router';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized';
import { AccountListComponent } from './account-list/account-list';
import { DashboardComponent } from './dashboard/dashboard';
import { CustomerUpdateComponent } from './customer-update/customer-update';
import { AccountFreezeComponent } from './account-freeze/account-freeze';
//import { canActivateAuthRole } from './auth-guard';
import { CustomerListComponent } from './customer-list/customer-list';
import { AccountCreateComponent } from './account-create/account-create';
import { AccountSummaryComponent } from './account-summary/account-summary';
import { HomeComponent } from './home/home';
import { MsalGuard } from '@azure/msal-angular';
import { canActivateAuthRole } from './auth-guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomeComponent,
    pathMatch: 'full',
  },
  {
    path: 'app',
    component: MainLayoutComponent,
    canActivate: [MsalGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'accounts',
        component: AccountListComponent,
        canActivate: [canActivateAuthRole],
        //data: { role: 'ACCOUNT_SUMMARY_VIEWER' },
        data: { role: 'CUSTOMER_VIEWER' },
      },
      {
        path: 'account-summary',
        component: AccountSummaryComponent,
        canActivate: [canActivateAuthRole],
        data: { role: 'REPORT_VIEWER' },
      },
      {
        path: 'account-create',
        component: AccountCreateComponent,
        canActivate: [canActivateAuthRole],
        data: { role: 'ACCOUNT_CREATOR' },
      },
      {
        path: 'account-freeze/:accountId',
        component: AccountFreezeComponent,
        canActivate: [canActivateAuthRole],
        data: { role: 'ACCOUNT_FREEZER' },
      },
      {
        path: 'customer-update/:customerId',
        component: CustomerUpdateComponent,
        canActivate: [canActivateAuthRole],
        data: { role: 'PROFILE_UPDATER' },
      },
      {
        path: 'customer-list',
        component: CustomerListComponent,
        canActivate: [canActivateAuthRole],
        data: { role: 'PROFILE_UPDATER' },
      },
    ],
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
