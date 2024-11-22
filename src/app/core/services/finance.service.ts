// src/app/services/finance.service.ts
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class FinanceService {
  constructor(private firestore: AngularFirestore) { }

  /**
 * Obtém categorias de uma coleção Firestore
 */
  getCategoriasFromFirestore(colecao: string): Observable<any[]> {
    return this.firestore
      .collection(colecao)
      .valueChanges({ idField: 'id' })
      .pipe(
        map((categorias) => categorias || []), // Garante que nunca retorne `null`
        catchError((error) => {
          console.error(`Erro ao obter categorias de ${colecao}:`, error);
          return of([]); // Retorna array vazio em caso de erro
        })
      );
  }

  // Método para obter detalhes de uma subcategoria
  getSubcategoriaDetalhes(
    colecao: string,
    categoriaId: string,
    subcategoriaId: string
  ): Observable<{
    valorMeta: number;
    economizado: number;
    nome: string;
    icone: string;
  }> {
    return this.firestore
      .collection(colecao) // Coleção principal
      .doc(categoriaId) // Documento da categoria
      .collection('subcolecao') // Subcoleção
      .doc(subcategoriaId) // Documento da subcategoria
      .valueChanges()
      .pipe(
        map((subcategoria: any) => ({
          valorMeta: subcategoria?.valorMeta ?? 0, // Meta financeira da subcategoria
          economizado: subcategoria?.economizado ?? 0, // Valor economizado
          nome: subcategoria?.nome ?? '', // Nome da subcategoria
          icone: subcategoria?.icone ?? '', // Ícone associado
        }))
      );
  }

  addSubcategoriaValor(
    colecao: string,
    categoriaId: string,
    subcategoriaId: string,
    data: { tipo: string; quantia: number; data: Date; titulo: string; categoria: string; mensagem?: string }
  ): Promise<void> {
    const docRef = this.firestore
      .collection(colecao) // Coleção principal
      .doc(categoriaId) // Documento da categoria
      .collection('subcolecao') // Subcoleção
      .doc(subcategoriaId) // Documento da subcategoria
      .collection('transacoes') // Subcoleção de transações
      .doc(); // Novo documento para a transação

    const transacao = {
      tipo: data.tipo,
      quantia: data.quantia,
      data: data.data,
      titulo: data.titulo,
      categoria: data.categoria,
      mensagem: data.mensagem || '', // Valor padrão para mensagem
    };

    return docRef.set(transacao); // Salva a transação no Firestore
  }


  // Método para obter todas as subcategorias
  getAllSubcategorias(): Observable<any[]> {
    const colecoes = ['receitas', 'despesas', 'campanhas', 'departamentos'];
    const observables = colecoes.map((colecao) =>
      this.firestore
        .collection(colecao)
        .get()
        .pipe(
          switchMap((snapshot) =>
            forkJoin(
              snapshot.docs.map((doc) =>
                this.firestore
                  .collection(colecao)
                  .doc(doc.id)
                  .collection('subcolecao')
                  .get()
                  .pipe(
                    map((subSnapshot) =>
                      subSnapshot.docs.map((subDoc) => ({
                        id: subDoc.id,
                        ...subDoc.data(),
                        categoriaId: doc.id,
                        colecao,
                      }))
                    ),
                    catchError(() => of([]))
                  )
              )
            )
          ),
          map((subcategoriasPorCategoria) => subcategoriasPorCategoria.flat()),
          catchError(() => of([]))
        )
    );

    return forkJoin(observables).pipe(
      map((subcategoriasPorColecao) => subcategoriasPorColecao.flat())
    );
  }

  // Novo método para calcular saldos de uma subcategoria
  calcularSaldos(
    colecao: string,
    categoriaId: string,
    subcategoriaId: string
  ): Observable<{ entradas: number; saidas: number }> {
    return this.getSubcategoriaTransacoes(colecao, categoriaId, subcategoriaId).pipe(
      map((transacoes) => {
        const entradas = transacoes
          .filter((transacao) => transacao.tipo === 'entrada' && transacao.quantia > 0)
          .reduce((total, transacao) => total + transacao.quantia, 0);

        const saidas = transacoes
          .filter((transacao) => transacao.tipo === 'saida' && transacao.quantia > 0)
          .reduce((total, transacao) => total + transacao.quantia, 0);

        return { entradas, saidas };
      })
    );
  }

  // Método para calcular o saldo total de uma categoria (soma de todos os saldos das subcategorias)
  calcularSaldoCategoria(colecao: string, categoriaId: string): Observable<{ entradas: number; saidas: number }> {
    return this.getSubcategoriasFromCategoria(colecao, categoriaId).pipe(
      switchMap((subcategorias) => {
        const saldos$ = subcategorias.map((subcategoria) =>
          this.calcularSaldos(colecao, categoriaId, subcategoria.id) // Calcular o saldo de cada subcategoria
        );
        return forkJoin(saldos$).pipe(
          map((saldos) => {
            const entradasTotal = saldos.reduce((total, saldo) => total + saldo.entradas, 0);
            const saidasTotal = saldos.reduce((total, saldo) => total + saldo.saidas, 0);
            console.log('Entradas totais: ', entradasTotal);
            console.log('Saídas totais: ', saidasTotal);
            return { entradas: entradasTotal, saidas: saidasTotal };
          })
        );
      })
    );
  }

  // Método auxiliar para obter todas as subcategorias de uma categoria
  getSubcategoriasFromCategoria(colecao: string, categoriaId: string): Observable<any[]> {
    return this.firestore
      .collection(colecao)
      .doc(categoriaId)
      .collection('subcolecao')
      .valueChanges({ idField: 'id' });
  }




  // Método para obter transações de uma subcategoria
// Verifique também o método que retorna as transações:
getSubcategoriaTransacoes(colecao: string, categoriaId: string, subcategoriaId: string): Observable<any[]> {
  return this.firestore
    .collection(colecao)
    .doc(categoriaId)
    .collection('subcolecao')
    .doc(subcategoriaId)
    .collection('transacoes')
    .valueChanges()
    .pipe(
      map(transacoes => {
        console.log('Transações encontradas:', transacoes); // Log para debugar as transações
        return transacoes;
      })
    );
}

}
