import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ShippingCostsService } from '../../services/shipping-costs.service';
import { GeoRefService } from '../../services/georef.service';
import Swal from 'sweetalert2';
import { ShippingCost } from '../../models/shipping-cost.model';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-shipping-costs',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './shipping-costs.component.html',
    styleUrl: './shipping-costs.component.scss'
})
export class ShippingCostsComponent implements OnInit {
    shippingCosts: ShippingCost[] = [];
    editingCost: ShippingCost | null = null;
    editForm: FormGroup;
    isSyncing: boolean = false;

    private destroyRef = inject(DestroyRef);
    private shippingCostsService = inject(ShippingCostsService);
    private geoRefService = inject(GeoRefService);
    private fb = inject(FormBuilder);

    constructor() {
        this.editForm = this.fb.group({
            cost: ['', [Validators.required, Validators.min(0)]]
        });
    }

    ngOnInit(): void {
        this.loadCosts();
    }

    loadCosts(): void {
        this.shippingCostsService.findAll()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (data) => this.shippingCosts = data,
                error: (err) => console.error('Error loading shipping costs', err)
            });
    }

    syncProvinces(): void {
        this.isSyncing = true;
        forkJoin({
            geoRef: this.geoRefService.getProvinces(),
            existing: this.shippingCostsService.findAll()
        })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: ({ geoRef, existing }) => {
                    const existingIds = new Set(existing.map(c => c.provinceId));
                    const missingProvinces = geoRef.filter(p => !existingIds.has(p.id));

                    if (missingProvinces.length === 0) {
                        this.isSyncing = false;
                        Swal.fire('Info', 'All provinces are already synced', 'info');
                        return;
                    }

                    const createObservables = missingProvinces.map(p =>
                        this.shippingCostsService.create({
                            provinceId: p.id,
                            provinceName: p.nombre,
                            cost: 0
                        })
                    );

                    forkJoin(createObservables).subscribe({
                        next: () => {
                            this.isSyncing = false;
                            Swal.fire('Success', `Synced ${missingProvinces.length} provinces`, 'success');
                            this.loadCosts();
                        },
                        error: (err) => {
                            this.isSyncing = false;
                            console.error('Error syncing provinces', err);
                            Swal.fire('Error', 'Failed to sync provinces', 'error');
                        }
                    });
                },
                error: (err) => {
                    this.isSyncing = false;
                    console.error('Error fetching data', err);
                }
            });
    }

    edit(cost: ShippingCost): void {
        this.editingCost = cost;
        this.editForm.patchValue({ cost: cost.cost });
    }

    cancelEdit(): void {
        this.editingCost = null;
        this.editForm.reset();
    }

    saveCost(): void {
        if (this.editForm.valid && this.editingCost) {
            const newCost = this.editForm.value.cost;
            this.shippingCostsService.update(this.editingCost.id, newCost)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                    next: () => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Updated',
                            text: 'Shipping cost updated',
                            timer: 1500,
                            showConfirmButton: false
                        });
                        this.cancelEdit();
                        this.loadCosts();
                    },
                    error: (err) => {
                        console.error('Error updating cost', err);
                        Swal.fire('Error', 'Failed to update cost', 'error');
                    }
                });
        }
    }
}
