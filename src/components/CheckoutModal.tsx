import React from 'react';
import { Elements } from '@stripe/stripe-react-js';
import { loadStripe } from '@stripe/stripe-js';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';
import CheckoutForm from './CheckoutForm';

// Inicialização do Stripe com a chave publicável
const stripePromise = loadStripe('pk_test_51RSXTEGbhhnjh4wtlS5QHAxdTte7yo9RiNT1MgrOefcTqaQlyszuFnP64mzTBc0pdffx1tKs3sWhmvCTqnqXQeM800AML8zYsl');

interface CheckoutModalProps {
  clientSecret: string;
  onClose: () => void;
  onSuccess: () => void;
}

const CheckoutModal = ({ clientSecret, onClose, onSuccess }: CheckoutModalProps) => {
  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#16a34a',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        borderRadius: '8px',
      },
    },
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="bg-white w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
          <p className="text-gray-600 mt-1">Finalize sua assinatura do plano PRO</p>
        </div>

        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm onSuccess={onSuccess} />
        </Elements>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-lg font-bold text-gray-900">R$ 19,90/mês</p>
            </div>
            <div className="text-sm text-gray-500">
              Cancele a qualquer momento
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CheckoutModal; 