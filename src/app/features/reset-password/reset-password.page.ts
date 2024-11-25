import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { NavController, ToastController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage {
  email: string = ''; // Armazenamento do e-mail do usuário

  constructor(
    private navController: NavController,
    private toastCtrl: ToastController,
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore // Adiciona o Firestore ao construtor
  ) { }

  // Método assíncrono para envio do e-mail de redefinição de senha
  async sendResetEmail() {
    if (!this.email) {
      const toast = await this.toastCtrl.create({
        message: 'Por favor, insira um e-mail.',
        duration: 2000,
        color: 'warning'
      });
      toast.present();
      return; // Não prosseguir se o e-mail estiver vazio
    }

    try {
      // Envio do e-mail de recuperação de senha usando o Firebase
      await this.afAuth.sendPasswordResetEmail(this.email);

      // Atualizar a impressão digital no Firestore após o envio do e-mail
      const currentUser = await this.afAuth.currentUser;
      if (currentUser) {
        await this.firestore.collection('users').doc(currentUser.uid).update({
          fingerprintRegistered: true // Atualiza a impressão digital
        });
      }

      // Mensagem de sucesso usando o ToastController
      const toast = await this.toastCtrl.create({
        message: 'E-mail de recuperação enviado com sucesso!',
        duration: 2000,
        color: 'success'
      });
      toast.present();

      // Navegar de volta para a página de login
      this.navController.navigateBack('/login');
    } catch (error: any) { // Aqui fazemos a afirmação de tipo
      // Em caso de erro, exibe uma mensagem de erro ao usuário
      const message = error.code === 'auth/missing-email' ?
        'O e-mail é obrigatório.' :
        'Erro ao enviar e-mail de recuperação.';

      const toast = await this.toastCtrl.create({
        message: message,
        duration: 2000,
        color: 'danger'
      });
      toast.present();
    }
  }

  home(): void {
    this.navController.navigateBack(['/home']);
  }

  relatorios(): void {
    this.navController.navigateBack(['/relatorios']);
  }

  categorias(): void {
    this.navController.navigateBack(['/categorias']);
  }

  perfil(): void {
    this.navController.navigateBack(['/profile']);
  }

  // Navegar até a página de login
  goToLogin() {
    this.navController.navigateForward('/profile', {
      animated: true,
      animationDirection: 'forward'
    });
  }

}
