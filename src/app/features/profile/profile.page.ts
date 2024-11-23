import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';// Serviço Firebase
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  userName: string = ''; // Nome do usuário
  userEmail: string = ''; // E-mail do usuário
  userUID: string = ''; // UID do usuário
  userPhoto: string = 'assets/person.icon.png'; // Ícone padrão

  constructor(
    private alertCtrl: AlertController,
    private authService: AuthService, // Serviço Firebase
    private navController: NavController
  ) {}

  ngOnInit() {
    // Observa o estado de autenticação do Firebase
    this.authService.getAuthState().subscribe((user) => {
      if (user) {
        this.userEmail = user.email || 'Não informado';
        this.userUID = user.uid || 'Não informado';
        this.userName = user.displayName || 'Usuário';
        this.userPhoto = user.photoURL || 'assets/person-icon.png'; // Usa foto padrão se não houver
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

  logout() {
    this.authService.logout().then(() => {
      console.log('Logout realizado com sucesso');
      // Redireciona para a tela de login
      this.navController.navigateBack(['/login'])
    });
  }
}
