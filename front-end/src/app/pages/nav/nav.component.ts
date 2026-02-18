import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { BagService } from '../../services/bag.service';
import { TokenService } from '../../services/token.service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { ClothesService } from '../../services/clothes.service';
import { FormsModule } from '@angular/forms';
import { Clothe } from '../../models/clothes.model';
import { User } from '../../models/users.model';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss',
})
export class NavComponent implements OnInit {
  isAuthenticated = false;
  currentUser: User | null = null;
  userRole: string | null = null;
  searchTerm: string = '';
  searchResults: Clothe[] = [];
  searchTimeout: ReturnType<typeof setTimeout> | null = null;

  private _bagService = inject(BagService);
  private _router = inject(Router);
  private _tokenService = inject(TokenService);
  private clothesService = inject(ClothesService);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this._tokenService.isAuthenticated$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        (isAuth) => {
          this.isAuthenticated = isAuth;
        }
      );

    this._tokenService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        (user) => {
          this.currentUser = user?.user ?? null;
          this.userRole = user?.user.rol || null;
        }
      );

    this._tokenService.checkAuthStatus();
  }

  navigate(route: string): void {
    this._router.navigate([route]);
  }

  logout(): void {
    this._tokenService.logout();
    this._bagService.clearBag();

    Swal.fire({
      icon: 'success',
      title: 'Logout successful',
      timer: 1000,
      showConfirmButton: false,
    });

    this._router.navigate(['/login']);
  }

  get userName(): string {
    return this.currentUser?.nameUs || 'User';
  }

  onSearchChange(): void {
    const term = this.searchTerm.trim();
    if (term.length < 3) {
      setTimeout(() => {
        this.searchResults = [];
      }, 100);
      return;
    }
    if (term.length > 2) {
      if (this.searchTimeout) clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.clothesService.searchProducts(term)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (results) => this.searchResults = results
          });
      }, 100);
    }
  }

  onSearchEnter(event: KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const term = (this.searchTerm || '').trim();
    if (!term) {
      this._router.navigate(['/']);
      return;
    }
    if (term.length < 3) {
      Swal.fire({
        title: 'Please enter at least 3 characters',
        icon: 'info',
        confirmButtonText: 'OK',
        allowOutsideClick: false
      });
      return;
    }
    if (!this.searchResults || this.searchResults.length === 0) {
      Swal.fire({
        title: 'No results found',
        text: 'Please try a different search term.',
        icon: 'info',
        confirmButtonText: 'OK',
        allowOutsideClick: false
      }).then(() => {
        this.searchTerm = '';
        this.searchResults = [];
      });
      return;
    }
    this._router.navigate(['/search', term]).then(() => {
      this.searchTerm = '';
      this.searchResults = [];
    });
  }

  goToProduct(idCl: number): void {
    this._router.navigate([`/products/${idCl}`]);
    this.searchTerm = '';
    this.searchResults = [];
  }

}