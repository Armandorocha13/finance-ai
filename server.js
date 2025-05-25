import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();

// Configuração do CORS mais específica
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8080'],
  credentials: true
}));
app.use(express.json());

app.post('/api/create-payment-intent', async (req, res) => {
  console.log('Recebida requisição para criar payment intent');
  
  try {
    // Criar um Customer
    console.log('Criando customer...');
    const customer = await stripe.customers.create();
    console.log('Customer criado:', customer.id);

    // Buscar o preço associado ao produto
    console.log('Buscando preços para o produto...');
    const prices = await stripe.prices.list({
      product: process.env.STRIPE_PRODUCT_ID,
      active: true,
      limit: 1,
    });
    console.log('Preços encontrados:', prices.data.length);

    if (!prices.data.length) {
      throw new Error('Nenhum preço encontrado para o produto');
    }

    const price = prices.data[0];
    console.log('Preço selecionado:', price.id);

    // Criar uma subscription
    console.log('Criando subscription...');
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price.id }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });
    console.log('Subscription criada:', subscription.id);

    if (!subscription.latest_invoice?.payment_intent?.client_secret) {
      throw new Error('Client secret não encontrado na subscription');
    }

    res.json({
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      subscriptionId: subscription.id,
    });
    console.log('Resposta enviada com sucesso');
  } catch (error) {
    console.error('Erro detalhado:', error);
    res.status(500).json({ 
      message: 'Erro ao processar pagamento',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log('Origens permitidas:', process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8080']);
}); 