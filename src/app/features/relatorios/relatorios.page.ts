import { Component, OnInit } from '@angular/core';
import { RelatorioService } from 'src/app/core/services/relatorio.service';
import { FinanceService } from 'src/app/core/services/finance.service';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { FileOpener } from '@ionic-native/file-opener/ngx';


@Component({
  selector: 'app-relatorios',
  templateUrl: './relatorios.page.html',
  styleUrls: ['./relatorios.page.scss'],
})
export class RelatoriosPage implements OnInit {
  subcategorias: any[] = [];
  showToast: boolean = false;  // Variável para controlar o toast de sucesso

  constructor(
    private relatorioService: RelatorioService,
    private financeService: FinanceService,
    private fileOpener: FileOpener  // Adicionando o FileOpener
  ) { }

  ngOnInit() {
    // Carregar todas as subcategorias
    this.financeService.getAllSubcategorias().subscribe({
      next: (data) => (this.subcategorias = data),
      error: (err) => console.error('Erro ao carregar subcategorias:', err),
    });
  }

  gerarRelatorio(subcategoria: any) {
    const { colecao, categoriaId, id: subcategoriaId } = subcategoria;

    this.relatorioService
      .getSubcategoriaTransacoes(colecao, categoriaId, subcategoriaId)
      .subscribe({
        next: (transacoes) => {
          if (!transacoes || transacoes.length === 0) {
            alert('Nenhuma transação encontrada para esta subcategoria.');
            return;
          }

          // Enviar o relatório para o SheetDB
          this.relatorioService
            .enviarRelatorioParaSheets(transacoes)
            .subscribe({
              next: (response) => {
                console.log('Relatório enviado com sucesso:', response);
                alert('Relatório enviado com sucesso!');

                // Gerar e permitir o download do arquivo CSV
                const csvContent = this.generateCSV(transacoes);
                this.baixarCSV(csvContent);

                // Exibir o toast de sucesso
                this.showToast = true;
              },
              error: (err) => {
                console.error('Erro ao enviar relatório para o SheetDB:', err);
                alert('Falha ao enviar relatório. Verifique os logs.');
              },
            });
        },
        error: (err) => console.error('Erro ao carregar transações:', err),
      });
  }

  generateCSV(transactions: any[]): string {
    const header = ['Categoria', 'Data', 'Mensagem', 'Quantia', 'Tipo', 'Título']; // Defina o cabeçalho
    const rows = transactions.map(transaction => [
      transaction.categoria || '',
      transaction.data || '',
      transaction.mensagem || '',
      transaction.quantia || 0,
      transaction.tipo || '',
      transaction.titulo || ''
    ]);

    // Junta os dados em formato CSV
    const csvContent = [header, ...rows].map(row => row.join(',')).join('\n');
    console.log('Conteúdo do CSV gerado:', csvContent);  // Log do conteúdo do CSV
    return csvContent;
  }

  baixarCSV(csvContent: string) {
    const filename = `relatorio_${new Date().toISOString()}.csv`;

    Filesystem.writeFile({
      path: `documents/${filename}`,
      data: csvContent,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    })
      .then(async (writeResult) => {
        alert('Relatório salvo com sucesso!');
        console.log('Relatório salvo:', writeResult.uri);
        // Abrir o arquivo após salvá-lo
        await this.abrirArquivo(writeResult.uri);
      })
      .catch((error) => {
        // Verificando explicitamente o tipo de erro
        if (error instanceof Error) {
          console.error('Erro ao salvar o arquivo:', error.message);
          alert(`Falha ao salvar o relatório. Detalhes: ${error.message}`);
        } else {
          console.error('Erro desconhecido ao salvar o arquivo:', error);
          alert('Ocorreu um erro desconhecido ao tentar salvar o arquivo.');
        }
      });
  }

  async abrirArquivo(fileUri: string) {
    try {
      await this.fileOpener.open(fileUri, 'text/csv');
      console.log('Arquivo CSV aberto com sucesso!');
    } catch (error) {
      // Verificando explicitamente o tipo de erro
      if (error instanceof Error) {
        console.error('Erro ao abrir o arquivo:', error.message);
        alert(`Não foi possível abrir o arquivo. Detalhes: ${error.message}`);
      } else {
        console.error('Erro desconhecido ao abrir o arquivo:', error);
        alert('Ocorreu um erro desconhecido ao tentar abrir o arquivo.');
      }
    }
  }


}