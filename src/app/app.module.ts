import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser'; 
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio/ngx';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';



// Firebase modules
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore'; // Importando o Firestore
import { environment } from '../environments/environment';

import { TermsModalComponent } from './shared/components/terms-modal/terms-modal.component';
import { CategoriasComponent } from './shared/components/categorias/categorias.component';
import { FinanceService } from './core/services/finance.service';
import { ErrorHandler } from './core/services/error-handler.service';
import { SubcategoriasComponent } from './shared/components/subcategorias/subcategorias.component';
import { ResumoSubcategoriaComponent } from './shared/components/resumo-categoria/resumo-categoria.component';
import { AdicionarValorComponent } from './shared/components/adicionar-valor/adicionar-valor.component';


@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    AppComponent,
    TermsModalComponent,
    CategoriasComponent,
    SubcategoriasComponent,
    AdicionarValorComponent,
    ResumoSubcategoriaComponent,
  ],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,
    FormsModule,
    HttpClientModule,
    RouterModule
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, FingerprintAIO, FinanceService, ErrorHandler],
  bootstrap: [AppComponent],
})
export class AppModule {}
