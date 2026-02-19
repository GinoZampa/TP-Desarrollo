import { ChangeDetectorRef, Component, NgZone, OnInit, inject, DestroyRef, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BagService } from '../../services/bag.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { PurchaseService } from '../../services/purchase.service';
import { switchMap, finalize } from 'rxjs';
import { Purchase } from '../../models/purchases.model';
import { PurchaseClothe } from '../../models/purchase-clothe.model';

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './success.component.html',
  styleUrl: './success.component.scss',
})
export class SuccessComponent implements OnInit {
  loading = true;
  paymentId: string = '';
  purchase!: Purchase;
  purchaseClothes: PurchaseClothe[] = [];
  error: string | null = null;

  private destroyRef = inject(DestroyRef);
  private platformId = inject(PLATFORM_ID);

  constructor(
    private bagService: BagService,
    private router: Router,
    private route: ActivatedRoute,
    private purchaseService: PurchaseService,
    private zone: NgZone,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Solo cargar datos en el navegador, no en SSR
    if (isPlatformBrowser(this.platformId)) {
      this.loadData();
      this.loading = false
    } else {
      this.loading = false;
    }
  }

  private loadData() {
    this.route.queryParams
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((params) => {
          this.paymentId = params['payment_id'];
          return this.purchaseService.getPurchaseByPaymentId(this.paymentId);
        }),
        switchMap((purchase) => {
          this.purchase = purchase;
          return this.purchaseService.getClotheByPurchaseId(this.purchase.idPu);
        }),
        finalize(() => {
          this.loading = false;
          this.cd.detectChanges();
        })
      )
      .subscribe({
        next: (purchaseClothes) => {
          this.zone.run(() => {
            this.purchaseClothes = Array.isArray(purchaseClothes)
              ? purchaseClothes
              : [purchaseClothes];

            this.bagService.clearBag();

            Swal.fire({
              icon: 'success',
              title: 'Purchase successful',
              timer: 2000,
              showConfirmButton: false,
            });
          });
        },
        error: (err) => {
          console.error('Error loading success data', err);
        }
      });
  }

  navigate() {
    this.router.navigate(['']);
  }
}
