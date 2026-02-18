import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LocalityService } from '../../services/locality.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Locality } from '../../models/localities.model';

@Component({
  selector: 'app-localities',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './localities.component.html',
  styleUrl: './localities.component.scss'
})
export class LocalitiesComponent implements OnInit {
  localities: Locality[] = [];
  editingLocality: Locality | null = null;
  editForm: FormGroup;
  isAddingNew: boolean = false;

  private destroyRef = inject(DestroyRef);

  constructor(
    private localityService: LocalityService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      nameLo: ['', [Validators.required, Validators.maxLength(70)]],
      postalCode: ['', [Validators.required, Validators.maxLength(8)]],
      cost: ['', [Validators.required, Validators.maxLength(5)]]
    });
  }

  ngOnInit(): void {
    this.loadLocalities();
  }

  loadLocalities(): void {
    this.localityService.getLocalities()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (localities) => {
          this.localities = localities;
        },
        error: (error) => {
          console.error('Error loading localities:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error loading localities'
          });
        }
      });
  }

  editLocality(locality: Locality): void {
    this.editingLocality = { ...locality };
    this.editForm.patchValue({
      nameLo: locality.nameLo,
      postalCode: locality.postalCode,
      cost: locality.cost
    });
  }

  cancelEdit(): void {
    this.editingLocality = null;
    this.editForm.reset();
  }

  updateLocality(): void {
    if (this.editForm.valid && this.editingLocality) {
      const updateData = {
        nameLo: this.editForm.value.nameLo,
        cost: Number(this.editForm.value.cost),
      };

      this.localityService.updateLocality(this.editingLocality.idLo, updateData)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response) => {
            Swal.fire({
              icon: 'success',
              title: 'Updated!',
              text: 'Locality updated successfully',
              timer: 2000,
              showConfirmButton: false
            });
            this.cancelEdit();
            this.loadLocalities();
          },
          error: (error) => {
            console.error('Error updating locality:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Error updating locality'
            });
          }
        });
    }
  }

  deleteLocality(locality: Locality): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete ${locality.nameLo}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: 'var(--pay-color)',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.localityService.deleteLocality(locality.idLo)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Locality has been deleted.',
                timer: 2000,
                showConfirmButton: false
              });
              this.loadLocalities();
            },
            error: (error) => {
              console.error('Error deleting locality:', error);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'This locality has associated users'
              });
            }
          });
      }
    });
  }

  activateLocality(locality: Locality): void {
    this.localityService.activateLocality(locality.idLo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Activated!',
            text: 'Locality has been activated.',
            timer: 2000,
            showConfirmButton: false
          });
          this.loadLocalities();
        },
        error: (error) => {
          console.error('Error activating locality:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error activating locality'
          });
        }
      });
  }

  addNewLocality(): void {
    this.isAddingNew = true;
    this.editingLocality = null;
    this.editForm.reset();
  }

  cancelAdd(): void {
    this.isAddingNew = false;
    this.editForm.reset();
  }

  createLocality(): void {
    if (this.editForm.valid) {
      this.localityService.newLocality(
        this.editForm.value.nameLo,
        this.editForm.value.postalCode,
        this.editForm.value.cost
      )
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response) => {
            Swal.fire({
              icon: 'success',
              title: 'Created!',
              text: 'Locality created successfully',
              timer: 2000,
              showConfirmButton: false
            });
            this.isAddingNew = false;
            this.editForm.reset();
            this.loadLocalities();
          },
          error: (error) => {
            console.error('Error creating locality:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Error creating locality'
            });
          }
        });
    }
  }

  hasError(field: string, typeError: string): boolean {
    return this.editForm.get(field)?.hasError(typeError) && this.editForm.get(field)?.touched || false;
  }
}