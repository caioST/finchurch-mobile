import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { CategoriasComponent } from './shared/components/categorias/categorias.component';
import { SubcategoriasComponent } from './shared/components/subcategorias/subcategorias.component';
import { ResumoSubcategoriaComponent } from './shared/components/resumo-categoria/resumo-categoria.component';
import { AdicionarValorComponent } from './shared/components/adicionar-valor/adicionar-valor.component';


const routes: Routes = [

  {
    path: '',
    redirectTo: 'splash',
    pathMatch: 'full'
  },

  {
    path: 'splash',
    loadChildren: () => import('./features/splash/splash.module').then(m => m.SplashPageModule)
  },

  {
    path: 'access',
    loadChildren: () => import('./features/access/access.module').then(m => m.AccessPageModule)
  },

  {
    path: 'login',
    loadChildren: () => import('./features/login/login.module').then(m => m.LoginPageModule)
  },

  {
    path: 'relatorios',
    loadChildren: () => import('./features/relatorios/relatorios.module').then( m => m.RelatoriosPageModule)
  },

  {
    path: 'register',
    loadChildren: () => import('./features/register/register.module').then(m => m.RegisterPageModule)
  },

  {
    path: 'forgot-password',
    loadChildren: () => import('./features/forgot-password/forgot-password.module').then(m => m.ForgotPasswordPageModule)
  },

  {
    path: 'fingerprint-authentication',
    loadChildren: () => import('./features/fingerprint-authentication/fingerprint-authentication.module').then(m => m.FingerprintAuthenticationPageModule)
  },
  
  {
    path: 'profile',
    loadChildren: () => import('./features/profile/profile.module').then( m => m.ProfilePageModule)
  },

  {
    path: 'categorias',
    component: CategoriasComponent
  },

  {
    path: 'subcategorias/:categoriaId/:colecao',
    component: SubcategoriasComponent
  },

  { 
    path: 'subcategoria/:colecao/:categoriaId/:subcategoriaId', 
    component: ResumoSubcategoriaComponent 
  },

  { 
    path: 'subcategoria/:colecao/:categoriaId/:subcategoriaId/adicionar', 
    component: AdicionarValorComponent 
  },

  

  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }