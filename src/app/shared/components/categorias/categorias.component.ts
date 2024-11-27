import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NavController } from '@ionic/angular';
import { Observable, combineLatest, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { FinanceService } from 'src/app/core/services/finance.service'; // Importando o serviço

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
  totalGeralEntradas: number = 0;


  constructor(
    private router: Router,
    private alertController: AlertController,
    private firestore: AngularFirestore,
    private financeService: FinanceService,
    private navController: NavController
  ) { }

  ngOnInit(): void {
    this.loadCategorias();
  }

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
          return of([[], [], [], []]);
        })
      )
      .subscribe(([receitas, despesas, departamentos, campanhas]) => {
        this.receitas = receitas;
        this.despesas = despesas;
        this.departamentos = departamentos;
        this.campanhas = campanhas;
      });
  }
  

  // Método para obter as subcategorias de cada tipo de categoria
  getSubcategorias(tipo: string): string[] {
    switch (tipo) {
      case 'receitas':
        return ['Dízimos', 'Doações', 'Ofertas']; // Exemplo de subcategorias
      case 'despesas':
        return ['Salário']; // Exemplo de subcategoria
      case 'departamentos':
        return ['EBD', 'Juventude', 'Missões']; // Exemplo de subcategorias
      case 'campanhas':
        return ['Construção', 'Igreja', 'Ministérios', 'Social']; // Exemplo de subcategorias
      default:
        return [];
    }
  }

  /**
   * Obtém categorias de uma coleção Firestore
   */
  getCategoriasFromFirestore(colecao: string): Observable<Categoria[]> {
    return this.firestore
      .collection<Categoria>(colecao)
      .valueChanges({ idField: 'id' })
      .pipe(
        map((categorias) => categorias || []),
        catchError((error) => {
          console.error(`Erro ao obter categorias de ${colecao}:`, error);
          return of([]);
        })
      );
  }

  /**
   * Redireciona para a página de subcategorias
   */
  selecionarCategoria(categoriaId: string, colecao: string): void {
    this.navController.navigateBack([`/subcategorias`, categoriaId, colecao]);
  }

  voltar(): void {
    this.navController.navigateBack(['']);
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

  abrirNotificacoes(): void {
    this.navController.navigateBack(['/notificacoes']);
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
        console.log('Categoria adicionada com sucesso');
      })
      .catch((error) => {
        console.error('Erro ao adicionar categoria:', error);
      });
  }
}
