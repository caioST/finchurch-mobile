import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FinanceService } from 'src/app/core/services/finance.service';

@Component({
  selector: 'app-subcategorias',
  templateUrl: './subcategorias.component.html',
  styleUrls: ['./subcategorias.component.scss'],
})
export class SubcategoriasComponent implements OnInit {
  subcategorias: any[] = [];
  categoriaId: string = '';
  colecao: string = '';
  saldos: { total: number; receitas: number; despesas: number } = { total: 0, receitas: 0, despesas: 0 };

  constructor(
    private route: ActivatedRoute,
    private financeService: FinanceService,
    private router: Router
  ) {}

  ngOnInit() {
    // Obtém os parâmetros da rota
    this.route.params.subscribe((params) => {
      this.categoriaId = params['categoriaId'];
      this.colecao = params['colecao'];
      this.loadSubcategorias();
    });
  }

  loadSubcategorias() {
    this.financeService.getAllSubcategorias().subscribe({
      next: (subcategorias) => {
        this.subcategorias = subcategorias.filter(
          (sub) => sub.categoriaId === this.categoriaId && sub.colecao === this.colecao
        );
        this.calculateSaldos();
      },
      error: (error) => {
        console.error('Erro ao carregar subcategorias:', error);
      },
    });
  }

  calculateSaldos() {
    const totalReceitas = this.subcategorias
      .filter((sub) => sub.colecao === 'receitas')
      .reduce((total, sub) => total + (sub.quantia || 0), 0);

    const totalDespesas = this.subcategorias
      .filter((sub) => sub.colecao === 'despesas')
      .reduce((total, sub) => total + (sub.quantia || 0), 0);

    this.saldos = { total: totalReceitas - totalDespesas, receitas: totalReceitas, despesas: totalDespesas };
  }

  selecionarSubcategoria(subcategoriaId: string): void {
    this.router.navigate([
      `/subcategoria/${this.colecao}/${this.categoriaId}/${subcategoriaId}`,
    ]);
  }

  voltar(): void {
    this.router.navigate(['/categorias']);
  }
}
