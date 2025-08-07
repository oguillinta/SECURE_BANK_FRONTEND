import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment.development';
import { Observable } from 'rxjs';
import { MsalService } from '@azure/msal-angular';

type ProfileType = {
  givenName?: string;
  surname?: string;
  userPrincipalName?: string;
  id?: string;
};

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private msalService: MsalService) {}

  getCurrentUserEmail(): Observable<string> {
    return new Observable((observer) => {
      const account = this.msalService.instance.getActiveAccount();

      if (account?.username) {
        const formattedEmail = account.username
          .split('#EXT#')[0]
          .replace(/_/, '@');

        observer.next(formattedEmail);
        observer.complete();
      } else {
        observer.error('No user account available');
      }
    });
  }
}
