import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { GeoRefService, GeoRefProvince, GeoRefMunicipality } from '../../services/georef.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
})
export class SignUpComponent implements OnInit {
  loginForm!: FormGroup;
  provinces: GeoRefProvince[] = [];
  municipalities: GeoRefMunicipality[] = [];

  private destroyRef = inject(DestroyRef);
  private geoRefService = inject(GeoRefService);

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    @Inject(Router) private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      nameUs: ['', [Validators.required]],
      lastNameUs: ['', [Validators.required]],
      emailUs: ['', [Validators.required, Validators.email]],
      passwordUs: ['', [Validators.required, Validators.minLength(6)]],
      phoneUs: ['', [Validators.required, Validators.minLength(9)]],
      addressUs: ['', [Validators.required]],
      province: ['', Validators.required],
      municipality: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.loadProvinces();

    // Listen to province changes
    this.loginForm.get('province')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(provinceId => {
        this.municipalities = [];
        this.loginForm.get('municipality')?.setValue('');
        if (provinceId) {
          this.loadMunicipalities(provinceId);
        }
      });
  }

  loadProvinces() {
    this.geoRefService.getProvinces()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.provinces = data,
        error: (err) => console.error('Error loading provinces', err)
      });
  }

  loadMunicipalities(provinceId: string) {
    this.geoRefService.getMunicipalities(provinceId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.municipalities = data,
        error: (err) => console.error('Error loading municipalities', err)
      });
  }

  onSubmit() {
    const {
      nameUs,
      lastNameUs,
      emailUs,
      passwordUs,
      phoneUs,
      addressUs,
      province,
      municipality
    } = this.loginForm.value;

    const selectedProvince = this.provinces.find(p => p.id === province);
    const selectedMunicipality = this.municipalities.find(m => m.id === municipality);

    if (this.loginForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please fill out all fields correctly.',
      });
      return;
    }
    this.authService
      .register(
        nameUs,
        lastNameUs,
        emailUs,
        passwordUs,
        phoneUs,
        addressUs,
        province, // provinceId
        selectedProvince?.nombre || '', // provinceName
        selectedMunicipality?.nombre || '' // municipalityName
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Verification code sent',
            text: 'Check your email inbox',
            timer: 2500,
            showConfirmButton: false,
          });
          this.router.navigate(['/verify-email'], {
            queryParams: { email: emailUs }
          });
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Registration failed',
            text: err.error?.message || 'Please try again',
          });
        }
      });
  }

  navigate(url: string) {
    this.router.navigate([url]);
  }

  hasError(field: string, typeError: string) {
    return (
      this.loginForm.get(field)?.hasError(typeError) &&
      this.loginForm.get(field)?.touched
    );
  }
}
