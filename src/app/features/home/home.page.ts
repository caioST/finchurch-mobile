import { Component, OnInit } from '@angular/core';
import { FinanceService } from 'src/app/core/services/finance.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { NavController } from '@ionic/angular';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  totalTransacoes: number = 0;
  historicoTransacoes: any[] = [];
  userPhoto: string = '';

  constructor(
    private financeService: FinanceService,
    private authService: AuthService,
    private navController: NavController
  ) {}

  ngOnInit() {
    this.carregarDados();
    this.carregarFotoUsuario();
  }

  carregarDados() {
    // Usando forkJoin para obter o total de transações e o histórico ao mesmo tempo
    forkJoin({
      total: this.financeService.obterTotalTransacoes(),
      historico: this.financeService.obterHistoricoTransacoes(),
    }).subscribe({
      next: (res) => {
        this.totalTransacoes = res.total;
        this.historicoTransacoes = res.historico;
      },
      error: (error) => {
        console.error('Erro ao carregar dados:', error);
      }
    });
  }

  carregarFotoUsuario() {
    this.authService.getCompleteUserProfile().subscribe((user) => {
      if (user) {
        this.userPhoto = user.photoURL || 'assets/icon-person.png';
      }
    });
  }

  voltar(): void {
    this.navController.navigateBack(['']);
  }

  relatorios(): void {
    this.navController.navigateBack(['/relatorios']);
  }

  perfil(): void {
    this.navController.navigateBack(['/profile']);
  }

  abrirNotificacoes(): void {
    this.navController.navigateBack(['/notificacoes']);
  }
  
  categorias(): void {
    this.navController.navigateBack(['/categorias']);
  }

  goToProfile() {
    // Navegar para a página de perfil
    // Substitua `'/perfil'` pela rota correta da página de perfil
    window.location.href = '/profile';
  }
}
