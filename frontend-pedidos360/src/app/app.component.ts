import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { InteractionStatus } from '@azure/msal-browser';
import { filter } from 'rxjs';
import { AuthService } from './auth/auth.service';
import { ROLE_LABELS, Role } from './auth/roles';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  private readonly msal = inject(MsalService);
  private readonly broadcast = inject(MsalBroadcastService);
  private readonly destroyRef = inject(DestroyRef);
  readonly auth = inject(AuthService);

  ngOnInit(): void {
    // Procesa la respuesta de Entra ID al volver del login (flujo redirect)
    this.msal.handleRedirectObservable().subscribe({
      next: (result) => {
        if (result?.account) {
          this.msal.instance.setActiveAccount(result.account);
        }
        this.syncSession();
      },
      error: (error) => console.error('Error al procesar el login', error),
    });

    // Cuando MSAL termina cualquier interacción, se actualiza la sesión
    this.broadcast.inProgress$
      .pipe(
        filter((status) => status === InteractionStatus.None),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.syncSession());
  }

  roleLabel(role: string): string {
    return ROLE_LABELS[role as Role] ?? role;
  }

  private syncSession(): void {
    if (this.auth.isLoggedIn()) {
      this.auth.loadClaims().catch((error) => console.error('No se pudo obtener el access token', error));
    }
  }
}
