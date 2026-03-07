import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse } from '../models/models';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly API = 'http://localhost:5000/api/auth';
    private _user = new BehaviorSubject<AuthResponse | null>(this.getStored());

    user$ = this._user.asObservable();

    constructor(private http: HttpClient, private router: Router) { }

    register(data: { fullName: string; email: string; password: string }): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.API}/register`, data).pipe(
            tap(res => this.store(res))
        );
    }

    login(data: { email: string; password: string }): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.API}/login`, data).pipe(
            tap(res => this.store(res))
        );
    }

    logout(): void {
        localStorage.removeItem('auth');
        this._user.next(null);
        this.router.navigate(['/']);
    }

    get token(): string | null {
        return this.getStored()?.token ?? null;
    }

    get isLoggedIn(): boolean {
        return !!this.token;
    }

    get currentUser(): AuthResponse | null {
        return this._user.value;
    }

    private store(res: AuthResponse): void {
        localStorage.setItem('auth', JSON.stringify(res));
        this._user.next(res);
    }

    private getStored(): AuthResponse | null {
        const stored = localStorage.getItem('auth');
        return stored ? JSON.parse(stored) : null;
    }
}
