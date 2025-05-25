import React, { useEffect } from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { useToast } from '@/hooks/use-toast';

interface PayPalCheckoutProps {
  onSuccess: () => void;
  onClose: () => void;
}

const PayPalCheckout = ({ onSuccess, onClose }: PayPalCheckoutProps) => {
  const { toast } = useToast();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md p-6 rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600">Plano PRO</span>
            <span className="text-xl font-bold text-gray-900">R$ 19,90/mês</span>
          </div>
          <div className="text-sm text-gray-500">
            Acesso a todos os recursos premium
          </div>
        </div>

        <PayPalButtons
          createOrder={(data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: "19.90",
                    currency_code: "BRL"
                  },
                  description: "Plano PRO - Finance.io"
                },
              ],
            });
          }}
          onApprove={async (data, actions) => {
            if (actions.order) {
              await actions.order.capture();
              onSuccess();
              toast({
                title: "Pagamento aprovado!",
                description: "Seu plano PRO foi ativado com sucesso.",
              });
            }
          }}
          onError={() => {
            toast({
              title: "Erro no pagamento",
              description: "Ocorreu um erro ao processar seu pagamento. Tente novamente.",
              variant: "destructive",
            });
          }}
          style={{
            layout: "vertical",
            color: "gold",
            shape: "rect",
            label: "pay"
          }}
        />

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Pagamento seguro via PayPal</span>
            <span>Cancele quando quiser</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayPalCheckout; 