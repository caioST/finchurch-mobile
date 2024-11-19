import { Component } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio/ngx';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';


@Component({
  selector: 'app-fingerprint-authentication',
  templateUrl: './fingerprint-authentication.page.html',
  styleUrls: ['./fingerprint-authentication.page.scss'],
})
export class FingerprintAuthenticationPage {

 
  constructor(
    private navCtrl: NavController,              
    private toastCtrl: ToastController,          
    private fingerprintAIO: FingerprintAIO,      
    private afAuth: AngularFireAuth,             
    private firestore: AngularFirestore          
  ) {}

  // Método assíncrono para registro da impressão digital
  async registerFingerprint() {
    try {
      // Chama o plugin de impressão digital para autenticar o usuário
      const result = await this.fingerprintAIO.show({
        disableBackup: true,                    // Desativa métodos alternativos de autenticação (como PIN ou senha)
        title: 'Autenticação',                  // Título da janela de autenticação
        description: 'Use sua impressão digital para autenticar',  // Descrição que aparece na janela de autenticação
      });

      // Obtém o usuário atualmente autenticado no Firebase
      const currentUser = await this.afAuth.currentUser;
      if (currentUser) {
        // Atualiza o documento do usuário no Firestore para indicar que a impressão digital foi registrada
        await this.firestore.collection('users').doc(currentUser.uid).set({
          fingerprintRegistered: true           // Campo indicando o registro da impressão digital
        }, { merge: true });                    // 'merge: true' garante que outros dados do documento não sejam sobrescritos
      }

      // Após o sucesso da autenticação e atualização no Firestore, navega para a página de login
      this.navCtrl.navigateForward('/login');
    } catch (error: any) {
      // Em caso de erro, exibe uma mensagem toast para o usuário
      const message = error.message || 'Erro desconhecido';  // Verifica se a mensagem de erro está disponível
      const toast = await this.toastCtrl.create({
        message: 'Erro ao registrar impressão digital: ' + message,  // Mensagem exibida no toast
        duration: 2000,            // Duração de 2 segundos para o toast
        color: 'danger',           // Cor do toast em caso de erro (vermelho)
      });
      toast.present();             // Apresenta o toast ao usuário
    }
  }
}
