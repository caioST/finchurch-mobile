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


  /* Adiciona uma transação e atualiza os totais em categorias e subcategorias */
  addSubcategoriaValor(
    colecao: string,
    categoriaId: string,
    subcategoriaId: string,
    data: { tipo: string; quantia: number; data: Date; titulo: string; categoria: string; mensagem?: string }
  ): Promise<void> {
    const transacao = {
      tipo: data.tipo,
      quantia: data.quantia,
      data: data.data,
      titulo: data.titulo,
      categoria: data.categoria,
      mensagem: data.mensagem || '',
    };

    // Referências no Firestore
    const docRefSubcategoria = this.firestore
      .collection(colecao)
      .doc(categoriaId)
      .collection('subcolecao')
      .doc(subcategoriaId)
      .collection('transacoes')
      .doc();

    const docRefCategoria = this.firestore
      .collection(colecao)
      .doc(categoriaId);

    const docRefSubcategoriaTotais = this.firestore
      .collection(colecao)
      .doc(categoriaId)
      .collection('subcolecao')
      .doc(subcategoriaId);

    // Adiciona a transação à subcategoria
    const promiseTransacao = docRefSubcategoria.set(transacao);

    // Atualiza os totais na subcategoria
    const promiseAtualizarSubcategoria = docRefSubcategoriaTotais.get().pipe(
      switchMap((snapshot) => {
        const dadosExistentes = snapshot.data() || { total: 0 };
        const novoTotal =
          data.tipo === 'entrada'
            ? dadosExistentes['total'] + data.quantia
            : dadosExistentes['total'] - data.quantia;

        return docRefSubcategoriaTotais.update({ total: novoTotal });
      })
    ).toPromise();

const promiseAtualizarCategoria = docRefCategoria.get().pipe(
  switchMap((snapshot) => {
    // Garante que 'dadosExistentes' sempre tenha 'total'
    const dadosExistentes = snapshot.data() as { total: number } || { total: 0 };

    // Calcula o novo total com base no tipo de transação
    const novoTotal =
      data.tipo === 'entrada'
        ? dadosExistentes.total + data.quantia
        : dadosExistentes.total - data.quantia;

    // Atualiza o total no documento da categoria
    return docRefCategoria.update({ total: novoTotal });
  })
).toPromise();


    // Retorna uma promise combinada
    return Promise.all([
      promiseTransacao,
      promiseAtualizarSubcategoria,
      promiseAtualizarCategoria,
    ]).then(() => {
      console.log('Transação adicionada com sucesso, totais atualizados.');
    }).catch((error) => {
      console.error('Erro ao adicionar transação:', error);
    });
  }

  /* Calcula totais por categoria somando subcategorias */
  calcularTotaisPorCategoria(colecao: string, categoriaId: string): Observable<number> {
    return this.firestore
      .collection(colecao)
      .doc(categoriaId)
      .collection('subcolecao')
      .valueChanges()
      .pipe(
        map((subcategorias: any[]) => 
          subcategorias.reduce((total, sub) => total + (sub.total || 0), 0)
        )
      );
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
