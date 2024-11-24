import { Component, OnInit } from '@angular/core';
import { RelatorioService } from 'src/app/core/services/relatorio.service';
import { FinanceService } from 'src/app/core/services/finance.service';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { FileOpener } from '@ionic-native/file-opener/ngx';  // Importar o FileOpener
import { NavController } from '@ionic/angular';
import { Plugins } from '@capacitor/core';
const { Permissions } = Plugins;


@Component({
  selector: 'app-relatorios',
  templateUrl: './relatorios.page.html',
  styleUrls: ['./relatorios.page.scss'],
})
export class RelatoriosPage implements OnInit {
  subcategorias: any[] = [];
  showToast: boolean = false;

  constructor(
    private relatorioService: RelatorioService,
    private financeService: FinanceService,
    private fileOpener: FileOpener, // Adicionando o FileOpener
    private navController: NavController
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
    // Cabeçalho com os nomes das colunas
    const header = ['Categoria', 'Data', 'Mensagem', 'Quantia', 'Tipo', 'Título'];
  
    // Convertendo os dados de cada transação em uma linha do CSV
    const rows = transactions.map(transaction => [
      transaction.categoria || '',         // Categoria
      this.formatDate(transaction.data),   // Formatar data
      transaction.mensagem || '',          // Mensagem
      this.formatNumber(transaction.quantia), // Quantia
      transaction.tipo || '',              // Tipo
      transaction.titulo || '',            // Título
    ]);
  
    // Usando ponto e vírgula como separador
    const csvContent = [
      header.join(';'), // Adiciona o cabeçalho
      ...rows.map(row => row.join(';')) // Adiciona as linhas de dados
    ].join('\n'); // As linhas são unidas por quebra de linha
  
    // Adicionando o BOM no início do conteúdo CSV
    const bom = '\uFEFF'; // BOM UTF-8
    return bom + csvContent; // Retorna o conteúdo CSV com BOM
  } 

  // Função para formatar a data para o padrão correto
  formatDate(date: string | Date): string {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`; // Formato: YYYY-MM-DD
  }

  // Função para garantir que os números sejam formatados corretamente
  formatNumber(value: any): string {
    if (typeof value === 'number') {
      return value.toFixed(2); // Se for número, formatar com duas casas decimais
    }
    return value.toString(); // Caso contrário, retornar como string
  }

  async solicitarPermissaoArmazenamento() {
    const result = await Permissions['request']({ name: 'MANAGE_EXTERNAL_STORAGE' });
    if (result.state !== 'granted') {
      alert('Permissão para acessar o armazenamento foi negada.');
    }
  }

  baixarCSV(csvContent: string) {
    const filename = `relatorio_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;


    // Criar o arquivo no diretório "Documents"
    Filesystem.writeFile({
      path: filename,
      data: csvContent,
      directory: Directory.Documents, // Diretório confiável e acessível
      encoding: Encoding.UTF8,
    })
      .then(async (writeResult) => {
        alert('Relatório salvo com sucesso!');
        console.log('Relatório salvo:', writeResult.uri);

        // Obter o URI completo para o arquivo
        const fileUri = await Filesystem.getUri({
          path: filename,
          directory: Directory.Documents,
        });

        console.log('URI do arquivo gerado:', fileUri.uri);

        // Abrir o arquivo após salvar
        await this.abrirArquivo(fileUri.uri);
      })
      .catch((error) => {
        console.error('Erro ao salvar o arquivo:', error);

        // Tratar o erro detalhadamente
        if (error instanceof Error) {
          alert(`Falha ao salvar o relatório. Detalhes: ${error.message}`);
        } else {
          alert(`Falha ao salvar o relatório. Detalhes: ${JSON.stringify(error)}`);
        }
      });
  }

  async abrirArquivo(fileUri: string) {
    try {
      // Abrir o arquivo com o FileOpener
      await this.fileOpener.open(fileUri, 'text/csv');
      console.log('Arquivo CSV aberto com sucesso!');
    } catch (error) {
      console.error('Erro ao abrir o arquivo:', error);

      // Tratar erros detalhadamente
      const mensagemErro =
        error instanceof Error ? error.message : JSON.stringify(error);
      alert(`Não foi possível abrir o arquivo. Detalhes: ${mensagemErro}`);
    }
  }

  perfil(): void {
    this.navController.navigateBack(['/profile']);
  }


}