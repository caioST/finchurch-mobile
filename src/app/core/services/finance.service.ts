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
   * Obtém todas as subcategorias de várias coleções
   */
  getAllSubcategorias(): Observable<any[]> {
    const colecoes = ['receitas', 'despesas', 'campanhas', 'departamentos'];

    // Para cada coleção, carrega subcategorias de todos os documentos
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
                    catchError((error) => {
                      console.error(`Erro ao carregar subcoleção de ${colecao}/${doc.id}:`, error);
                      return of([]);
                    })
                  )
              )
            )
          ),
          map((subcategoriasPorCategoria) => subcategoriasPorCategoria.flat()),
          catchError((error) => {
            console.error(`Erro ao carregar dados da coleção ${colecao}:`, error);
            return of([]);
          })
        )
    );

    return forkJoin(observables).pipe(
      map((subcategoriasPorColecao) => subcategoriasPorColecao.flat())
    );
  }



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
      .doc(categoriaId) // Documento principal
      .collection('subcolecao') // Subcoleção
      .doc<{ valorMeta: number; economizado: number; nome: string; icone: string }>(subcategoriaId) // Documento esperado
      .valueChanges()
      .pipe(
        map((subcategoria) => {
          // Adiciona valores padrão caso as propriedades estejam ausentes
          return {
            valorMeta: subcategoria?.valorMeta ?? 0,
            economizado: subcategoria?.economizado ?? 0,
            nome: subcategoria?.nome ?? '',
            icone: subcategoria?.icone ?? '',
          };
        })
      );
  }



  getSubcategoriaTransacoes(colecao: string, categoriaId: string, subcategoriaId: string): Observable<any[]> {
    return this.firestore
      .collection(colecao) // Coleção principal
      .doc(categoriaId) // Documento principal
      .collection('subcolecao') // Subcoleção
      .doc(subcategoriaId) // Documento da subcategoria
      .collection('transacoes') // Subcoleção das transações
      .valueChanges();
  }

  addSubcategoriaValor(
    colecao: string,
    categoriaId: string,
    subcategoriaId: string,
    data: { tipo: string; quantia: number; data: Date }
  ): Promise<void> {
    const docRef = this.firestore
      .collection(colecao) // Coleção dinâmica
      .doc(categoriaId) // Documento principal
      .collection('subcolecao') // Subcoleção
      .doc(subcategoriaId) // Subcategoria específica
      .collection('transacoes') // Transações
      .doc(); // Novo documento de transação

    return docRef.set(data); // Salva os dados fornecidos
  }
}
