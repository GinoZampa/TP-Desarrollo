import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PurchaseService } from '../../services/purchase.service';
import { TokenService } from '../../services/token.service';
import { User } from '../../models/users.model';
import { Purchase } from '../../models/purchases.model';
import { PurchaseClothe } from '../../models/purchase-clothe.model';
import { firstValueFrom, Subscription } from 'rxjs';

@Component({
  selector: 'app-user-purchases',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-purchases.component.html',
  styleUrl: './user-purchases.component.scss',
})
export class UserPurchasesComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  constructor(
    private purchaseService: PurchaseService,
    private tokenService: TokenService,
    private cdRef: ChangeDetectorRef
  ) { }

  purchases: (Purchase & { products: PurchaseClothe[] })[] = [];
  isLoading = true;
  user: User | null = null;
  products: PurchaseClothe[] = [];
  isDropdownOpen = false;

  ngOnInit(): void {
    this.tokenService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(user => {
        this.user = user?.user ?? null;
        this.cdRef.markForCheck();
      });

    this.tokenService.checkAuthStatus();
    this.loadUserPurchases();
  }

  private async loadUserPurchases(): Promise<void> {
    try {
      if (!this.user || !this.user.idUs) {
        ///esto lo puse porque me daba unos errores en consola de que el usuario no estaba definido, pero porque tarda un pequeño tiempo en cargarlo
        return;
      }

      const purchaseData = await firstValueFrom(
        this.purchaseService.getUserPurchases(this.user.idUs)
      );

      this.products = [];

      for (const purchase of purchaseData) {
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
    } catch (error) {
      console.error('Error:', error);
    } finally {
      this.isLoading = false;
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
