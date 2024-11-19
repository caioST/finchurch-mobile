import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-terms-modal',
  templateUrl: './terms-modal.component.html',
  styleUrls: ['./terms-modal.component.scss'],
})
export class TermsModalComponent {
  constructor(private modalCtrl: ModalController) {}

  acceptTerms() {
    this.modalCtrl.dismiss({ accepted: true });
  }

  declineTerms() {
    this.modalCtrl.dismiss({ accepted: false });
  }

  closeModal() {
    this.modalCtrl.dismiss({ accepted: false });
  }
}
