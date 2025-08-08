export const environment = {
  baseUrl:
    'https://securebankapi-b5azhzhmd6cff7gm.eastus2-01.azurewebsites.net',
  production: true,
  msalConfig: {
    auth: {
      clientId: '5c8bbff7-c20e-4b31-b0f9-38fa62a21ec1',
      authority:
        'https://login.microsoftonline.com/e1efc8b7-caef-4ab6-96c9-eba4dfcc252a',
    },
  },
  apiConfig: {
    scopes: ['user.read'],
    uri: 'https://graph.microsoft.com/v1.0/me',
  },
};
