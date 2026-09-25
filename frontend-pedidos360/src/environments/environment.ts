// Configuración de producción (tenant Pedidos360 de Microsoft Entra ID).
export const environment = {
  production: true,
  msal: {
    // Application (client) ID del App Registration del frontend (SPA)
    clientId: 'd0ce76dc-a17f-41b2-8f1e-4133e54eaccf',
    // Directory (tenant) ID
    tenantId: '1e87bf6c-d4ac-4580-b8e9-3cce13a0c048',
  },
  api: {
    // URL pública de AWS API Gateway (único punto de entrada al backend)
    baseUrl: 'https://21blw9fx3e.execute-api.us-east-1.amazonaws.com',
    // Scope expuesto por el App Registration de la API
    scope: 'api://pedidos360-api/Pedidos.ReadWrite',
  },
};
