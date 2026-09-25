import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

// Ruta pública: botón de inicio de sesión con Microsoft Entra ID (MSAL)
@Component({
  selector: 'app-login',
  template: `
    <section class="card login">
      <h1>Pedidos360</h1>
      <p class="muted">Gestión de pedidos y catálogo</p>
      <button (click)="auth.login()">Iniciar sesión con Microsoft</button>
      <p class="muted small">Se usará su cuenta de Microsoft Entra ID.</p>
    </section>
  `,
  styles: `
    .login { max-width: 380px; margin: 80px auto; text-align: center; }
    .login button { width: 100%; padding: 12px; font-size: 1rem; margin: 16px 0 8px; }
    .small { font-size: 0.85rem; }
  `,
})
export class LoginComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }
}
