import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Clothe } from '../../models/clothes.model';
import { ClothesService } from '../../services/clothes.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';
import { TokenService } from '../../services/token.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  products: Clothe[] = [];
  filteredProducts: Clothe[] = [];
  selectedCategory: string = '';
  userRole: string | null = null;
  searchDesc: string = '';

  private clothesService = inject(ClothesService);
  private router = inject(Router);
  private tokenService = inject(TokenService);
  private cdRef = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  private subs: Subscription[] = []; // Leaving this for now if used elsewhere, but not pushing to it for this sub

  ngOnInit(): void {
    // 1) me suscribo al currentUser$ para detectar cambios
    this.tokenService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(user => {
        this.userRole = user?.user.rol || null;
        this.cdRef.markForCheck();
        this.loadProducts();
      });

    // 2) cargará de localStorage si ya había token
    this.tokenService.checkAuthStatus();

    this.route.paramMap.subscribe(params => {
      this.searchDesc = params.get('desc') || '';
      this.loadProducts();
    });
  }

  loadProducts(): void {
    if (this.searchDesc) {
      this.clothesService.searchProducts(this.searchDesc).subscribe(products => {
        this.products = products;
        this.filteredProducts = products;
      });
    } else {
      this.clothesService.getProducts().subscribe((response) => {
        this.products = response.data;
        this.filteredProducts = response.data;
      });
    }
  }

  navegate(route: string, id: number): void {
    this.router.navigate([route, id]);
  }

  filterByCategory(category: string) {
    //Inicialmente se muestran todos los prod, al elegir un tipo de prenda se filtran los productos desde el back
    if (this.selectedCategory === category) {
      this.selectedCategory = '';
      this.filteredProducts = this.products;
    } else {
      this.selectedCategory = category;
      this.clothesService
        .getProductsByType(category)
        .subscribe((data: Clothe[]) => {
          this.filteredProducts = data;
        });
    }
  }

  isCategorySelected(category: string): boolean {
    return this.selectedCategory === category;
  }

  confirmAction(id: number): void {
    Swal.fire({
      title: '¿Are you sure?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete product',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.clothesService.deleteProduct(id).subscribe(() => {
          this.loadProducts();
        });
        Swal.fire('¡Done!', 'Product has been deleted.', 'success');
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'Product was not deleted', 'error');
      }
    });
  }
}
