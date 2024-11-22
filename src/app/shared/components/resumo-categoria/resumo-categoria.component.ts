import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FinanceService } from 'src/app/core/services/finance.service';

@Component({
  selector: 'app-resumo-categoria',
  templateUrl: './resumo-categoria.component.html',
  styleUrls: ['./resumo-categoria.component.scss'],
})
export class ResumoSubcategoriaComponent implements OnInit {
  colecao: string = '';
  categoriaId: string = '';
  subcategoriaId: string = '';
  historico: any[] = []; // Armazena o histórico de transações
  saldos: { entradas: number; saidas: number } = { entradas: 0, saidas: 0 }; // Saldo acumulado
  subcategoria: { nome: string; icone: string } | null = null; // Detalhes da subcategoria

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private financeService: FinanceService
  ) { }

  ngOnInit(): void {
    // Obtem os parâmetros da rota e carrega os detalhes da subcategoria
    this.route.params.subscribe((params) => {
      this.colecao = params['colecao'];
      this.categoriaId = params['categoriaId'];
      this.subcategoriaId = params['subcategoriaId'];
      this.carregarResumo();
      this.carregarSaldos();
    });

    // Atualiza transações quando o usuário volta da tela de adicionar
    this.router.events.subscribe(() => {
      this.carregarTransacoes(); // Garante que as transações sejam atualizadas após adicionar
    });
  }

  carregarResumo(): void {
    this.financeService
      .getSubcategoriaDetalhes(this.colecao, this.categoriaId, this.subcategoriaId)
      .subscribe({
        next: (subcategoria) => (this.subcategoria = subcategoria),
        error: (error) => console.error('Erro ao carregar subcategoria:', error),
      });
  }

  carregarTransacoes(): void {
    // Carrega as transações da subcategoria
    this.financeService
      .getSubcategoriaTransacoes(this.colecao, this.categoriaId, this.subcategoriaId)
      .subscribe({
        next: (transacoes) => {
          console.log('Transações encontradas:', transacoes);
          this.historico = transacoes;
          this.carregarSaldos(); // Recalcula saldos com base no histórico atualizado
        },
        error: (error) => console.error('Erro ao carregar transações:', error),
      });
  }

  carregarSaldos(): void {
    this.financeService
      .calcularSaldos(this.colecao, this.categoriaId, this.subcategoriaId)
      .subscribe({
        next: (saldos) => (this.saldos = saldos),
        error: (error) => console.error('Erro ao carregar saldos:', error),
      });
  }

  adicionarValor(): void {
    // Navega para a tela de adicionar valor na subcategoria
    this.router.navigate([
      `/subcategoria/${this.colecao}/${this.categoriaId}/${this.subcategoriaId}/adicionar`,
    ]);
  }

  voltar(): void {
    this.router.navigate([`/subcategorias/${this.categoriaId}/${this.colecao}`], {
      queryParams: { reload: true }
    });
  }
  
  
  
}
