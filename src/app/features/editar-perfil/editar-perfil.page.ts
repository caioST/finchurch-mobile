import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-editar-perfil',
  templateUrl: './editar-perfil.page.html',
  styleUrls: ['./editar-perfil.page.scss'],
})
export class EditarPerfilPage implements OnInit {
  userData = { name: '', phone: '', email: '' };
  confirmationCode: string = '';
  awaitingConfirmation = false;

  isEmailChanged = false;
  isPhoneChanged = false;

  constructor(
    private authService: AuthService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController
  ) { }

  async ngOnInit() {
    const userProfile = await this.authService.getCompleteUserProfile().toPromise();
    this.userData = { ...userProfile };
  }

  // Método para enviar o código de confirmação
  async sendConfirmationCode() {
    let field: 'email' | 'phone' | null = null;

    if (this.isEmailChanged && this.userData.email) {
      field = 'email';
    } else if (this.isPhoneChanged && this.userData.phone) {
      field = 'phone';
    }

    if (!field) {
      this.showAlert('Erro', 'Nenhum campo de e-mail ou telefone alterado para verificação.');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: `Enviando código para ${field}...` });
    await loading.present();

    try {
      // Envia o código de confirmação usando o AuthService
      await this.authService.sendConfirmationCode(field, this.userData[field]);
      this.awaitingConfirmation = true;
      await loading.dismiss();
      this.showAlert('Sucesso', `Código enviado para o ${field === 'email' ? 'e-mail' : 'telefone'}.`);
      this.isEmailChanged = false;
      this.isPhoneChanged = false;
    } catch (error) {
      console.error(error);
      await loading.dismiss();
      this.showAlert('Erro', `Erro ao enviar o código para o ${field === 'email' ? 'e-mail' : 'telefone'}.`);
    }
  }

  // Método para confirmar e atualizar os dados do usuário
  async confirmAndUpdate() {
    try {
      // Primeiro, verifica se o e-mail foi alterado
      if (this.isEmailChanged && this.userData.email) {
        // Atualiza o e-mail no Firebase e envia o e-mail de verificação
        await this.authService.updateEmailWithVerification(this.userData.email);

        // Aguarda a verificação do Firebase antes de prosseguir
        const emailVerified = await this.authService.finalizeEmailUpdate();
        if (!emailVerified) {
          throw new Error('Você precisa verificar o e-mail antes de prosseguir.');
        }

        // Atualiza o e-mail no Firestore após a verificação
        await this.authService.updateUserProfile({
          name: this.userData.name,
          phone: this.userData.phone,
          email: this.userData.email,
        });
      }

      // Atualiza os outros dados do usuário (telefone e nome)
      await this.authService.updateUserProfile({
        name: this.userData.name,
        phone: this.userData.phone,
      });

      this.showAlert('Sucesso', 'Perfil atualizado com sucesso!');
      this.navCtrl.navigateBack('/profile');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido.';
      this.showAlert('Erro', errorMessage);
    }
  }


  // Função para mostrar alertas
  private async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({ header, message, buttons: ['OK'] });
    await alert.present();
  }

  // Atualiza o e-mail e marca como alterado
  onEmailChange(newEmail: string) {
    this.userData.email = newEmail;
    this.isEmailChanged = true;
  }

  // Atualiza o telefone e marca como alterado
  onPhoneChange(newPhone: string) {
    this.userData.phone = newPhone;
    this.isPhoneChanged = true;
  }

  // Verifica se algum campo foi alterado
  onFieldChange() {
    this.isEmailChanged = this.userData.email !== '';
    this.isPhoneChanged = this.userData.phone !== '';
  }
}
