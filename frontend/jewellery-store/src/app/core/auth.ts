import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthResponse {
  token: string;
  fullName: string;
  email: string;
  role: string;
}

interface StoredAuth {
  token: string;
  fullName: string;
  email: string;
  role: string;
}

const STORAGE_KEY = 'aurum_auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _auth = signal<StoredAuth | null>(this.readStorage());
  readonly auth = this._auth.asReadonly();
  readonly isLoggedIn = computed(() => this._auth() !== null);
  readonly isAdmin = computed(() => this._auth()?.role === 'Admin');

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/api/auth/login`, { email, password })
      .pipe(tap(res => this.persist(res)));
  }

  register(fullName: string, email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/api/auth/register`, { fullName, email, password })
      .pipe(tap(res => this.persist(res)));
  }

  logout(): void {
    this._auth.set(null);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  getToken(): string | null {
    return this._auth()?.token ?? null;
  }

  private persist(res: AuthResponse): void {
    const data: StoredAuth = {
      token: res.token,
      fullName: res.fullName,
      email: res.email,
      role: res.role,
    };
    this._auth.set(data);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }

  private readStorage(): StoredAuth | null {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredAuth;
    } catch {
      return null;
    }
  }
}
