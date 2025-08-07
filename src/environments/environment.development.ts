export const environment = {
  baseUrl: 'http://localhost:5036',
  production: false,
  msalConfig: {
    auth: {
      clientId: '',
      authority: 'https://login.microsoftonline.com/',
    },
  },
  apiConfig: {
    scopes: ['user.read'],
    uri: 'https://graph.microsoft.com/v1.0/me',
  },
};
