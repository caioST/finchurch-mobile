import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  // Variáveis para exibir os dados do perfil
  userName: string = ''; // Nome completo
  userEmail: string = ''; // Email
  userUID: string = ''; // UID
  userCPF: string = ''; // CPF
  userPhone: string = ''; // Telefone
  userBirthDate: string = ''; // Data de nascimento
  userPhoto: string = 'assets/icon-person.png'; // Foto padrão

  constructor(
    private alertCtrl: AlertController,
    private authService: AuthService,
    private navController: NavController
  ) {}

  ngOnInit() {
    // Observa o estado de autenticação e dados do Firestore
    this.authService.getCompleteUserProfile().subscribe((userProfile) => {
      if (userProfile) {
        // Authentication (email e UID)
        this.userEmail = userProfile.email || 'Não informado';
        this.userUID = userProfile.uid || 'Não informado';

        // Firestore (dados adicionais)
        this.userName = userProfile.fullName || 'Usuário';
        this.userCPF = userProfile.cpf || 'Não informado';
        this.userPhone = userProfile.phone || 'Não informado';
        this.userBirthDate = userProfile.birthDate || 'Não informado';

        // Foto (padrão se não estiver salva)
        this.userPhoto = userProfile.photoURL || 'assets/icon-person.png';
      }
    });
  }

  async confirmLogout() {
    const alert = await this.alertCtrl.create({
      header: 'Desconectar',
      message: 'Tem certeza de que deseja sair?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Sim, Encerrar Sessão',
          handler: () => this.logout(),
        },
      ],
    });
    await alert.present();
  }

  goToEditProfile() {
    this.navController.navigateForward('/editar-perfil');
  }

  goToCategorias() {
    this.navController.navigateForward('/categorias');
  }

  relatorios() {
    this.navController.navigateForward('/relatorios');
  }

  goToConfiguration() {
    this.navController.navigateForward('/configuration');
  }

  logout() {
    this.authService.logout().then(() => {
      console.log('Logout realizado com sucesso');
      // Redireciona para a tela de login
      this.navController.navigateBack(['/login']);
    });
  }
}