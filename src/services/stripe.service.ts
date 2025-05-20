import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export async function criarProduto(name: string, description?: string) {
  return await stripe.products.create({ name, description });
}

export async function criarPlano(
  productId: string,
  amount: number,
  interval: 'month' | 'year'
) {
  return await stripe.prices.create({
    product: productId,
    unit_amount: amount,
    currency: 'usd',
    recurring: {
      interval,
    },
  });
}

export async function criarCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  return await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      }
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

export async function criarCliente(email: string) {
  return await stripe.customers.create({ email });
}
