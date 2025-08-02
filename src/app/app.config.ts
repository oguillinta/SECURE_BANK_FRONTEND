import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  createInterceptorCondition,
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  IncludeBearerTokenCondition,
  includeBearerTokenInterceptor,
  provideKeycloak,
} from 'keycloak-angular';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

// Define which URLs should include the Bearer token
const apiCondition = createInterceptorCondition<IncludeBearerTokenCondition>({
  urlPattern: /http:\/\/localhost:9091\/secure-banking-api\/api\//i,
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideKeycloak({
      config: {
        url: 'http://localhost:8080/',
        realm: 'securebank',
        clientId: 'secure-banking-angular',
      },
      initOptions: {
        onLoad: 'login-required',
        flow: 'standard',
        // onLoad: 'check-sso',
        // silentCheckSsoRedirectUri:
        //   window.location.origin + '/silent-check-sso.html',
      },
      providers: [
        // Configure interceptor to include Bearer token for API calls
        {
          provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
          useValue: [apiCondition],
        },
      ],
    }),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([includeBearerTokenInterceptor]) // Register functional interceptor
    ),
  ],
};
