import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface Categoria {
  id: string;
  nome: string;
  tipo: string;
  quantia: number;
  icone?: string;
  subcategorias?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  constructor(private firestore: AngularFirestore) {}

  /**
   * Obtém categorias de uma coleção Firestore
   */
  getCategorias(colecao: string): Observable<Categoria[]> {
    return this.firestore
      .collection<Categoria>(colecao)
      .valueChanges({ idField: 'id' })
      .pipe(
        map((categorias) => categorias || []), // Garante que nunca retorne `null`
        catchError((error) => {
          console.error(`Erro ao obter categorias de ${colecao}:`, error);
          return of([]); // Retorna array vazio em caso de erro
        })
      );
  }

  /**
   * Obtém todas as subcategorias relacionadas a uma categoria
   */
getSubcategorias(categoriaId: string, colecao: string) {
  return this.firestore
    .collection(colecao)
    .doc(categoriaId)
    .collection('subcolecao')
    .valueChanges();
}


  /**
   * Obtém as transações de uma subcategoria específica
   */
  getTransacoes(colecao: string, categoriaId: string, subcategoriaId: string): Observable<any[]> {
    return this.firestore
      .collection(colecao)
      .doc(categoriaId)
      .collection('subcategorias')
      .doc(subcategoriaId)
      .collection('transacoes')
      .valueChanges({ idField: 'id' })
      .pipe(
        map((transacoes) => transacoes || []),
        catchError((error) => {
          console.error('Erro ao obter transações:', error);
          return of([]); // Retorna array vazio em caso de erro
        })
      );
  }

  /**
   * Adiciona uma nova categoria
   */
  adicionarCategoria(colecao: string, nome: string, subcategorias: string[]): Promise<void> {
    const categoria: Omit<Categoria, 'id'> = {
      nome,
      subcategorias,
      tipo: 'personalizada',
      quantia: 0,
    };

    return this.firestore
      .collection(colecao)
      .add(categoria)
      .then(() => {
        console.log('Categoria adicionada com sucesso.');
      })
      .catch((error) => {
        console.error('Erro ao adicionar categoria:', error);
        throw new Error(error);
      });
  }
}
