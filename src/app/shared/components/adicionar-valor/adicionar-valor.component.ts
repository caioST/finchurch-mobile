import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FinanceService } from 'src/app/core/services/finance.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-adicionar-valor',
  templateUrl: './adicionar-valor.component.html',
  styleUrls: ['./adicionar-valor.component.scss'],
})
export class AdicionarValorComponent implements OnInit {
  colecao: string = '';
  categoriaId: string = '';
  subcategoriaId: string = '';

  // Campos do formulário
  tipo: string = 'entrada'; // Define o tipo padrão
  quantia: number = 0;
  data: Date = new Date(); // Data atual como padrão
  titulo: string = '';
  categoria: string = ''; // Categoria (ex.: Dízimos)
  mensagem: string = ''; // Mensagem opcional

  constructor(
    private financeService: FinanceService,
    private route: ActivatedRoute,
    private router: Router,
    private navController: NavController
  ) { }

  ngOnInit(): void {
    // Obtém os parâmetros de rota para vincular com a subcategoria
    this.route.params.subscribe((params) => {
      this.colecao = params['colecao'];
      this.categoriaId = params['categoriaId'];
      this.subcategoriaId = params['subcategoriaId'];
    });
  }

  async adicionarTransacao(): Promise<void> {
    try {
      const transacao = {
        tipo: this.tipo,
        quantia: this.quantia,
        data: this.data,
        titulo: this.titulo,
        categoria: this.categoria,
        mensagem: this.mensagem,
      };

      // Adiciona a transação no Firestore
      await this.financeService.addSubcategoriaValor(
        this.colecao,
        this.categoriaId,
        this.subcategoriaId,
        transacao
      );

      console.log('Transação adicionada com sucesso');

      // Redireciona para a página de resumo da subcategoria
      this.router.navigate([
        `/subcategoria/${this.colecao}/${this.categoriaId}/${this.subcategoriaId}`
      ]);
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
    }
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
}
