import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FingerprintAuthenticationPageRoutingModule } from './fingerprint-authentication-routing.module';

import { FingerprintAuthenticationPage } from './fingerprint-authentication.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FingerprintAuthenticationPageRoutingModule
  ],
  declarations: [FingerprintAuthenticationPage]
})
export class FingerprintAuthenticationPageModule {}
