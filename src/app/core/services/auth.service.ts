import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import * as emailjs from 'emailjs-com';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private emailServiceId = 'service_ixtrn68';
  private emailTemplateId = 'template_92q442n';
  private emailUserId = 'mKwEOfWD7pUtauoo8';

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore
  ) {}

  getAuthState(): Observable<any> {
    return this.afAuth.authState;
  }

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendConfirmationCode(target: 'email' | 'phone', value: string): Promise<void> {
    const code = this.generateCode();

    if (target === 'email') {
      try {
        const templateParams = {
          to_email: value,
          confirmation_code: code,
        };

        // Verifica se o envio foi bem-sucedido
        const response = await emailjs.send(
          this.emailServiceId,
          this.emailTemplateId,
          templateParams,
          this.emailUserId
        );
        console.log('EmailJS Response:', response);

        const expiry = Date.now() + 10 * 60 * 1000; // Código válido por 10 minutos
        localStorage.setItem(`verification_code_${value}`, code);
        localStorage.setItem(
          `verification_code_expiry_${value}`,
          expiry.toString()
        );

        console.log(`Código de verificação enviado para ${value}: ${code}`);
      } catch (error) {
        console.error('Erro ao enviar e-mail:', error);
        throw new Error('Falha ao enviar o código de verificação. Verifique o endereço de e-mail.');
      }
    }
  }

  validateConfirmationCode(target: 'email' | 'phone', value: string, code: string): boolean {
    const storedCode = localStorage.getItem(`verification_code_${value}`);
    const expiry = parseInt(localStorage.getItem(`verification_code_expiry_${value}`) || '0', 10);

    if (!storedCode || !expiry || Date.now() > expiry) {
      throw new Error(`${target === 'email' ? 'E-mail' : 'Telefone'}: Código expirado ou inválido.`);
    }

    if (storedCode !== code) {
      throw new Error(`${target === 'email' ? 'E-mail' : 'Telefone'}: Código de verificação incorreto.`);
    }

    localStorage.removeItem(`verification_code_${value}`);
    localStorage.removeItem(`verification_code_expiry_${value}`);
    return true;
  }

  // Atualizando e-mail com verificação do Firebase
  async updateEmailWithVerification(newEmail: string): Promise<void> {
    const user = await this.afAuth.currentUser;
    if (!user) throw new Error('Usuário não autenticado.');

    if (user.email === newEmail) {
      throw new Error('O novo e-mail é igual ao e-mail atual.');
    }

    // Reautentica o usuário
    try {
      await user.getIdTokenResult(true); // Força a reautenticação
    } catch (error) {
      throw new Error('Sua sessão expirou. Por favor, faça login novamente.');
    }

    // Atualiza o e-mail no Firebase
    await user.updateEmail(newEmail);
    console.log('E-mail atualizado para:', newEmail);

    // Envia o e-mail de verificação após a atualização do e-mail
    await user.sendEmailVerification();
    console.log('E-mail de verificação enviado para:', newEmail);
  }

  async finalizeEmailUpdate(): Promise<boolean> {
    const user = await this.afAuth.currentUser;
    if (!user) throw new Error('Usuário não autenticado.');

    await user.reload(); // Atualiza o estado do usuário
    if (user.emailVerified) {
      console.log('E-mail verificado com sucesso.');
      return true;
    }

    throw new Error('O e-mail ainda não foi verificado. Por favor, clique no link de verificação.');
  }

  async updateUserProfile(data: { name?: string; email?: string; phone?: string; code?: string }): Promise<void> {
    const user = await this.afAuth.currentUser;
    if (!user) throw new Error('Usuário não autenticado.');

    const uid = user.uid;

    if (data.code && (data.email || data.phone)) {
      const target = data.email ? 'email' : 'phone';
      const value = data.email || data.phone || '';
      this.validateConfirmationCode(target, value, data.code);
    }

    if (data.email) {
      await this.updateEmailWithVerification(data.email);
      const emailVerified = await this.finalizeEmailUpdate();
      if (!emailVerified) {
        throw new Error('O e-mail ainda não foi verificado. Por favor, clique no link de verificação.');
      }
    }

    if (data.name || data.phone) {
      await this.firestore.collection('usuarios').doc(uid).update({
        name: data.name || null,
        phone: data.phone || null,
      });
    }
  }

  getCompleteUserProfile(): Observable<any> {
    return this.afAuth.authState.pipe(
      switchMap((authUser) => {
        if (!authUser) return of(null);
        const { email, uid } = authUser;
        return this.firestore.collection('usuarios').doc(uid).valueChanges().pipe(
          map((firestoreData) => {
            if (firestoreData && typeof firestoreData === 'object') {
              return { email, uid, ...firestoreData };
            }
            return { email, uid };
          })
        );
      })
    );
  }

  logout() {
    return this.afAuth.signOut();
  }
}