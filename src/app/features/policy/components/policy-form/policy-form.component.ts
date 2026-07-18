import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PolicyService } from '../../policy-service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { ChangeDetectorRef } from '@angular/core';
import { Policy } from '../../../../shared/models';

@Component({
  selector: 'app-policy-form',
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './policy-form.component.html',
  styleUrl: './policy-form.component.scss',
})
export class PolicyFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private policyService = inject(PolicyService);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  editId = signal<number | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);

  isEditMode = computed(() => this.editId() !== null);

  form: FormGroup = this.fb.group({
    type: ['CAR', Validators.required],
    premium: [null, [Validators.required, Validators.min(0.01)]],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
  });

  policyTypes = [
    'CAR',
    'HEALTH',
    'LIFE',
    'HOME',
    'TRAVEL',
    'PET',
    'GADGET',
    'BUSINESS',
    'RENTAL',
    'CYBER',
  ];

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = parseInt(idParam, 10);
      this.editId.set(id);
      this.loadPolicy(id);
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    });
  }

  private loadPolicy(id: number): void {
    this.isLoading.set(true);
    this.policyService.getPolicyById(id).subscribe({
      next: (res) => {
        if (res.data) {
          const p = res.data;
          this.form.patchValue({
            type: p.type,
            premium: p.premium,
            startDate: p.startDate?.slice(0, 10),
            endDate: p.endDate?.slice(0, 10),
          });
        } else {
          this.notification.error('Failed to load policy');
          this.router.navigate(['/dashboard/policies']);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.notification.error('Failed to load policy');
        this.isLoading.set(false);
        this.router.navigate(['/dashboard/policies']);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const raw = this.form.getRawValue();
    const payload = {
      type: raw.type as Policy['type'],
      premium: Number(raw.premium),
      startDate: raw.startDate,
      endDate: raw.endDate,
    };

    const request$ = this.isEditMode()
      ? this.policyService.updatePolicy(this.editId()!, payload)
      : this.policyService.createPolicy(payload);

    request$.subscribe({
      next: (res) => {
        if (res.data) {
          this.notification.success(
            this.isEditMode() ? 'Policy updated successfully' : 'Policy created successfully'
          );
          this.router.navigate(['/dashboard/policies']);
        } else {
          this.notification.error(res.message || 'Failed to save policy');
        }
        this.isSaving.set(false);
      },
      error: (err) => {
        this.notification.error(err?.error?.message || 'Failed to save policy');
        this.isSaving.set(false);
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/dashboard/policies']);
  }
}
