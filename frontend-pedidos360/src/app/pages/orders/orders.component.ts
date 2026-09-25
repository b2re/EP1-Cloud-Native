import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { CatalogService } from '../../core/catalog.service';
import { errorMessage } from '../../core/error-message';
import { NEXT_STATUS, Order, OrderStatus, Product, STATUS_LABELS } from '../../core/models';
import { OrderService } from '../../core/order.service';

// Cliente: crea y sigue sus pedidos (puede cancelar si está CREADO).
// Operador/Admin: ven todos los pedidos y cambian estados. Admin: elimina.
@Component({
  selector: 'app-orders',
  imports: [FormsModule, DatePipe],
  templateUrl: './orders.component.html',
})
export class OrdersComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly orderService = inject(OrderService);
  private readonly catalogService = inject(CatalogService);

  readonly orders = signal<Order[]>([]);
  readonly products = signal<Product[]>([]);
  readonly message = signal<{ type: 'ok' | 'error'; text: string } | null>(null);
  readonly busy = signal(false);

  readonly statusLabels = STATUS_LABELS;
  readonly productNames = computed(() => new Map(this.products().map((p) => [p.id, p.name])));

  newProductId: number | null = null;
  newQuantity = 1;

  async ngOnInit(): Promise<void> {
    await this.auth.loadClaims().catch(() => null);
    this.catalogService.getAll().subscribe({
      next: (products) => this.products.set(products),
      error: (err) => this.showError(err),
    });
    this.loadOrders();
  }

  loadOrders(): void {
    this.orderService.getAll().subscribe({
      next: (orders) => this.orders.set([...orders].sort((a, b) => b.id - a.id)),
      error: (err) => this.showError(err),
    });
  }

  create(): void {
    if (!this.newProductId || this.newQuantity < 1) {
      this.message.set({ type: 'error', text: 'Seleccione un producto y una cantidad mayor a 0' });
      return;
    }

    this.run(this.orderService.create(this.newProductId, this.newQuantity), 'Pedido creado');
    this.newQuantity = 1;
  }

  // Acciones de estado disponibles según el rol
  actionsFor(order: Order): OrderStatus[] {
    if (this.auth.isStaff()) {
      return NEXT_STATUS[order.status];
    }
    return order.status === 'CREADO' ? ['CANCELADO'] : [];
  }

  changeStatus(order: Order, status: OrderStatus): void {
    this.run(this.orderService.changeStatus(order.id, status), `Pedido #${order.id}: ${STATUS_LABELS[status]}`);
  }

  remove(order: Order): void {
    if (confirm(`¿Eliminar el pedido #${order.id}?`)) {
      this.run(this.orderService.delete(order.id), `Pedido #${order.id} eliminado`);
    }
  }

  productName(id: number): string {
    return this.productNames().get(id) ?? `Producto #${id}`;
  }

  private run(action: Observable<unknown>, okText: string): void {
    this.busy.set(true);
    this.message.set(null);

    action.subscribe({
      next: () => {
        this.message.set({ type: 'ok', text: okText });
        this.busy.set(false);
        this.loadOrders();
        this.catalogService.getAll().subscribe((products) => this.products.set(products));
      },
      error: (err) => {
        this.showError(err);
        this.busy.set(false);
      },
    });
  }

  private showError(err: unknown): void {
    this.message.set({ type: 'error', text: errorMessage(err) });
  }
}
