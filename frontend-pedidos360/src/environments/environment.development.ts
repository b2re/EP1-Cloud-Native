// Configuración de desarrollo (ng serve). Usa el mismo API Gateway: su CORS permite http://localhost:4200.
export const environment = {
  production: false,
  msal: {
    clientId: 'd0ce76dc-a17f-41b2-8f1e-4133e54eaccf',
    tenantId: '1e87bf6c-d4ac-4580-b8e9-3cce13a0c048',
  },
  api: {
    baseUrl: 'https://21blw9fx3e.execute-api.us-east-1.amazonaws.com',
    scope: 'api://pedidos360-api/Pedidos.ReadWrite',
  },
};
