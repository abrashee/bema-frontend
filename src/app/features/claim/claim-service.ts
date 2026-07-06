import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { io, Socket } from 'socket.io-client';
import { ApiResponse, Claim, ClaimCreateRequest } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class ClaimService {
  private http = inject(HttpClient);

  private apiUrl = `${environment.apiGatewayUrl}/claims`;

  private socket: Socket;
  private claimUpdates$ = new Subject<Claim>();

  constructor() {
    this.socket = io(environment.websocketUrl, {
      autoConnect: false,
      reconnectionAttempts: 3,
      auth: {
        token: localStorage.getItem('bema_auth_token') ?? '',
      },
    });

    this.socket.on('claim-updated', (data: Claim) => {
      this.claimUpdates$.next(data);
    });

    if (localStorage.getItem('bema_auth_token')) {
      this.socket.connect();
    }
  }

  getAllClaims(): Observable<ApiResponse<Claim[]>> {
    return this.http.get<ApiResponse<Claim[]>>(this.apiUrl);
  }

  getUserClaims(userId: string): Observable<ApiResponse<Claim[]>> {
    return this.http.get<ApiResponse<Claim[]>>(`${this.apiUrl}?userId=${userId}`);
  }

  getClaim(id: string): Observable<ApiResponse<Claim>> {
    return this.http.get<ApiResponse<Claim>>(`${this.apiUrl}/${id}`);
  }

  createClaim(payload: ClaimCreateRequest): Observable<ApiResponse<Claim>> {
    return this.http.post<ApiResponse<Claim>>(
      this.apiUrl,
      payload,
    );
  }

  updateClaim(id: string, payload: Partial<Claim>): Observable<ApiResponse<Claim>> {
    return this.http.put<ApiResponse<Claim>>(`${this.apiUrl}/${id}`, payload);
  }

  deleteClaim(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  joinClaimRoom(claimId: string): void {
    this.socket.emit('join-claim-room', claimId);
  }

  onClaimUpdates(): Observable<Claim> {
    return this.claimUpdates$.asObservable();
  }
}
