import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FingerprintAuthenticationPage } from './fingerprint-authentication.page';

describe('FingerprintAuthenticationPage', () => {
  let component: FingerprintAuthenticationPage;
  let fixture: ComponentFixture<FingerprintAuthenticationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FingerprintAuthenticationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
