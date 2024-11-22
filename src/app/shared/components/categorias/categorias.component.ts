import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirestoreService } from 'src/app/core/services/firestore.service';
import { combineLatest } from 'rxjs';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.scss'],
})
export class CategoriasComponent implements OnInit {
  receitas: any[] = [];
  despesas: any[] = [];
  departamentos: any[] = [];
  campanhas: any[] = [];
  saldos = {
    total: 0,
    receitas: 0,
    despesas: 0,
    departamentos: 0,
    campanhas: 0,
  };

  constructor(
    private router: Router,
    private firestoreService: FirestoreService,
    private alertController: AlertController
  ) {}

  ngOnInit(): void {
    this.loadCategorias();
  }

  /**
   * Carrega categorias de todas as coleções
   */
  loadCategorias(): void {
    combineLatest([
      this.firestoreService.getCategorias('receitas'),
      this.firestoreService.getCategorias('despesas'),
      this.firestoreService.getCategorias('departamentos'),
      this.firestoreService.getCategorias('campanhas'),
    ]).subscribe(([receitas, despesas, departamentos, campanhas]) => {
      this.receitas = receitas;
      this.despesas = despesas;
      this.departamentos = departamentos;
      this.campanhas = campanhas;
      this.calculateSaldos();
    });
  }

  /**
   * Atualiza saldos com base nas categorias
   */
  calculateSaldos(): void {
    this.saldos.receitas = this.calculateTotal(this.receitas);
    this.saldos.despesas = this.calculateTotal(this.despesas);
    this.saldos.departamentos = this.calculateTotal(this.departamentos);
    this.saldos.campanhas = this.calculateTotal(this.campanhas);
    this.saldos.total = this.saldos.receitas - this.saldos.despesas; // Saldo total

    console.log('Saldos atualizados:', this.saldos);
  }

  /**
   * Calcula o total de valores de uma coleção de categorias
   */
  calculateTotal(categorias: any[]): number {
    return categorias.reduce((total, categoria) => total + (categoria.quantia || 0), 0);
  }

  selecionarCategoria(categoriaId: string, colecao: string): void {
    this.router.navigate([`/subcategorias`, categoriaId, colecao]);
  }

  voltar(): void {
    this.router.navigate(['']);
  }

  abrirNotificacoes(): void {
    this.router.navigate(['/notificacoes']);
  }

  /**
   * Abre um popup para adicionar uma nova categoria
   */
  async abrirPopupAdicionarCategoria(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Nova Categoria',
      inputs: [
        {
          name: 'nome',
          type: 'text',
          placeholder: 'Nome da categoria',
        },
        {
          name: 'subcategorias',
          type: 'textarea',
          placeholder: 'Subcategorias (separe por vírgula)',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Salvar',
          handler: (data) => this.handleSalvarCategoria(data),
        },
      ],
    });
    await alert.present();
  }

  handleSalvarCategoria(data: any): boolean {
    const subcategorias = data.subcategorias
      ? data.subcategorias.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];
    
    this.firestoreService.adicionarCategoria('categorias', data.nome, subcategorias).then(() => {
      this.loadCategorias(); // Recarrega categorias após adicionar
    });

    return true;
  }
}
