import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.page.html',
  styleUrls: ['./configuration.page.scss'],
})
export class ConfigurationPage {
  constructor(private navCtrl: NavController) {}

  goToResetPassword() {
    this.navCtrl.navigateForward('/reset-password');
  }

  home() {
    this.navCtrl.navigateForward('/home');
  }

  perfil() {
    this.navCtrl.navigateForward('/profile');
  }

  relatorios() {
    this.navCtrl.navigateForward('/relatorios');
  }

  categorias() {
    this.navCtrl.navigateForward('/categorias');
  }

  goToDeleteAccount() {
    this.navCtrl.navigateForward('/delete-account');
  }

  voltar(): void {
    this.navCtrl.navigateBack(['/profile']);
  }
}
