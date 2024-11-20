import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ResumoSubcategoriaComponent } from './resumo-categoria.component';

describe('ResumoCategoriaComponent', () => {
  let component: ResumoSubcategoriaComponent;
  let fixture: ComponentFixture<ResumoSubcategoriaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ResumoSubcategoriaComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ResumoSubcategoriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
