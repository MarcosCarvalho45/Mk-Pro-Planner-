import { Request, Response } from 'express';
import Stripe from 'stripe';
import User from '../models/user.model';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function stripeWebhook(req: Request, res: Response): Promise<any> {
  const sig = req.headers['stripe-signature'];
  if (!sig) {
    return res.status(400).send('Missing Stripe signature');
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.customer && session.subscription) {
          const user = await User.findOne({ stripeCustomerId: session.customer.toString() });
          if (user) {
            user.stripeSubscriptionId = session.subscription.toString();
            user.subscription = 'start'; // ajustar conforme planos
            await user.save();
          }
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        const user = await User.findOne({ stripeCustomerId: subscription.customer.toString() });
        if (user) {
          user.subscriptionStatus = subscription.status as any;
          user.subscriptionCurrentPeriodEnd = new Date((subscription as any).current_period_end * 1000);
          user.stripeSubscriptionId = subscription.id;
          await user.save();
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const user = await User.findOne({ stripeCustomerId: subscription.customer.toString() });
        if (user) {
          user.subscriptionStatus = 'canceled';
          await user.save();
        }
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return res.status(500).send('Internal Server Error');
  }

  res.status(200).json({ received: true });
}
