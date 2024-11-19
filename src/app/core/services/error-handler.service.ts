import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandler {

  constructor(private toastCtrl: ToastController) {}

  async handleError(error: any) {
    console.error(error);
    // Exibe mensagem de erro para o usuário
    const toast = await this.toastCtrl.create({
      message: error.message || 'Ocorreu um erro', // Mensagem de fallback caso 'error.message' não esteja disponível
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
  }
}
