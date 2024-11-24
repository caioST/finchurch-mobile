import { Component } from '@angular/core';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-delete-account',
  templateUrl: './delete-account.page.html',
  styleUrls: ['./delete-account.page.scss'],
})
export class DeleteAccountPage {
  password: string = '';

  constructor(
    private authService: AuthService,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) { }

  async showDeleteConfirmation() {
    if (!this.password) {
      const toast = await this.toastCtrl.create({
        message: 'Por favor, insira sua senha.',
        duration: 2000,
        color: 'warning',
      });
      toast.present();
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Excluir Conta',
      message:
        'Ao excluir sua conta, você concorda que entende as consequências desta ação e que ela é permanente. Deseja continuar?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Sim, Excluir Conta',
          handler: () => this.deleteAccount(),
        },
      ],
    });

    await alert.present();
  }

  async deleteAccount() {
    try {
      await this.authService.deleteUser(this.password);
      const toast = await this.toastCtrl.create({
        message: 'Conta excluída com sucesso!',
        duration: 2000,
        color: 'success',
      });
      toast.present();
      this.navCtrl.navigateBack('/login');
    } catch (error: unknown) {
      // Verificando se o erro é uma instância de Error
      const message = error instanceof Error ? error.message : 'Erro desconhecido';

      const toast = await this.toastCtrl.create({
        message: message || 'Erro ao excluir conta.',
        duration: 2000,
        color: 'danger',
      });
      toast.present();
    }
  }

  goToConfiguration() {
    this.navCtrl.navigateForward('/configuration');
  }

}
