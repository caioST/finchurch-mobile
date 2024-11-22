import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from 'src/app/core/services/firestore.service';
import { forkJoin } from 'rxjs';

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
  saldos = { entradas: 0, saidas: 0, total: 0, despesas: 0 };

  constructor(
    private route: ActivatedRoute,
    private firestoreService: FirestoreService,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.categoriaId = params['categoriaId'];
      this.colecao = params['colecao'];
    });

    // Recarregar subcategorias
    this.carregarSubcategorias();

    // Subscrição para garantir que, ao voltar, a página seja recarregada
    this.route.queryParams.subscribe(params => {
      if (params['reload']) {
        this.carregarSubcategorias();
      }
    });
  }


  carregarSubcategorias(): void {
    this.firestoreService.getSubcategorias(this.categoriaId, this.colecao).subscribe((subcategorias) => {
      console.log('Subcategorias recebidas:', subcategorias); // Verifique no console se as subcategorias estão sendo carregadas
      this.subcategorias = subcategorias || []; // Defina um array vazio caso não haja dados
      this.carregarTransacoes();
    });
  }

  carregarTransacoes(): void {
    if (this.subcategorias.length > 0) {
      const transacaoObservables = this.subcategorias.map((subcategoria) =>
        this.firestoreService.getTransacoes(this.colecao, this.categoriaId, subcategoria.id)
      );
      forkJoin(transacaoObservables).subscribe((transacoes) => {
        this.historico = transacoes;
        this.calcularSaldos();
      });
    }
  }

  calcularSaldos(): void {
    // Calcular totais com base nas transações
    console.log('Saldos calculados:', this.saldos);
  }

  selecionarSubcategoria(subcategoriaId: string): void {
    this.router.navigate([
      `/subcategoria/${this.colecao}/${this.categoriaId}/${subcategoriaId}`
    ]);
  }
  
  

  voltar(): void {
    this.router.navigate(['/categorias']);
  }
}
