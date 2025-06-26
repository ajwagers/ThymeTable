import React, { useEffect } from 'react';

const STRIPE_SCRIPT_ID = 'stripe-pricing-table-js';

export default function StandardMembership() {
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
      <h1 className="text-3xl font-bold mb-6 text-center">Standard Membership</h1>
      <p className="mb-8 text-center text-gray-600">
        Enjoy great features and support ThymeTable with a Standard Membership!
      </p>
      <div className="flex justify-center">
        <stripe-pricing-table
          pricing-table-id="prctbl_1RdylU03xOQRAfiHmqDCxpAP"
          publishable-key="pk_test_51RcdD303xOQRAfiHtkGiWw6o18yC0SBiG7dXgauWfVaTNMbFMF7u6kYOTNfWY5nanx42wjXovYoXIrVjDEkVDCGK006D8bAKBF"
        />
      </div>
    </div>
  );
}