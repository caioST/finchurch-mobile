import { Component, OnInit } from '@angular/core';
import { RelatorioService } from 'src/app/core/services/relatorio.service';
import { FinanceService } from 'src/app/core/services/finance.service';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { FileOpener } from '@ionic-native/file-opener/ngx';  // Importar o FileOpener

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
    return csvContent;
  }

  baixarCSV(csvContent: string) {
    const filename = 'relatorio.csv';

    // Salvar o arquivo no armazenamento público
    Filesystem.writeFile({
      path: filename,
      data: csvContent,
      directory: Directory.ExternalStorage,  // Salvar no armazenamento externo
      encoding: Encoding.UTF8,
    })
      .then(async () => {
        alert('Relatório salvo com sucesso!');
        // Após salvar o arquivo, abrir automaticamente
        await this.abrirArquivo(filename);
      })
      .catch((error) => {
        console.error('Erro ao salvar o arquivo:', error);
        alert('Falha ao salvar o relatório.');
      });
  }

  // Função para abrir o arquivo salvo
  async abrirArquivo(filename: string) {
    try {
      const filePath = '/storage/emulated/0/' + filename;  // Caminho do arquivo no armazenamento
      await this.fileOpener.open(filePath, 'application/csv');  // Abrir o arquivo
      console.log('Arquivo aberto com sucesso!');
    } catch (e) {
      console.error('Erro ao abrir o arquivo:', e);
      alert('Não foi possível abrir o arquivo.');
    }
  }
}
