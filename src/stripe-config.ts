export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'subscription' | 'payment';
  price: number;
  currency: string;
  interval?: 'month' | 'year';
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_SZ3g1ykeQCtNu4',
    priceId: 'price_1RdvYo03xOQRAfiHLrCApNpF',
    name: 'Weekly Diet Planner App Standard Membership',
    description: 'Standard Membership unlocks the standard tier features of the Weekly Diet Planner App.',
    mode: 'subscription',
    price: 4.99,
    currency: 'usd',
    interval: 'month'
  },
  {
    id: 'prod_SXimRxxHi8UZxj',
    priceId: 'price_1RcdLK03xOQRAfiHl0sTMwqP',
    name: 'Weekly Diet Planner App Premium Membership',
    description: 'Premium Membership gives you access to all the features of ThymeTable',
    mode: 'subscription',
    price: 9.99,
    currency: 'usd',
    interval: 'month'
  }
];

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.priceId === priceId);
}

export function getProductById(id: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.id === id);
}