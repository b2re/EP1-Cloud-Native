import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  imports: [RouterLink],
  template: `
    <section class="card">
      <h2>Acceso denegado</h2>
      <p>Su rol no tiene permiso para ver esta página.</p>
      <a routerLink="/dashboard">Volver al dashboard</a>
    </section>
  `,
})
export class UnauthorizedComponent {}
