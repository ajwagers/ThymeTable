/*
  # Fix stripe_user_subscriptions view

  1. View Updates
    - Drop existing stripe_user_subscriptions view if it exists
    - Create new stripe_user_subscriptions view with proper column mapping
    - Include user_id from stripe_customers table
    - Map subscription data from stripe_subscriptions table

  2. Security
    - Grant SELECT permissions to authenticated users
    - Enable security invoker for RLS inheritance
*/

-- Drop the existing view if it exists to avoid column naming conflicts
DROP VIEW IF EXISTS stripe_user_subscriptions;

-- Create the stripe_user_subscriptions view with proper column names
CREATE VIEW stripe_user_subscriptions AS
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