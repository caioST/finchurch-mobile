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
  saldos: { [key: string]: { entradas: number; saidas: number } } = {};
  totalEntradas: number = 0;
  totalSaidas: number = 0;
  userPhoto: string = '';

  constructor(
    private financeService: FinanceService,
    private authService: AuthService,
    private navController: NavController
  ) { }

  ngOnInit() {
    this.carregarDadosTotais();
    this.carregarFotoUsuario();
  }

  carregarDadosTotais() {
    this.financeService.getAllSubcategorias().subscribe({
      next: (subcategorias) => {
        console.log('Subcategorias carregadas:', subcategorias);

        // Para verificar se está passando corretamente as subcategorias para os cálculos
        const calculos = subcategorias.map((subcategoria) => {
          console.log('Calculando saldo para subcategoria:', subcategoria);
          return this.financeService.calcularSaldos(
            subcategoria.colecao,
            subcategoria.categoriaId,
            subcategoria.id
          );
        });

        forkJoin(calculos).subscribe({
          next: (resultados) => {
            console.log('Resultados dos cálculos:', resultados);

            let entradasTotal = 0;
            let saidasTotal = 0;

            resultados.forEach((saldos, index) => {
              console.log(`Entradas e Saídas da subcategoria ${index + 1}:`, saldos);

              // Somando entradas e saídas para o total
              entradasTotal += saldos.entradas;
              saidasTotal += saldos.saidas;
            });

            // Log dos totais calculados
            console.log('Total de Entradas (calculado):', entradasTotal);
            console.log('Total de Saídas (calculado):', saidasTotal);

            // Atualizando os totais no componente
            this.totalEntradas = entradasTotal;
            this.totalSaidas = saidasTotal;
          },
          error: (error) => {
            console.error('Erro ao calcular saldos:', error);
          },
        });
      },
      error: (error) => {
        console.error('Erro ao carregar subcategorias:', error);
      },
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
    window.location.href = '/profile';
  }
}
