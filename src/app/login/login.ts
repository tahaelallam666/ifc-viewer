import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit {
  // Form fields
  username: string = '';
  password: string = '';
  
  // UI state
  isLoading: boolean = false;
  errorMessage: string = '';
  returnUrl: string = '/ifc-viewer';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // If already logged in, redirect to ifc-viewer
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/ifc-viewer']);
    }

    // Get return URL from route parameters or default to '/ifc-viewer'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/ifc-viewer';
  }

  /**
   * Handle login form submission
   */
  onLogin(): void {
    // Clear previous errors
    this.errorMessage = '';

    // Validate inputs
    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter username and password';
      return;
    }

    this.isLoading = true;

    // Call auth service
    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        if (response.success) {
          // Login successful, navigate to return URL
          console.log('Login successful, navigating to:', this.returnUrl);
          this.router.navigate([this.returnUrl]);
        } else {
          // Login failed
          this.errorMessage = response.message || 'Invalid username or password';
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        this.errorMessage = 'An error occurred. Please try again.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Handle Enter key press in form
   */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onLogin();
    }
  }
}
