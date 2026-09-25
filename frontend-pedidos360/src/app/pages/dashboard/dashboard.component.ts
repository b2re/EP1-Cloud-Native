import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { CatalogService } from '../../core/catalog.service';
import { errorMessage } from '../../core/error-message';
import { Order, OrderStatus, Product, STATUS_LABELS } from '../../core/models';
import { OrderService } from '../../core/order.service';

const LOW_STOCK = 5;

// Resumen distinto por rol: Admin (visión global), Operador (cola operativa), Cliente (sus pedidos)
@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DatePipe],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly catalogService = inject(CatalogService);
  private readonly orderService = inject(OrderService);

  readonly orders = signal<Order[]>([]);
  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly statusLabels = STATUS_LABELS;
  readonly statuses = Object.keys(STATUS_LABELS) as OrderStatus[];

  readonly lowStock = computed(() => this.products().filter((p) => p.stock < LOW_STOCK));
  readonly pending = computed(() => this.count('CREADO'));
  readonly inProgress = computed(() => this.count('ACEPTADO') + this.count('EN_PREPARACION'));
  readonly dispatched = computed(() => this.count('DESPACHADO'));
  readonly delivered = computed(() => this.count('ENTREGADO'));
  readonly active = computed(
    () => this.orders().filter((o) => o.status !== 'ENTREGADO' && o.status !== 'CANCELADO').length,
  );
  readonly tokenExpiry = computed(() => {
    const exp = this.auth.claims()?.exp;
    return exp ? new Date(exp * 1000) : null;
  });

  async ngOnInit(): Promise<void> {
    try {
      await this.auth.loadClaims();
    } catch {
      this.error.set('No se pudo obtener el access token');
      this.loading.set(false);
      return;
    }

    forkJoin({ orders: this.orderService.getAll(), products: this.catalogService.getAll() }).subscribe({
      next: ({ orders, products }) => {
        this.orders.set(orders);
        this.products.set(products);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(errorMessage(err));
        this.loading.set(false);
      },
    });
  }

  count(status: OrderStatus): number {
    return this.orders().filter((o) => o.status === status).length;
  }
}
