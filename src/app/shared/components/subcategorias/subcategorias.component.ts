import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FinanceService } from 'src/app/core/services/finance.service';
import { forkJoin } from 'rxjs';
import { NavigationEnd } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-subcategorias',
  templateUrl: './subcategorias.component.html',
  styleUrls: ['./subcategorias.component.scss'],
})
export class SubcategoriasComponent implements OnInit {
  subcategorias: any[] = [];
  categoriaId: string = '';
  colecao: string = '';
  historico: any[] = [];
  saldos: { entradas: number; saidas: number; total: number; despesas: number } = {
    entradas: 0,
    saidas: 0,
    total: 0,
    despesas: 0,
  };

  constructor(
    private route: ActivatedRoute,
    private financeService: FinanceService,
    private router: Router,
    private navController: NavController
  ) { }

  ngOnInit() {
    // Substituímos o carregamento inicial para acompanhar os eventos de navegação
    this.route.params.subscribe((params) => {
      this.categoriaId = params['categoriaId'];
      this.colecao = params['colecao'];
    });

    // Recarregar dados sempre que o usuário voltar para esta página
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.carregarSubcategorias();
      }
    });

    // Carregamento inicial
    this.carregarSubcategorias();
  }

  carregarSubcategorias(): void {
    // Carrega todas as subcategorias relacionadas à categoria atual
    this.financeService.getAllSubcategorias().subscribe({
      next: (subcategorias) => {
        this.subcategorias = subcategorias.filter(
          (sub) => sub.categoriaId === this.categoriaId && sub.colecao === this.colecao
        );
        if (this.subcategorias.length > 0) {
          this.carregarTransacoes(); // Carrega transações após carregar subcategorias
        } else {
          console.warn('Nenhuma subcategoria encontrada para esta categoria.');
        }
      },
      error: (error) => console.error('Erro ao carregar subcategorias:', error),
    });
  }

  carregarTransacoes(): void {
    const transacaoObservables = this.subcategorias.map((subcategoria) =>
      this.financeService
        .getSubcategoriaTransacoes(this.colecao, this.categoriaId, subcategoria.id)
    );

    // Combina todas as transações das subcategorias
    forkJoin(transacaoObservables).subscribe({
      next: (transacoesArray) => {
        // Verifica se o array está preenchido
        if (transacoesArray.length > 0) {
          this.historico = transacoesArray.flat();
          console.log('Histórico carregado:', this.historico);
        } else {
          console.warn('Nenhuma transação encontrada.');
        }
      },
      error: (error) => console.error('Erro ao carregar transações:', error),
    });
  }

  home(): void {
    this.navController.navigateBack(['/home']);
  }

  relatorios(): void {
    this.navController.navigateBack(['/relatorios']);
  }

  categorias(): void {
    this.navController.navigateBack(['/categorias']);
  }

  perfil(): void {
    this.navController.navigateBack(['/profile']);
  }

  selecionarSubcategoria(subcategoriaId: string): void {
    this.navController.navigateBack([
      `/subcategoria/${this.colecao}/${this.categoriaId}/${subcategoriaId}`,
    ]);
  }

  voltar(): void {
    this.navController.navigateBack(['/categorias']);
  }
}
