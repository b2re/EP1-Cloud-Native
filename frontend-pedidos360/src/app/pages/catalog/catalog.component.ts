import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { CatalogService } from '../../core/catalog.service';
import { errorMessage } from '../../core/error-message';
import { Product } from '../../core/models';

const LOW_STOCK = 5;

// Admin: CRUD de productos, precios y stock. Operador: control de stock.
@Component({
  selector: 'app-catalog',
  imports: [FormsModule],
  templateUrl: './catalog.component.html',
})
export class CatalogComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly catalogService = inject(CatalogService);

  readonly products = signal<Product[]>([]);
  readonly message = signal<{ type: 'ok' | 'error'; text: string } | null>(null);
  readonly busy = signal(false);
  readonly lowStock = LOW_STOCK;

  form: Product = this.emptyForm();
  editingId: number | null = null;
  stockEdits: Record<number, number> = {};

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.catalogService.getAll().subscribe({
      next: (products) => {
        this.products.set(products);
        this.stockEdits = Object.fromEntries(products.map((p) => [p.id!, p.stock]));
      },
      error: (err) => this.message.set({ type: 'error', text: errorMessage(err) }),
    });
  }

  save(): void {
    const action = this.editingId
      ? this.catalogService.update(this.editingId, this.form)
      : this.catalogService.create(this.form);

    this.run(action, this.editingId ? 'Producto actualizado' : 'Producto creado', () => this.cancelEdit());
  }

  edit(product: Product): void {
    this.editingId = product.id!;
    this.form = { name: product.name, price: product.price, stock: product.stock };
  }

  cancelEdit(): void {
    this.editingId = null;
    this.form = this.emptyForm();
  }

  remove(product: Product): void {
    if (confirm(`¿Eliminar "${product.name}"?`)) {
      this.run(this.catalogService.delete(product.id!), `"${product.name}" eliminado`);
    }
  }

  updateStock(product: Product): void {
    const stock = this.stockEdits[product.id!];
    this.run(this.catalogService.updateStock(product.id!, stock), `Stock de "${product.name}" actualizado a ${stock}`);
  }

  private run(action: Observable<unknown>, okText: string, after?: () => void): void {
    this.busy.set(true);
    this.message.set(null);

    action.subscribe({
      next: () => {
        this.message.set({ type: 'ok', text: okText });
        this.busy.set(false);
        after?.();
        this.load();
      },
      error: (err) => {
        this.message.set({ type: 'error', text: errorMessage(err) });
        this.busy.set(false);
      },
    });
  }

  private emptyForm(): Product {
    return { name: '', price: 0, stock: 0 };
  }
}
