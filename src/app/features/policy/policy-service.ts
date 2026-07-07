//src/app/features/policy/policy-service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, Policy, PolicyCreateRequest, PolicyUpdateRequest } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class PolicyService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiGatewayUrl}/policies`;

  getAllPolicies(): Observable<ApiResponse<Policy[]>> {
    return this.http.get<ApiResponse<Policy[]>>(this.apiUrl);
  }

  getPolicyById(id: number): Observable<ApiResponse<Policy>> {
    return this.http.get<ApiResponse<Policy>>(`${this.apiUrl}/${id}`);
  }

  createPolicy(policy: PolicyCreateRequest): Observable<ApiResponse<Policy>> {
    return this.http.post<ApiResponse<Policy>>(this.apiUrl, policy);
  }

  updatePolicy(id: number, policy: PolicyUpdateRequest): Observable<ApiResponse<Policy>> {
    return this.http.put<ApiResponse<Policy>>(`${this.apiUrl}/${id}`, policy);
  }

  deletePolicy(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
