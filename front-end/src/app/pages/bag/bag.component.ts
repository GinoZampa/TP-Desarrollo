import { ChangeDetectorRef, Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BagService } from '../../services/bag.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TokenService } from '../../services/token.service';
import { User } from '../../models/users.model';
import { Subscription } from 'rxjs';
import { PaymentService } from '../../services/payment.service';
import { Clothes } from '../../models/clothes.model';
import { ShippingCostsService } from '../../services/shipping-costs.service';

@Component({
  selector: 'app-bag',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bag.component.html',
  styleUrl: './bag.component.scss',
})
export class BagComponent implements OnInit {
  bagItems: Clothes[] = [];
  user: User | null = null;
  total: number = 0;
  currentShippingCost: number = 0;
  isAuthenticated: boolean = false;

  private bagService = inject(BagService);
  private router = inject(Router);
  private tokenService = inject(TokenService);
  private cdRef = inject(ChangeDetectorRef);
  private paymentService = inject(PaymentService);
  private destroyRef = inject(DestroyRef);
  private shippingCostsService = inject(ShippingCostsService);

  constructor() { }

  ngOnInit(): void {
    this.tokenService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(user => {
        this.user = user?.user || null;
        if (this.user && this.user.provinceId) {
          this.shippingCostsService.findAll().subscribe(costs => {
            const costObj = costs.find(c => c.provinceId === this.user?.provinceId);
            this.currentShippingCost = costObj ? costObj.cost : 0;
            this.cdRef.markForCheck();
          });
        }
        this.cdRef.markForCheck();
      });

    this.tokenService.isAuthenticated$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(isAuth => {
        this.isAuthenticated = isAuth;
      });

    this.tokenService.checkAuthStatus();

    this.bagItems = this.bagService.getBagItems();
  }

  removeProduct(productId: number) {
    this.bagService.removeFromBag(productId);
  }

  calculateSubtotal(): number {
    return this.bagItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }

  calculateTotalPrice(): number {
    const subtotal = this.calculateSubtotal();
    return subtotal + (this.currentShippingCost || 0);
  }


  hasItemsInBag() {
    return this.bagItems.length > 0;
  }

  aceptarCompra() {
    this.paymentService
      .createPayment(this.bagItems, this.user!)
      .subscribe((response: { init_point: string }) => {
        window.location.href = response.init_point;
      });
  }

  addMore(product: Clothes) {
    const item: Clothes = { ...product, quantity: 1 };
    this.bagService.addToBag(item);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
