import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RelatoriosPageRoutingModule } from './relatorios-routing.module';
import { RelatoriosPage } from './relatorios.page';
import { FileOpener } from '@ionic-native/file-opener/ngx'; // Importar o FileOpener

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RelatoriosPageRoutingModule
  ],
  declarations: [RelatoriosPage],
  providers: [FileOpener] // Adicionar como provider
})
export class RelatoriosPageModule {}
