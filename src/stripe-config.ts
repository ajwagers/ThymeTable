export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'subscription' | 'payment';
  price: number;
  currency: string;
  interval?: 'month' | 'year';
  tier: 'standard' | 'premium';
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_SZRrefckGcKJap',
    priceId: 'price_1ReIyE03qXIWnFNq9QBBJMld',
    name: 'Monthly Standard Membership',
    description: 'Standard Membership unlocks the standard tier features of the Weekly Diet Planner App.',
    mode: 'subscription',
    price: 4.99,
    currency: 'usd',
    interval: 'month',
    tier: 'standard'
  },
  {
    id: 'prod_SZRrHCyKckpmRQ',
    priceId: 'price_1ReIy903qXIWnFNqrdZdr2PZ',
    name: 'Annual Standard Membership',
    description: 'Standard Membership unlocks the standard tier features of the Weekly Diet Planner App.',
    mode: 'subscription',
    price: 49.99,
    currency: 'usd',
    interval: 'year',
    tier: 'standard'
  },
  {
    id: 'prod_SZRsIxM9Z4tU5s',
    priceId: 'price_1ReIyH03qXIWnFNq3xrvAgjU',
    name: 'Monthly Premium Membership',
    description: 'Premium Membership gives you access to all the features of the Weekly Diet Planner App.',
    mode: 'subscription',
    price: 9.99,
    currency: 'usd',
    interval: 'month',
    tier: 'premium'
  },
  {
    id: 'prod_SZRrSsfDZTjv8X',
    priceId: 'price_1ReIy503qXIWnFNqEwKyvgk8',
    name: 'Annual Premium Membership',
    description: 'Premium Membership unlocks all features of the Weekly Diet Planner App.',
    mode: 'subscription',
    price: 99.99,
    currency: 'usd',
    interval: 'year',
    tier: 'premium'
  }
];

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.priceId === priceId);
}

export function getProductById(id: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.id === id);
}

export function getProductByTierAndInterval(tier: 'standard' | 'premium', interval: 'month' | 'year'): StripeProduct | undefined {
  return stripeProducts.find(product => product.tier === tier && product.interval === interval);
}