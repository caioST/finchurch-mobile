import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, combineLatest } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface Categoria {
  id: string;
  nome: string;
  tipo: string;
  quantia: number;
  icone?: string;
  subcategorias?: string[];
}

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.scss'],
})
export class CategoriasComponent implements OnInit {
  receitas: Categoria[] = [];
  despesas: Categoria[] = [];
  departamentos: Categoria[] = [];
  campanhas: Categoria[] = [];
  saldos = {
    total: 0,
    receitas: 0,
    despesas: 0,
    departamentos: 0,
    campanhas: 0,
  };

  constructor(
    private router: Router,
    private alertController: AlertController,
    private firestore: AngularFirestore
  ) { }

  ngOnInit(): void {
    this.loadCategorias();
  }

  /**
   * Carrega categorias de todas as coleções
   */
  loadCategorias(): void {
    combineLatest([
      this.getCategoriasFromFirestore('receitas'),
      this.getCategoriasFromFirestore('despesas'),
      this.getCategoriasFromFirestore('departamentos'),
      this.getCategoriasFromFirestore('campanhas'),
    ])
      .pipe(
        catchError((error) => {
          console.error('Erro ao carregar categorias:', error);
          return of([[], [], [], []]); // Retorna valores vazios em caso de erro
        })
      )
      .subscribe(([receitas, despesas, departamentos, campanhas]) => {
        this.receitas = receitas;
        this.despesas = despesas;
        this.departamentos = departamentos;
        this.campanhas = campanhas;
        this.calculateSaldos();
      });
  }

  /**
   * Obtém categorias de uma coleção Firestore
   */
  getCategoriasFromFirestore(colecao: string): Observable<Categoria[]> {
    return this.firestore
      .collection<Categoria>(colecao)
      .valueChanges({ idField: 'id' })
      .pipe(
        map((categorias) => categorias || []), // Garante que nunca retorne `null`
        catchError((error) => {
          console.error(`Erro ao obter categorias de ${colecao}:`, error);
          return of([]); // Retorna array vazio em caso de erro
        })
      );
  }

  /**
   * Calcula saldos de receitas, despesas, etc.
   */
  calculateSaldos(): void {
    this.saldos = {
      receitas: this.calculateTotal(this.receitas),
      despesas: this.calculateTotal(this.despesas),
      departamentos: this.calculateTotal(this.departamentos),
      campanhas: this.calculateTotal(this.campanhas),
      total:
        this.calculateTotal(this.receitas) - this.calculateTotal(this.despesas),
    };
  }

  /**
   * Calcula o total de valores em uma categoria
   */
  calculateTotal(categorias: Categoria[]): number {
    return categorias.reduce(
      (total, categoria) => total + (categoria.quantia || 0),
      0
    );
  }

  /**
   * Redireciona para a página de subcategorias
   */
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

  /**
   * Valida e processa os dados de uma nova categoria
   */
  handleSalvarCategoria(data: any): boolean {
    if (!data.nome || !data.nome.trim()) {
      console.error('Nome da categoria é obrigatório.');
      return false;
    }

    const subcategorias = data.subcategorias
      ? data.subcategorias
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean)
      : [];

    this.adicionarCategoriaFirebase(data.nome, subcategorias);
    return true;
  }

  /**
   * Adiciona uma nova categoria ao Firestore
   */
  adicionarCategoriaFirebase(nome: string, subcategorias: string[]): void {
    const categoria: Omit<Categoria, 'id'> = {
      nome,
      subcategorias,
      tipo: 'personalizada',
      quantia: 0,
    };

    this.firestore
      .collection('categorias')
      .add(categoria)
      .then(() => {
        console.log('Categoria adicionada com sucesso.');
        this.loadCategorias();
      })
      .catch((error) => {
        console.error('Erro ao adicionar categoria:', error);
      });
  }
}