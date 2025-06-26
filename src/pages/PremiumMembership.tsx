import React, { useEffect } from 'react';

const STRIPE_SCRIPT_ID = 'stripe-pricing-table-js';

export default function PremiumMembership() {
  useEffect(() => {
    // Only add the script if it hasn't been added yet
    if (!document.getElementById(STRIPE_SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = STRIPE_SCRIPT_ID;
      script.src = 'https://js.stripe.com/v3/pricing-table.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Premium Membership</h1>
      <p className="mb-8 text-center text-gray-600">
        Unlock all features and support ThymeTable by becoming a premium member!
      </p>
      <div className="flex justify-center">
        <stripe-pricing-table
          pricing-table-id="prctbl_1Rdyw303xOQRAfiHGTk7OtIh"
          publishable-key="pk_test_51RcdD303xOQRAfiHtkGiWw6o18yC0SBiG7dXgauWfVaTNMbFMF7u6kYOTNfWY5nanx42wjXovYoXIrVjDEkVDCGK006D8bAKBF"
        />
      </div>
    </div>
  );
}