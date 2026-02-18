import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Clothe } from '../../models/clothes.model';
import { ClothesService } from '../../services/clothes.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';
import { TokenService } from '../../services/token.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  products: Clothe[] = [];
  filteredProducts: Clothe[] = [];
  selectedCategory: string = '';
  userRole: string | null = null;
  searchDesc: string = '';

  showFilters: boolean = false;
  filterType: string = '';
  filterSize: string = '';
  filterPriceMin: number | null = null;
  filterPriceMax: number | null = null;

  currentPage: number = 1;
  pageSize: number = 12;
  totalProducts: number = 0;
  totalPages: number = 1;

  private clothesService = inject(ClothesService);
  private router = inject(Router);
  private tokenService = inject(TokenService);
  private cdRef = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.tokenService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(user => {
        this.userRole = user?.user.rol || null;
        this.cdRef.markForCheck();
        this.loadProducts();
      });

    this.tokenService.checkAuthStatus();

    this.route.paramMap.subscribe(params => {
      this.searchDesc = params.get('desc') || '';
      this.currentPage = 1;
      this.loadProducts();
    });
  }

  loadProducts(): void {
    if (this.searchDesc) {
      this.clothesService.searchProducts(this.searchDesc).subscribe(products => {
        this.products = products;
        this.filteredProducts = products;
        this.totalProducts = products.length;
        this.totalPages = 1;
      });
    } else if (this.hasActiveFilters()) {
      this.clothesService.getProducts(1000, 0).subscribe((response) => {
        this.products = response.data;
        this.totalProducts = response.total;
        this.totalPages = 1;
        this.applyFilters();
      });
    } else {
      const offset = (this.currentPage - 1) * this.pageSize;
      this.clothesService.getProducts(this.pageSize, offset).subscribe((response) => {
        this.products = response.data;
        this.totalProducts = response.total;
        this.totalPages = Math.ceil(response.total / this.pageSize);
        this.filteredProducts = response.data;
      });
    }
  }

  navegate(route: string, id: number): void {
    this.router.navigate([route, id]);
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  hasActiveFilters(): boolean {
    return !!(this.filterType || this.filterSize ||
      (this.filterPriceMin !== null && this.filterPriceMin > 0) ||
      (this.filterPriceMax !== null && this.filterPriceMax > 0));
  }

  applyFilters(): void {
    if (!this.hasActiveFilters()) {
      this.currentPage = 1;
      this.loadProducts();
      return;
    }

    if (this.totalPages > 1) {
      this.currentPage = 1;
      this.loadProducts();
      return;
    }

    let result = [...this.products];

    if (this.filterType) {
      result = result.filter(p => p.typeCl === this.filterType);
    }
    if (this.filterSize) {
      result = result.filter(p => p.size === this.filterSize);
    }
    if (this.filterPriceMin !== null && this.filterPriceMin > 0) {
      result = result.filter(p => p.price >= this.filterPriceMin!);
    }
    if (this.filterPriceMax !== null && this.filterPriceMax > 0) {
      result = result.filter(p => p.price <= this.filterPriceMax!);
    }

    this.filteredProducts = result;
  }

  clearFilters(): void {
    this.filterType = '';
    this.filterSize = '';
    this.filterPriceMin = null;
    this.filterPriceMax = null;
    this.currentPage = 1;
    this.loadProducts();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
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
        this.clothesService.deleteProduct(id).subscribe({
          next: () => this.loadProducts(),
          error: () => this.loadProducts(),
        });
        Swal.fire('¡Done!', 'Product has been deleted.', 'success');
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'Product was not deleted', 'error');
      }
    });
  }
}
