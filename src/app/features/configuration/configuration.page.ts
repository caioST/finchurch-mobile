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

  goToDeleteAccount() {
    this.navCtrl.navigateForward('/delete-account');
  }

  voltar(): void {
    this.navCtrl.navigateBack(['/profile']);
  }
}
