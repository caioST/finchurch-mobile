import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ToastController, NavController, ModalController } from '@ionic/angular';
import { FormBuilder, Validators } from '@angular/forms';
import { TermsModalComponent } from 'src/app/shared/components/terms-modal/terms-modal.component';
import { ErrorHandler } from 'src/app/core/services/error-handler.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss']
})
export class RegisterPage {
  // Variáveis para armazenar os dados do formulário de registro
  fullName: string = ''; // Nome completo do usuário
  cpf: string = ''; // CPF do usuário
  email: string = ''; // E-mail do usuário
  phone: string = ''; // Telefone do usuário
  birthDate: string = ''; // Data de nascimento do usuário
  password: string = ''; // Senha do usuário
  confirmPassword: string = ''; // Confirmação da senha
  termsAccepted: boolean = false; // Variável para verificar se os termos foram aceitos

  // Formulário de registro
  registerForm = this.formBuilder.group({
    fullName: ['', Validators.required],
    cpf: ['', [Validators.required, this.cpfValidator]],
    email: ['', [Validators.required, Validators.email, this.emailValidator]],
    phone: ['', [Validators.required, this.phoneValidator]],
    birthDate: ['', Validators.required],
    password: ['', [Validators.required, this.passwordValidator]],
    confirmPassword: ['', [Validators.required, this.confirmPasswordValidator]]
  });

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private errorHandler: ErrorHandler,
  ) { }

  // Método assíncrono para registrar um novo usuário
  async register() {
    if (!this.termsAccepted) {
      const toast = await this.toastCtrl.create({
        message: 'Você precisa aceitar os Termos de Uso antes de continuar.',
        duration: 2000,
        color: 'danger'
      });
      toast.present();
      return;
    }

    if (!this.registerForm.valid) {
      const toast = await this.toastCtrl.create({
        message: 'Por favor, preencha todos os campos corretamente.',
        duration: 2000,
        color: 'danger'
      });
      toast.present();
      return;
    }

    const email = this.registerForm.get('email')?.value as string;
    const password = this.registerForm.get('password')?.value as string;
    const fullName = this.registerForm.get('fullName')?.value as string;
    const cpf = this.registerForm.get('cpf')?.value as string;
    const phone = this.registerForm.get('phone')?.value as string;
    const birthDate = this.registerForm.get('birthDate')?.value as string;

    try {
      // Criando o usuário no Authentication
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(email, password);

      // Salvando os dados adicionais no Firestore
      await this.firestore.collection('usuarios').doc(userCredential.user?.uid).set({
        fullName: fullName,
        cpf: cpf,
        email: email,
        phone: phone,
        birthDate: birthDate,
        createdAt: new Date().toISOString()
      });

      const toast = await this.toastCtrl.create({
        message: 'Conta criada com sucesso!',
        duration: 2000,
        color: 'success'
      });
      toast.present();

      this.navCtrl.navigateForward('/fingerprint-authentication');

    } catch (error) {
      this.errorHandler.handleError(error);
    }
  }


  // Método para redirecionar para a página de login
  goToLogin() {
    this.navCtrl.navigateForward('/login', {
      animated: true,
      animationDirection: 'forward'
    });
  }

  // Método assíncrono para abrir o modal de termos de uso
  async openTermsModal() {
    const modal = await this.modalCtrl.create({
      component: TermsModalComponent,
    });

    modal.onDidDismiss().then((data) => {
      if (data.data && data.data.accepted) {
        this.termsAccepted = true; // Define como aceito se os termos foram aceitos
      }
    });

    await modal.present();
  }

  // Validador de CPF
  cpfValidator(control: any) {
    const cpf = control.value;
    if (!cpf) {
      return null;
    }
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/; // Validação de formato de CPF
    if (!cpfRegex.test(cpf)) {
      return { cpfInvalid: true };
    }
    return null;
  }

  // Validador de telefone
  phoneValidator(control: any) {
    const phone = control.value;
    if (!phone) {
      return null;
    }
    const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$|^\(\d{2}\) \d{4}-\d{4}$/;
    if (!phoneRegex.test(phone)) {
      return { phoneInvalid: true };
    }
    return null;
  }

  // Validador de e-mail
  emailValidator(control: any) {
    const email = control.value;
    if (!email) {
      return null; // Se o campo de e-mail estiver vazio, não aplica validação
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return { emailInvalid: true }; // Retorna erro se o e-mail não for válido
    }
    return null; // Retorna null se o e-mail for válido
  }

  // Validador de senha
  passwordValidator(control: any) {
    const password = control.value;
    if (!password) {
      return null;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]{6,}$/;
    if (!passwordRegex.test(password)) {
      return { passwordInvalid: true };
    }
    return null;
  }

  // Validador de confirmação de senha
  confirmPasswordValidator(control: any) {
    const confirmPassword = control.value; // Valor do campo de confirmação de senha
    const password = control.parent?.get('password')?.value; // Valor do campo de senha

    if (!confirmPassword) {
      return null; // Se o campo de confirmação de senha estiver vazio, não aplica validação
    }
    if (confirmPassword !== password) {
      return { confirmPasswordInvalid: true }; // Retorna erro se as senhas não coincidirem
    }
    return null; // Retorna null se tudo estiver correto
  }
}
