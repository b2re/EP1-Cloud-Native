// Configuración de desarrollo (ng serve). Usa el mismo API Gateway: su CORS permite http://localhost:4200.
export const environment = {
  production: false,
  msal: {
    clientId: '00000000-0000-0000-0000-000000000000',
    tenantId: '00000000-0000-0000-0000-000000000000',
  },
  api: {
    baseUrl: 'https://21blw9fx3e.execute-api.us-east-1.amazonaws.com',
    scope: 'api://pedidos360-api/Pedidos.ReadWrite',
  },
};
