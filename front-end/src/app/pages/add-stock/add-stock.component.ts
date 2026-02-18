import { Component, Input, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Clothe } from '../../models/clothes.model';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ClothesService } from '../../services/clothes.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-stock',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-stock.component.html',
  styleUrl: './add-stock.component.scss',
})
export class AddStockComponent implements OnInit {
  @Input() cloth!: Clothe;
  editStockForm!: FormGroup;
  loading = true;
  private destroyRef = inject(DestroyRef);

  constructor(
    private fb: FormBuilder,
    private clothesService: ClothesService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.clothesService
          .getProductById(params['id'])
          .subscribe((data: Clothe) => {
            this.cloth = data;
            this.loading = false;
          });
      });
    this.editStockForm = this.fb.group({
      stock: ['', [Validators.required, Validators.min(1)]],
    });
  }

  onSubmit() {
    if (this.editStockForm.valid) {
      const updatedStock = this.cloth.stock + this.editStockForm.value.stock;
      this.clothesService
        .updateProductStock(this.cloth.idCl, updatedStock)
        .subscribe((response) => {
          Swal.fire({
            icon: 'success',
            title: 'Stock updated successfully',
            timer: 1000,
            showConfirmButton: false,
          });
        });
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 300);
    }
  }

  navigate() {
    this.router.navigate(['/']);
  }
}
