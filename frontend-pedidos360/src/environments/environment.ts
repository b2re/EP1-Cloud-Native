// Configuración de producción. Reemplazar los valores de Entra ID cuando existan los App Registrations.
export const environment = {
  production: true,
  msal: {
    // Application (client) ID del App Registration del frontend (SPA)
    clientId: '00000000-0000-0000-0000-000000000000',
    // Directory (tenant) ID
    tenantId: '00000000-0000-0000-0000-000000000000',
  },
  api: {
    // URL pública de AWS API Gateway (único punto de entrada al backend)
    baseUrl: 'https://21blw9fx3e.execute-api.us-east-1.amazonaws.com',
    // Scope expuesto por el App Registration de la API
    scope: 'api://pedidos360-api/Pedidos.ReadWrite',
  },
};
