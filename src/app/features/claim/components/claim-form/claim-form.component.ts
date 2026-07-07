// src/app/features/claim/components/claim-form/claim-form.component.ts
import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ClaimService } from '../../claim-service';
import { PolicyService } from '../../../policy/policy-service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { AuthService } from '../../../auth/auth-service';
import { Policy } from '../../../../shared/models';

@Component({
  selector: 'app-claim-form',
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './claim-form.component.html',
  styleUrl: './claim-form.component.scss',
})
export class ClaimFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private claimService = inject(ClaimService);
  private policyService = inject(PolicyService);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  isSaving = signal(false);
  policies = signal<Policy[]>([]);
  policyIds = computed(() => this.policies().map((p) => p.id).join(', '));

  form: FormGroup = this.fb.group({
    userId: [{ value: '', disabled: true }],
    policyId: [''],
    amount: [null, [Validators.min(0.01)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
  });

  ngOnInit(): void {
    const user = this.authService.currentUser;
    if (user) {
      this.form.patchValue({ userId: `${user.id} — ${user.name}` });
    }

    this.policyService.getAllPolicies().subscribe({
      next: (res) => {
        if (res.data) this.policies.set(res.data);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const user = this.authService.currentUser;
    if (!user) {
      this.notification.error('You must be logged in to file a claim');
      return;
    }

    this.isSaving.set(true);
    const raw = this.form.getRawValue();

    const payload = {
    description: raw.description,
    ...(raw.amount ? { amount: Number(raw.amount) } : {}),
    ...(raw.policyId ? { policyId: String(raw.policyId) } : {}),
  };

    this.claimService.createClaim(payload).subscribe({
      next: (res) => {
        if (res.data) {
          this.notification.success('Claim filed successfully!');
          this.claimService.joinClaimRoom(res.data.id);
          this.router.navigate(['/dashboard/claim']);
        } else {
          this.notification.error(res.message || 'Failed to file claim');
        }
        this.isSaving.set(false);
      },
      error: (err) => {
        this.notification.error(err?.error?.message || 'Failed to file claim');
        this.isSaving.set(false);
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/dashboard/claim']);
  }
}
