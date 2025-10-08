import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  user?: User;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl || 'http://localhost:3000/api';
  
  // Observable to track authentication state
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  
  // Observable to track if user is logged in
  private isAuthenticatedSubject: BehaviorSubject<boolean>;
  public isAuthenticated$: Observable<boolean>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check localStorage for saved user
    const savedUser = localStorage.getItem('currentUser');
    const savedToken = localStorage.getItem('authToken');
    
    this.currentUserSubject = new BehaviorSubject<User | null>(
      savedUser ? JSON.parse(savedUser) : null
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
    
    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(
      !!savedUser && !!savedToken
    );
    this.isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  }

  /**
   * Get current user value (synchronous)
   */
  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated (synchronous)
   */
  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Login user
   */
  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { 
      username, 
      password 
    }).pipe(
      tap(response => {
        if (response.success && response.user && response.token) {
          // Store user and token
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          localStorage.setItem('authToken', response.token);
          
          // Update observables
          this.currentUserSubject.next(response.user);
          this.isAuthenticatedSubject.next(true);
          
          console.log('Login successful:', response.user);
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        return of({
          success: false,
          message: error.error?.message || 'Login failed'
        });
      })
    );
  }

  /**
   * Logout user
   */
  logout(): void {
    // Clear storage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    
    // Update observables
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    
    // Navigate to login
    this.router.navigate(['/login']);
    
    console.log('User logged out');
  }

  /**
   * Get auth token for HTTP requests
   */
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  /**
   * Register new user (optional - for future)
   */
  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, {
      username,
      email,
      password
    });
  }
}
