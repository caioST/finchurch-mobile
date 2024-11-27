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
  ) {}

  ngOnInit(): void {
    // Obtem os parâmetros da rota e carrega os detalhes da subcategoria
    this.route.params.subscribe((params) => {
      this.colecao = params['colecao'];
      this.categoriaId = params['categoriaId'];
      this.subcategoriaId = params['subcategoriaId'];
      this.carregarResumo();
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
        next: (subcategoria) => {
          if (subcategoria) {
            console.log('Subcategoria encontrada:', subcategoria);
            this.subcategoria = subcategoria;
          } else {
            console.warn(`Subcategoria ${this.subcategoriaId} não encontrada na coleção ${this.colecao}`);
          }
        },
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
          this.calcularSaldos(); // Recalcula saldos com base no histórico atualizado
        },
        error: (error) => console.error('Erro ao carregar transações:', error),
      });
  }

  calcularSaldos(): void {
    const entradas = this.historico
      .filter((transacao) => transacao.tipo === 'entrada' && transacao.quantia > 0) // Validação de tipo e valor
      .reduce((total, transacao) => total + transacao.quantia, 0);
  
    const saidas = this.historico
      .filter((transacao) => transacao.tipo === 'saida' && transacao.quantia > 0) // Validação de tipo e valor
      .reduce((total, transacao) => total + transacao.quantia, 0);
  
    this.saldos = { entradas, saidas }; // Atualiza os saldos
  }

  adicionarValor(): void {
    // Navega para a tela de adicionar valor na subcategoria
    this.router.navigate([
      `/subcategoria/${this.colecao}/${this.categoriaId}/${this.subcategoriaId}/adicionar`,
    ]);
  }

  voltar(): void {
    this.router.navigate([`/subcategorias/${this.colecao}/${this.categoriaId}`]);
  }
}
