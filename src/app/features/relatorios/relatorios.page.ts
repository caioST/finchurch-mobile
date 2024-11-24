import { Component, OnInit } from '@angular/core';
import { RelatorioService } from 'src/app/core/services/relatorio.service';
import { FinanceService } from 'src/app/core/services/finance.service';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { Plugins } from '@capacitor/core'; // Para gerenciar permissões
const { Permissions } = Plugins;

@Component({
  selector: 'app-relatorios',
  templateUrl: './relatorios.page.html',
  styleUrls: ['./relatorios.page.scss'],
})
export class RelatoriosPage implements OnInit {
  subcategorias: any[] = [];
  showToast: boolean = false; // Variável para controlar o toast de sucesso

  constructor(
    private relatorioService: RelatorioService,
    private financeService: FinanceService,
    private fileOpener: FileOpener
  ) {}

  async ngOnInit() {
    // Solicitar permissões de armazenamento no início
    await this.solicitarPermissaoArmazenamento();

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
          this.relatorioService.enviarRelatorioParaSheets(transacoes).subscribe({
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
    const header = ['Categoria', 'Data', 'Mensagem', 'Quantia', 'Tipo', 'Título']; // Cabeçalhos
    const rows = transactions.map((transaction) => [
      transaction.categoria || '',
      transaction.data || '',
      transaction.mensagem || '',
      transaction.quantia || 0,
      transaction.tipo || '',
      transaction.titulo || '',
    ]);

    // Junta os dados em formato CSV
    const csvContent = [header, ...rows].map((row) => row.join(',')).join('\n');
    console.log('Conteúdo do CSV gerado:', csvContent); // Log do conteúdo
    return csvContent;
  }

  baixarCSV(csvContent: string) {
    const filename = 'relatorio.csv';

    Filesystem.writeFile({
      path: filename,
      data: csvContent,
      directory: Directory.Documents, // Diretório seguro
      encoding: Encoding.UTF8,
    })
      .then(async (writeResult) => {
        alert('Relatório salvo com sucesso!');
        console.log('Relatório salvo no caminho:', writeResult.uri);

        // Obter o URI completo do arquivo
        const uri = await Filesystem.getUri({
          path: filename,
          directory: Directory.Documents,
        });

        console.log('URI do arquivo salvo:', uri.uri);

        // Abrir o arquivo
        await this.abrirArquivo(uri.uri);
      })
      .catch((error) => {
        console.error('Erro ao salvar o arquivo:', error);
        alert('Falha ao salvar o relatório.');
      });
  }

  async abrirArquivo(fileUri: string) {
    try {
      await this.fileOpener.open(fileUri, 'text/csv'); // Abrir o arquivo CSV
      console.log('Arquivo CSV aberto com sucesso!');
    } catch (error) {
      console.error('Erro ao abrir o arquivo:', error);
      alert('Não foi possível abrir o arquivo. Verifique se você tem um leitor de CSV instalado.');
    }
  }

  async solicitarPermissaoArmazenamento() {
    const result = await Permissions['request']({ name: 'WRITE_EXTERNAL_STORAGE' });
    if (result.state !== 'granted') {
      alert('Permissão para acessar o armazenamento foi negada.');
    } else {
      console.log('Permissão para armazenamento concedida.');
    }
  }
}
