import { supabase } from '../lib/supabase';

export interface SubscriptionData {
  customer_id: string;
  subscription_id: string | null;
  subscription_status: string;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean | null;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export async function getUserSubscription(): Promise<SubscriptionData | null> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Auth error:', authError);
      throw new Error(`Authentication failed: ${authError.message}`);
    }
    
    if (!user) {
      console.error('No authenticated user found');
      return null;
    }

    // Query the stripe_user_subscriptions view
    const { data, error } = await supabase
      .from('stripe_user_subscriptions')
      .select('*')
      .single();

    if (error) {
      // If no subscription found, return null instead of throwing error
      if (error.code === 'PGRST116') {
        console.log('No subscription found for user');
        return null;
      }
      console.error('Supabase error:', error);
      throw new Error(`Failed to fetch subscription: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in getUserSubscription:', error);
    throw error;
  }
}

export async function createCheckoutSession(priceId: string) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      throw new Error(`Authentication failed: ${authError.message}`);
    }
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        userId: user.id,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}