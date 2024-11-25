// src/app/services/finance.service.ts
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class FinanceService {
  private saldosSubject = new BehaviorSubject<any>(null);

  constructor(private firestore: AngularFirestore) { }

  /* Obtém categorias de uma coleção Firestore */
  getCategoriasFromFirestore(colecao: string): Observable<any[]> {
    return this.firestore
      .collection(colecao)
      .valueChanges({ idField: 'id' })
      .pipe(
        map((categorias) => categorias || []),
        catchError((error) => {
          console.error(`Erro ao obter categorias de ${colecao}:`, error);
          return of([]);
        })
      );
  }


  /* Método para obter detalhes de uma subcategoria */
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
      .collection(colecao)
      .doc(categoriaId)
      .collection('subcolecao')
      .doc(subcategoriaId)
      .valueChanges()
      .pipe(
        map((subcategoria: any) => ({
          valorMeta: subcategoria?.valorMeta ?? 0,
          economizado: subcategoria?.economizado ?? 0,
          nome: subcategoria?.nome ?? '',
          icone: subcategoria?.icone ?? '',
        }))
      );
  }

  addSubcategoriaValor(
    colecao: string,
    categoriaId: string,
    subcategoriaId: string,
    data: { tipo: string; quantia: number; data: Date; titulo: string; categoria: string; mensagem?: string }
  ): Promise<void> {
    // Referência para a subcategoria específica
    const docRefSubcategoria = this.firestore
      .collection(colecao)
      .doc(categoriaId)
      .collection('subcolecao')
      .doc(subcategoriaId)
      .collection('transacoes')
      .doc();

    // Referência para a categoria principal (transações gerais da categoria)
    const docRefCategoria = this.firestore
      .collection(colecao)
      .doc(categoriaId)
      .collection('transacoes')
      .doc();

    const transacao = {
      tipo: data.tipo,
      quantia: data.quantia,
      data: data.data,
      titulo: data.titulo,
      categoria: data.categoria,
      mensagem: data.mensagem || '',
    };

    // Adiciona a transação na subcategoria
    const promiseSubcategoria = docRefSubcategoria.set(transacao);

    // Adiciona a transação na categoria principal
    const promiseCategoria = docRefCategoria.set(transacao);

    // Retorna uma promise que resolve quando as duas transações foram adicionadas
    return Promise.all([promiseSubcategoria, promiseCategoria]).then(() => {
      console.log('Transação adicionada na subcategoria e na categoria com sucesso!');
    }).catch((error) => {
      console.error('Erro ao adicionar transação:', error);
    });
  }


  /* Método para obter todas as subcategorias */
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

  /* Método para calcular saldos de uma subcategoria */
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

  /* Método para obter todas as subcategorias de uma categoria */
  getSubcategoriasPorCategoria(colecao: string, categoriaId: string): Observable<any[]> {
    return this.firestore
      .collection(colecao)
      .doc(categoriaId)
      .collection('subcolecao')
      .valueChanges({ idField: 'id' });
  }


  /* Método para obter transações de uma subcategoria */
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

  /* Obtém o total de todas as transações */
  obterTotalTransacoes(): Observable<number> {
    return this.firestore
      .collection('transacoes')
      .valueChanges()
      .pipe(
        map((transacoes: any[]) =>
          transacoes.reduce(
            (total, transacao) =>
              total +
              (transacao.tipo === 'entrada' ? transacao.valor : -transacao.valor),
            0
          )
        ),
        catchError((error) => {
          console.error('Erro ao obter total de transações:', error);
          return of(0); // Retorna 0 no caso de erro
        })
      );
  }

  /* Obtém o histórico de todas as transações */
  obterHistoricoTransacoes(): Observable<any[]> {
    return this.firestore
      .collection('transacoes')
      .valueChanges()
      .pipe(
        map((transacoes: any[]) =>
          transacoes.map((transacao) => ({
            descricao: transacao.descricao || '',
            valor: transacao.valor || 0,
            data: transacao.data ? transacao.data.toDate() : null,
            tipo: transacao.tipo || 'indefinido',
          }))
        ),
        catchError((error) => {
          console.error('Erro ao obter histórico de transações:', error);
          return of([]); // Retorna lista vazia no caso de erro
        })
      );
  }

}
