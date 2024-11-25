import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RelatorioService {
  private sheetDBUrl = 'https://sheetdb.io/api/v1/5zbuooam55eky'; // Substitua com seu ID de planilha do SheetDB

  constructor(private http: HttpClient, private firestore: AngularFirestore) {}

  // Obtém as transações de uma subcategoria
  getSubcategoriaTransacoes(
    colecao: string,
    categoriaId: string,
    subcategoriaId: string
  ): Observable<any[]> {
    return this.firestore
      .collection(colecao)
      .doc(categoriaId)
      .collection('subcolecao')
      .doc(subcategoriaId)
      .collection('transacoes')
      .valueChanges();
  }

  // Enviar relatório para o SheetDB
  enviarRelatorioParaSheets(transacoes: any[]) {
    const payload = transacoes.map((t) => ({
      categoria: t.categoria || '',
      data: t.data || '',
      mensagem: t.mensagem || '',
      quantia: t.quantia || 0,
      tipo: t.tipo || '',
      titulo: t.titulo || ''
    }));
  
    console.log('Payload para envio:', JSON.stringify({ data: payload }, null, 2)); // Verificar payload
  
    return this.http.post(this.sheetDBUrl, { data: payload });
  }

  // Gerar o CSV e retornar o conteúdo
  gerarCSV(transacoes: any[]) {
    const headers = ['Categoria', 'Data', 'Mensagem', 'Quantia', 'Tipo', 'Titulo']; // Cabeçalhos das colunas
    const rows = transacoes.map((t) => [t.categoria, t.data, t.mensagem, t.quantia, t.tipo, t.titulo]);

    let csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n';

    rows.forEach((row) => {
      csvContent += row.join(',') + '\n';
    });

    return csvContent;
  }
}
