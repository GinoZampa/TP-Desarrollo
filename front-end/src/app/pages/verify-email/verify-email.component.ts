import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-verify-email',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './verify-email.component.html',
    styleUrl: './verify-email.component.scss',
})
export class VerifyEmailComponent implements OnInit {
    email = '';
    code = '';
    loading = false;
    resendCooldown = 0;

    private destroyRef = inject(DestroyRef);

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
    ) { }

    ngOnInit(): void {
        this.route.queryParams
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(params => {
                this.email = params['email'] || '';
                if (!this.email) {
                    this.router.navigate(['/register']);
                }
            });
    }

    verify(): void {
        if (this.code.length !== 6) return;
        this.loading = true;

        this.authService.verifyEmail(this.email, this.code)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Account verified!',
                        text: 'You can now login',
                        timer: 2500,
                        showConfirmButton: false,
                    });
                    this.router.navigate(['/login']);
                },
                error: (err) => {
                    this.loading = false;
                    Swal.fire({
                        icon: 'error',
                        title: 'Verification failed',
                        text: err.error?.message || 'Invalid or expired code',
                    });
                },
            });
    }

    resend(): void {
        if (this.resendCooldown > 0) return;

        this.authService.resendCode(this.email)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Code resent',
                        text: 'Check your inbox',
                        timer: 2000,
                        showConfirmButton: false,
                    });
                    this.startCooldown();
                },
                error: (err) => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: err.error?.message || 'Could not resend code',
                    });
                },
            });
    }

    private startCooldown(): void {
        this.resendCooldown = 60;
        const interval = setInterval(() => {
            this.resendCooldown--;
            if (this.resendCooldown <= 0) {
                clearInterval(interval);
            }
        }, 1000);
    }

    onCodeInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.code = input.value.replace(/\D/g, '').slice(0, 6);
        input.value = this.code;
    }
}
