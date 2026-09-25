import { HttpErrorResponse } from '@angular/common/http';

// Mensaje legible a partir de las respuestas de error del BFF y los microservicios
export function errorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Error inesperado';
  }

  const body = error.error;
  const detail = body?.message ?? body?.detail;

  switch (error.status) {
    case 0:
      return 'No se pudo conectar con el servidor (API Gateway)';
    case 401:
      return 'Sesión inválida o expirada. Inicie sesión nuevamente.';
    case 403:
      return detail ?? 'Su rol no tiene permiso para esta operación';
    default:
      return detail ?? `Error ${error.status}`;
  }
}
