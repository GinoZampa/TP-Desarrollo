import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GeoRefService } from '../../services/georef.service';
import { UserService } from '../../services/user.service';
import { TokenService } from '../../services/token.service';
import { User } from '../../models/users.model';
import { GeoRefProvince, GeoRefMunicipality } from '../../services/georef.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  user: User | null = null;
  provinces: GeoRefProvince[] = [];
  municipalities: GeoRefMunicipality[] = [];

  passwordForm: FormGroup;
  profileForm: FormGroup;
  deleteForm: FormGroup;

  showChangePassword = false;
  showUpdateProfile = false;
  showDeleteAccount = false;

  private destroyRef = inject(DestroyRef);

  constructor(
    private fb: FormBuilder,
    private geoRefService: GeoRefService,
    private userService: UserService,
    private tokenService: TokenService,
    private router: Router
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.profileForm = this.fb.group({
      nameUs: ['', Validators.required],
      lastNameUs: ['', Validators.required],
      phoneUs: ['', Validators.required],
      addressUs: ['', Validators.required],
      province: ['', Validators.required],
      municipality: ['', Validators.required]
    });

    this.deleteForm = this.fb.group({
      password: ['', Validators.required],
      confirmText: ['', Validators.required]
    }, { validators: this.deleteConfirmValidator });
  }

  ngOnInit(): void {
    this.loadProvinces();
    this.loadUserData();

    // Cascading dropdown logic
    this.profileForm.get('province')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(provinceId => {
        if (provinceId) {
          this.loadMunicipalities(provinceId);
        } else {
          this.municipalities = [];
          this.profileForm.get('municipality')?.setValue('');
        }
      });
  }

  private loadUserData(): void {
    this.tokenService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(userData => {
        if (userData?.user) {
          this.user = userData.user;
          this.populateProfileForm();
        }
      });

    this.tokenService.checkAuthStatus();
  }

  private populateProfileForm(): void {
    if (this.user) {
      this.profileForm.patchValue({
        nameUs: this.user.nameUs,
        lastNameUs: this.user.lastNameUs,
        phoneUs: this.user.phoneUs,
        addressUs: this.user.addressUs,
        province: this.user.provinceId,
      });

      // Load municipalities then set value
      if (this.user.provinceId) {
        this.loadMunicipalities(this.user.provinceId);
        // Timeout to ensure list is loaded (or use switchMap but this is simpler for now)
        setTimeout(() => {
          // Find muni by name to get ID if needed, or if we stored ID. 
          // Wait, user has municipalityName. We need to map it to ID if the select expects ID.
          // GeoRefService returns munis with ID.
          // If we only saved name, we might have an issue binding the select if it uses ID.
          // Let's assume we need to match by Name if ID not available? 
          // Actually backend user saves Names. But we might want to save IDs or Names.
          // Helper: find ID by name? 
          // Ideally User should have municipalityId too. But implementation plan said name.
          // Let's try to match by name in the list.
          const muni = this.municipalities.find(m => m.nombre === this.user?.municipalityName);
          if (muni) {
            this.profileForm.patchValue({ municipality: muni.id });
          }
        }, 500);
      }
    }
  }

  private loadProvinces(): void {
    this.geoRefService.getProvinces()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.provinces = data,
        error: (err) => console.error(err)
      });
  }

  private loadMunicipalities(provinceId: string): void {
    this.geoRefService.getMunicipalities(provinceId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.municipalities = data,
        error: (err) => console.error(err)
      });
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { 'passwordMismatch': true };
    }
    return null;
  }

  private deleteConfirmValidator(control: AbstractControl): ValidationErrors | null {
    const confirmText = control.get('confirmText');

    if (confirmText && confirmText.value !== 'DELETE') {
      return { 'confirmTextMismatch': true };
    }
    return null;
  }

  changePassword(): void {
    if (this.passwordForm.valid && this.user) {
      const passwordData = {
        idUs: this.user.idUs,
        currentPassword: this.passwordForm.value.currentPassword,
        newPassword: this.passwordForm.value.newPassword
      };

      this.userService.changePassword(passwordData)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response) => {
            Swal.fire({
              icon: 'success',
              title: 'Password changed successfully!',
              confirmButtonText: 'OK'
            });
            this.passwordForm.reset();
            this.showChangePassword = false;
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error changing password',
              confirmButtonText: 'OK'
            });
          }
        });
    }
  }

  updateProfile(): void {
    if (this.profileForm.valid && this.user) {
      const formValue = this.profileForm.value;

      const selectedProvince = this.provinces.find(p => p.id === formValue.province);
      const selectedMunicipality = this.municipalities.find(m => m.id === formValue.municipality);

      const profileData = {
        idUs: this.user.idUs,
        nameUs: formValue.nameUs,
        lastNameUs: formValue.lastNameUs,
        phoneUs: formValue.phoneUs,
        addressUs: formValue.addressUs,
        provinceId: formValue.province,
        provinceName: selectedProvince!.nombre,
        municipalityName: selectedMunicipality!.nombre,
      };

      this.userService.updateProfile(profileData)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response) => {
            Swal.fire({
              icon: 'success',
              title: 'Profile updated successfully!',
              confirmButtonText: 'OK'
            });
            this.showUpdateProfile = false;
            if (response.token) {
              this.tokenService.updateToken(response.token);
              this.user = response.user ?? null;
              this.populateProfileForm();
            }
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error updating profile',
              text: error.error?.message || 'Unknown error',
              confirmButtonText: 'OK'
            });
          }
        });
    }
  }

  deleteAccount(): void {
    if (this.deleteForm.valid && this.user) {
      Swal.fire({
        title: '¿Are you sure?',
        text: 'This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Delete account',
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          const idUs = this.user!.idUs;
          const password = this.deleteForm.value.password;

          this.userService.deleteAccount(idUs, password)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (response) => {
                Swal.fire({
                  icon: 'success',
                  title: 'Account deleted successfully!',
                  confirmButtonText: 'OK'
                });
                this.tokenService.logout();
                this.router.navigate(['/login']);
              },
              error: (error) => {
                Swal.fire({
                  icon: 'error',
                  title: 'Error deleting account',
                  text: error.error?.message || 'Unknown error',
                  confirmButtonText: 'OK'
                });
              }
            });
        }
      });
    }
  }
}