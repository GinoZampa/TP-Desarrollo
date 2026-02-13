import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PurchaseService } from '../../services/purchase.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pending-purchases',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending-purchases.component.html',
  styleUrl: './pending-purchases.component.scss'
})
export class PendingPurchasesComponent implements OnInit {
  pendingPurchases: any[] = [];
  sentPurchases: any[] = [];

  private destroyRef = inject(DestroyRef);

  constructor(private purchaseService: PurchaseService) { }

  ngOnInit(): void {
    this.loadPurchases();
  }

  loadPurchases(): void {
    this.purchaseService.getPurchases()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (purchases) => {
          this.pendingPurchases = purchases.filter((p: { shipment: { status: string; }; }) => p.shipment.status === 'Pending');
          this.sentPurchases = purchases.filter((p: { shipment: { status: string; }; }) => p.shipment.status === 'Sent');
        },
        error: (error) => {
          console.error('Error loading purchases:', error);
          Swal.fire('Error', 'Could not load purchases', 'error');
        }
      });
  }

  markAsSent(idSh: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to mark shipment #${idSh} as sent?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#dc3545',
      confirmButtonText: 'Yes, mark as sent',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.purchaseService.updateShipmentStatus(idSh, 'Sent')
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              Swal.fire({
                icon: 'success',
                title: 'Updated!',
                text: `Order ${idSh} as sent`
              });
              this.loadPurchases();
            },
            error: (error) => {
              console.error('Error updating status:', error);
              Swal.fire('Error', 'Could not update status', 'error');
            }
          });
      }
    });
  }

  markAsDelivered(idSh: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to mark shipment #${idSh} as delivered?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#dc3545',
      confirmButtonText: 'Yes, mark as delivered',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.purchaseService.updateShipmentStatus(idSh, 'Delivered')
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              Swal.fire({
                icon: 'success',
                title: 'Updated!',
                text: `Order ${idSh} as delivered`
              });
              this.loadPurchases();
            },
            error: (error) => {
              console.error('Error updating status:', error);
              Swal.fire('Error', 'Could not update status', 'error');
            }
          });
      }
    });
  }
}
