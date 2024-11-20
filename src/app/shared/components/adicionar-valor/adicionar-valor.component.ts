import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FinanceService } from 'src/app/core/services/finance.service';

@Component({
  selector: 'app-adicionar-valor',
  templateUrl: './adicionar-valor.component.html',
  styleUrls: ['./adicionar-valor.component.scss'],
})
export class AdicionarValorComponent implements OnInit {
  colecao: string = '';
  categoriaId: string = '';
  subcategoriaId: string = '';
  
  valor: { 
    data: string; 
    titulo: string; 
    quantia: number; 
    mensagem?: string; 
  } = {
    data: '',
    titulo: '',
    quantia: 0,
    mensagem: '',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private financeService: FinanceService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.colecao = params['colecao'] ?? '';
      this.categoriaId = params['categoriaId'] ?? '';
      this.subcategoriaId = params['subcategoriaId'] ?? '';
    });
  }

  salvarValor(): void {
    // Validação básica
    if (!this.valor.data || !this.valor.titulo || this.valor.quantia <= 0) {
      alert('Por favor, preencha todos os campos obrigatórios!');
      return;
    }
  
    const dados = {
      tipo: this.valor.titulo, // Mapeia o título para o "tipo"
      quantia: this.valor.quantia,
      data: new Date(this.valor.data), // Converte string para Date
    };
  
    this.financeService
      .addSubcategoriaValor(this.colecao, this.categoriaId, this.subcategoriaId, dados)
      .then(() => {
        alert('Valor adicionado com sucesso!');
        this.router.navigate([
          `/subcategoria/${this.colecao}/${this.categoriaId}/${this.subcategoriaId}`,
        ]);
      })
      .catch((error) => {
        console.error('Erro ao adicionar valor:', error);
        alert('Erro ao adicionar o valor. Tente novamente mais tarde.');
      });
  }
}
