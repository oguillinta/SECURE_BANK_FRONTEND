import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import {
  createInterceptorCondition,
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  includeBearerTokenInterceptor,
} from 'keycloak-angular';

// export const authInterceptor: HttpInterceptorFn = (req, next) => {
//   // // Use the new includeBearerTokenInterceptor with our condition
//   // const interceptor = inject(includeBearerTokenInterceptor);

//   // // Check if this request matches our API condition
//   // if (apiCondition(req)) {
//   //   return interceptor.intercept(req, next);
//   // }

//   // return next(req);
// };
