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
  totalCategoria: number = 0;
  saldos: { [key: string]: { entradas: number; saidas: number } } = {};

  constructor(
    private route: ActivatedRoute,
    private financeService: FinanceService,
    private router: Router,
    private navController: NavController
  ) { }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.colecao = params['colecao'];
      this.categoriaId = params['categoriaId'];
      this.carregarSubcategorias();
      this.carregarTotaisDaCategoria();
    });
  }

  carregarSubcategorias(): void {
    this.financeService
      .getSubcategoriasPorCategoria(this.colecao, this.categoriaId)
      .subscribe((subcategorias) => {
        this.subcategorias = subcategorias;
      });
  }

  carregarTotaisDaCategoria(): void {
    this.financeService
      .calcularTotaisPorCategoria(this.colecao, this.categoriaId)
      .subscribe((total) => {
        console.log(`Total da categoria (${this.categoriaId}):`, total);
        this.totalCategoria = total;
      });
  }
  
  

  obterSaldo(subcategoriaId: string): { entradas: number; saidas: number } {
    return this.saldos[subcategoriaId] || { entradas: 0, saidas: 0 };
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
