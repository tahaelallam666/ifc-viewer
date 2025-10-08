import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { IfcViewerComponent } from './ifc-viewer/ifc-viewer.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    // Default route - redirect to login
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
    },
    
    // Login page - Public
    {
        path: 'login',
        component: LoginComponent
    },
    
    // IFC Viewer - Protected by auth guard
    {
        path: 'ifc-viewer',
        component: IfcViewerComponent,
        canActivate: [authGuard]  // Requires authentication
    },
    
    // Wildcard - redirect to login
    {
        path: '**',
        redirectTo: '/login'
    }
];
