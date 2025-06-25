/*
  # Create stripe_user_subscriptions view

  1. New Views
    - `stripe_user_subscriptions` - A view that joins stripe_customers and stripe_subscriptions
      to provide user-specific subscription data in the format expected by the frontend

  2. Purpose
    - Bridges the gap between the existing database schema and frontend expectations
    - Provides a unified view of user subscription data
    - Maps customer_id to user_id for easier frontend queries

  3. Columns
    - All subscription fields from stripe_subscriptions
    - Maps to user_id from stripe_customers table
*/

-- Create the stripe_user_subscriptions view
CREATE OR REPLACE VIEW stripe_user_subscriptions AS
SELECT 
  sc.user_id,
  ss.customer_id,
  ss.subscription_id,
  ss.status as subscription_status,
  ss.price_id,
  ss.current_period_start,
  ss.current_period_end,
  ss.cancel_at_period_end,
  ss.payment_method_brand,
  ss.payment_method_last4,
  ss.created_at,
  ss.updated_at
FROM stripe_subscriptions ss
JOIN stripe_customers sc ON ss.customer_id = sc.customer_id
WHERE sc.deleted_at IS NULL;

-- Grant appropriate permissions
GRANT SELECT ON stripe_user_subscriptions TO authenticated;

-- Enable RLS on the view (inherits from underlying tables)
ALTER VIEW stripe_user_subscriptions SET (security_invoker = true);