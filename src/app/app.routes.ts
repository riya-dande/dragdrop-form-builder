import { Routes } from '@angular/router';

import { adminGuard, adminOrUserGuard, signedInGuard, userGuard } from './core/auth/auth.guard';
import { AppForms } from './features/app-forms/app-forms';
import { Auth } from './features/auth/auth';
import { Dashboard } from './features/dashboard/dashboard';
import { FormBuilder } from './features/form-builder/form-builder';
import { GeneratedForm } from './features/generated-form/generated-form';
import { Signup } from './features/signup/signup';
import { Users } from './features/users/users';

export const routes: Routes = [
  {
    path: 'auth',
    component: Auth,
  },
  {
    path: 'signup',
    component: Signup,
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/forgot-password/forgot-password').then(component => component.ForgotPassword),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/reset-password/reset-password').then(component => component.ResetPassword),
  },
  {
    path: 'reset-password/:token',
    loadComponent: () =>
      import('./features/reset-password/reset-password').then(component => component.ResetPassword),
  },
  {
    path: 'resetPassword',
    loadComponent: () =>
      import('./features/reset-password/reset-password').then(component => component.ResetPassword),
  },
  {
    path: 'admin/form-builder',
    component: FormBuilder,
    canActivate: [adminOrUserGuard],
  },
  {
    path: 'admin/apps/:appId/designer',
    component: FormBuilder,
    canActivate: [adminOrUserGuard],
  },
  {
    path: 'admin/apps/:appId/forms',
    component: AppForms,
    canActivate: [adminOrUserGuard],
  },
  {
    path: 'apps/:appId/forms',
    component: AppForms,
    canActivate: [signedInGuard],
  },
  {
    path: 'admin/apps/:appId/forms/:formId/create',
    component: GeneratedForm,
    canActivate: [adminOrUserGuard],
  },
  {
    path: 'apps/:appId/forms/:formId/create',
    component: GeneratedForm,
    canActivate: [signedInGuard],
  },
  {
    path: 'admin/apps/:appId/forms/:formId/responses/:responseId/edit',
    component: GeneratedForm,
    canActivate: [adminOrUserGuard],
  },
  {
    path: 'apps/:appId/forms/:formId/responses/:responseId/edit',
    component: GeneratedForm,
    canActivate: [signedInGuard],
  },
  {
    path: 'admin/apps/:appId/forms/:formId/responses/:responseId/view',
    component: GeneratedForm,
    canActivate: [adminOrUserGuard],
  },
  {
    path: 'apps/:appId/forms/:formId/responses/:responseId/view',
    component: GeneratedForm,
    canActivate: [signedInGuard],
  },
  {
    path: 'admin/dashboard',
    component: Dashboard,
    canActivate: [adminOrUserGuard],
  },
  {
    path: 'admin/generated-forms',
    component: GeneratedForm,
    canActivate: [adminOrUserGuard],
  },
  {
    path: 'generated-forms',
    component: GeneratedForm,
    canActivate: [signedInGuard],
  },
  {
    path: 'user/forms',
    component: GeneratedForm,
    canActivate: [userGuard],
  },
  {
    path: 'form-builder',
    redirectTo: 'admin/form-builder',
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [signedInGuard],
  },
  {
    path: 'users',
    component: Users,
    canActivate: [adminGuard],
  },
  {
    path: 'generated-form',
    redirectTo: 'generated-forms',
  },
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'auth',
  },
];
