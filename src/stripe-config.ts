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
    name: 'Monthly Standard Membership',
    description: 'Standard Membership unlocks the standard tier features of the Weekly Diet Planner App.',
    mode: 'subscription',
    price: 4.99,
    currency: 'usd',
    interval: 'month'
  },
  {
    id: 'prod_SXimRxxHi8UZxj',
    priceId: 'price_1RcdLK03xOQRAfiHl0sTMwqP',
    name: 'Monthly Premium Membership',
    description: 'Premium Membership gives you access to all the features of ThymeTable',
    mode: 'subscription',
    price: 9.99,
    currency: 'usd',
    interval: 'month'
  }
  {
    id: 'prod_SZE42TklCwEf8i',
    priceId: 'price_1Re5cG03xOQRAfiHebSj9CCu',
    name: 'Annual Standard Membership',
    description: 'Standard Membership unlocks the standard tier features of the Weekly Diet Planner App.',
    mode: 'subscription',
    price: 49.99,
    currency: 'usd',
    interval: 'year'
  },
  {
    id: 'prod_SZE6ADEdr15g6s',
    priceId: 'price_1Re5e303xOQRAfiHSMoawEJW',
    name: 'Annual Premium Membership',
    description: 'Premium Membership gives you access to all the features of ThymeTable',
    mode: 'subscription',
    price: 99.99,
    currency: 'usd',
    interval: 'year'
  }
];

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.priceId === priceId);
}

export function getProductById(id: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.id === id);
}