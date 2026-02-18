import { CommonModule } from '@angular/common';
import { Component, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PurchaseService } from '../../services/purchase.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';
import { TokenService } from '../../services/token.service';
import { Purchase } from '../../models/purchases.model';
import { PurchaseClothe } from '../../models/purchase-clothe.model';

@Component({
  selector: 'app-purchases',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './purchases.component.html',
  styleUrl: './purchases.component.scss',
})
export class PurchasesComponent {
  purchases: (Purchase & { products: PurchaseClothe[] })[] = [];
  filteredPurchases: Purchase[] = [];
  filterForm: FormGroup;
  hasFiltered = false;
  isDropdownOpen = false;

  private destroyRef = inject(DestroyRef);

  constructor(private purchaseService: PurchaseService, private fb: FormBuilder, private tokenService: TokenService) {
    this.filterForm = this.fb.group({
      startDate: [''],
      endDate: [''],
    });
  }

  filterPurchases(): void {
    const { startDate, endDate } = this.filterForm.value;

    this.purchases = [];
    this.filteredPurchases = [];
    this.hasFiltered = true;

    if ((startDate && endDate === '') || (startDate === '' && endDate)) {
      //Si no se selecciona una fecha, se muestra un error
      Swal.fire('Error', 'You must select both dates', 'error');
      return;
    }

    if (endDate < startDate) {
      Swal.fire(
        'Error',
        'The start date must be earlier than the end date',
        'error'
      );
      return;
    }

    if (startDate && endDate) {
      //muestra las compras entre las fechas seleccionadas
      this.purchaseService
        .getPurchasesByDate(startDate, endDate)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(async (data) => {
          this.filteredPurchases = data;
          for (const purchase of this.filteredPurchases) {
            const purchaseProducts = await firstValueFrom(
              this.purchaseService.getClotheByPurchaseId(purchase.idPu)
            );

            const purchaseWithProducts = {
              ...purchase,
              products: Array.isArray(purchaseProducts)
                ? purchaseProducts
                : [purchaseProducts],
            };
            this.purchases.push(purchaseWithProducts);
          }
        });
    }

    if (startDate === '' && endDate === '') {
      //si no hay fechas, se muestra todo
      this.purchaseService.getPurchases()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(async (data) => {
          this.filteredPurchases = data;
          for (const purchase of this.filteredPurchases) {
            const purchaseProducts = await firstValueFrom(
              this.purchaseService.getClotheByPurchaseId(purchase.idPu)
            );

            const purchaseWithProducts = {
              ...purchase,
              products: Array.isArray(purchaseProducts)
                ? purchaseProducts
                : [purchaseProducts],
            };
            this.purchases.push(purchaseWithProducts);
          }
        });
    }
  }

  sortPurchases(criterio: string, direction: string): void {
    if (!this.purchases || this.purchases.length === 0) return;

    this.purchases.sort((a, b) => {
      let comparison = 0;

      if (criterio === 'date') {
        const dateA = new Date(a.datePu).getTime();
        const dateB = new Date(b.datePu).getTime();
        comparison = dateA - dateB;
      } else if (criterio === 'amount') {
        comparison = a.amount - b.amount;
      }

      return direction === 'desc' ? -comparison : comparison;
    });
  }
}
