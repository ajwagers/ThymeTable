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

-- Drop the existing view if it exists to avoid column naming conflicts
DROP VIEW IF EXISTS stripe_user_subscriptions;

-- Create the stripe_user_subscriptions view with the correct structure
CREATE VIEW stripe_user_subscriptions AS
SELECT 
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
WHERE sc.user_id = auth.uid() 
  AND sc.deleted_at IS NULL 
  AND ss.deleted_at IS NULL;

-- Grant appropriate permissions
GRANT SELECT ON stripe_user_subscriptions TO authenticated;

-- Enable RLS on the view (inherits from underlying tables)
ALTER VIEW stripe_user_subscriptions SET (security_invoker = true);