import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';
import * as cors from 'cors';

admin.initializeApp();

const db = admin.firestore();
const corsMiddleware = cors({ origin: true }); // Configuração CORS

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'seu-email@gmail.com', // Substituir pelo e-mail
    pass: 'sua-senha', // Substituir pela senha do App Password
  },
});

// Gera um código aleatório de 6 dígitos
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Interface para os dados enviados
interface SendVerificationData {
  target: 'email' | 'phone';
  value: string;
}

interface VerifyCodeData {
  value: string;
  code: string;
}

// Função para enviar o código de verificação
export const sendVerificationCode = functions.https.onRequest((req, res) => {
  corsMiddleware(req, res, async () => {
    try {
      const { target, value } = req.body as SendVerificationData;

      if (!target || !value || (target !== 'email' && target !== 'phone')) {
        res.status(400).send({ error: 'Dados inválidos.' });
        return;
      }

      const code = generateCode();
      const expiration = Date.now() + 10 * 60 * 1000; // Expira em 10 minutos

      // Salva o código no Firestore com um ID único para evitar conflitos
      const verificationId = `${target}-${value}`;
      await db.collection('verificationCodes').doc(verificationId).set({ code, expiration });

      if (target === 'email') {
        // Envia o código por e-mail
        await transporter.sendMail({
          from: 'seu-email@gmail.com',
          to: value,
          subject: 'Código de Verificação',
          text: `Seu código de verificação é: ${code}\n\nEste código é válido por 10 minutos.`,
        });
      } else if (target === 'phone') {
        // Placeholder para envio de SMS
        console.log(`Enviar código SMS para: ${value} - Código: ${code}`);
      }

      res.status(200).send({ success: true, message: 'Código enviado com sucesso.' });
    } catch (error) {
      console.error('Erro ao enviar código de verificação:', error);
      res.status(500).send({ error: 'Erro ao enviar o código de verificação. Tente novamente mais tarde.' });
    }
  });
});

// Função para verificar o código de confirmação
export const verifyCode = functions.https.onRequest((req, res) => {
  corsMiddleware(req, res, async () => {
    try {
      const { value, code } = req.body as VerifyCodeData;

      if (!value || !code) {
        res.status(400).send({ error: 'Dados inválidos. Informe o valor e o código para verificação.' });
        return;
      }

      // Recupera o documento no Firestore com base no ID
      const verificationId = `email-${value}`;
      const record = await db.collection('verificationCodes').doc(verificationId).get();

      if (!record.exists) {
        res.status(404).send({ error: 'Código não encontrado.' });
        return;
      }

      const { code: storedCode, expiration } = record.data() as { code: string; expiration: number };

      // Verifica se o código expirou
      if (Date.now() > expiration) {
        res.status(400).send({ error: 'Código expirado.' });
        await db.collection('verificationCodes').doc(verificationId).delete(); // Remove código expirado
        return;
      }

      // Verifica se o código é válido
      if (code !== storedCode) {
        res.status(400).send({ error: 'Código inválido.' });
        return;
      }

      // Código válido, remove o registro do Firestore
      await db.collection('verificationCodes').doc(verificationId).delete();

      res.status(200).send({ success: true, message: 'Código validado com sucesso.' });
    } catch (error) {
      console.error('Erro ao verificar código de confirmação:', error);
      res.status(500).send({ error: 'Erro ao verificar o código. Tente novamente mais tarde.' });
    }
  });
});
