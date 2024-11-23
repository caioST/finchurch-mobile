import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private afAuth: AngularFireAuth) {}

  // Observa o estado de autenticação do usuário
  getAuthState(): Observable<any> {
    return this.afAuth.authState; // Retorna um Observable do estado atual
  }

  // Realiza logout
  logout() {
    return this.afAuth.signOut();
  }
}
