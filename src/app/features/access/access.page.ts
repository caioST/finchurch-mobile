import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';


@Component({
  selector: 'app-access',
  templateUrl: './access.page.html',
  styleUrls: ['./access.page.scss'],
})
export class AccessPage {

  constructor(private navCtrl: NavController) {}

  resetPassword() {
    this.navCtrl.navigateForward('/forgot-password,', {
      animated: true,
      animationDirection: 'forward'
    });
  }

  goToLogin() {

    this.navCtrl.navigateForward('/login', {
      animated: true,
      animationDirection: 'forward'
    });
  }

  goToRegister() {
    this.navCtrl.navigateForward('/register', {
      animated: true,
      animationDirection: 'forward'
    });
  }
}
