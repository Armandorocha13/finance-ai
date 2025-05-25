import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Zap, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import PayPalCheckout from './PayPalCheckout';

const Plans = () => {
  console.log('Plans component rendered');

  const { user, updateProStatus } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const isPro = user?.user_metadata?.is_pro || false;

  useEffect(() => {
    console.log('Plans component mounted');
    console.log('User:', user);
    console.log('Is Pro:', isPro);
    return () => {
      console.log('Plans component unmounted');
    };
  }, [user, isPro]);

  const features = {
    free: [
      'Até 5 relatórios por mês',
      'Análise básica de gastos',
      'Categorização de transações',
      'Dashboard básico',
    ],
    pro: [
      'Relatórios ilimitados',
      'Análise avançada de gastos',
      'Categorização personalizada',
      'Dashboard avançado',
      'Suporte prioritário',
      'Exportação de dados',
      'Previsões financeiras',
      'Metas financeiras',
    ],
  };

  const handlePaymentSuccess = async () => {
    try {
      setLoading(true);
      await updateProStatus(true);
      setShowCheckout(false);
      toast({
        title: 'Upgrade realizado com sucesso!',
        description: 'Você agora tem acesso a todos os recursos do plano Pro.',
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: 'Erro ao atualizar status',
        description: 'Seu pagamento foi processado, mas houve um erro ao atualizar seu status. Entre em contato com o suporte.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDowngrade = async () => {
    try {
      setLoading(true);
      await updateProStatus(false);
      toast({
        title: 'Plano alterado com sucesso',
        description: 'Você voltou para o plano gratuito.',
      });
    } catch (error) {
      console.error('Erro ao fazer downgrade:', error);
      toast({
        title: 'Erro ao processar alteração',
        description: 'Ocorreu um erro ao processar sua solicitação. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Free Plan */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Plano Gratuito</CardTitle>
            <CardDescription className="text-slate-300">
              Perfeito para começar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white mb-6">
              R$ 0
              <span className="text-lg font-normal text-slate-300">/mês</span>
            </div>
            <ul className="space-y-3">
              {features.free.map((feature) => (
                <li key={feature} className="flex items-center text-slate-300">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  {feature}
                </li>
              ))}
            </ul>
            {isPro ? (
              <Button
                className="w-full mt-6 bg-slate-700 hover:bg-slate-600"
                onClick={handleDowngrade}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Voltar para Gratuito'
                )}
              </Button>
            ) : (
              <Button
                className="w-full mt-6 bg-slate-700 hover:bg-slate-600"
                disabled
              >
                Plano Atual
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card className="bg-gradient-to-br from-green-400 to-green-600 border-green-300 shadow-xl shadow-green-500/20 relative overflow-hidden transform hover:scale-105 transition-all duration-300">
          <div className="absolute top-0 right-0 bg-black text-white px-3 py-1 rounded-bl-lg text-sm font-medium">
            Popular
          </div>
          <CardHeader>
            <CardTitle className="text-2xl text-black flex items-center gap-2">
              <Zap className="h-6 w-6 text-yellow-500" />
              Plano Pro
            </CardTitle>
            <CardDescription className="text-black/70 font-medium">
              Para quem quer mais controle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-black mb-6">
              R$ 19,90
              <span className="text-lg font-normal text-black/70">/mês</span>
            </div>
            <ul className="space-y-3">
              {features.pro.map((feature) => (
                <li key={feature} className="flex items-center text-black/80 font-medium">
                  <Check className="h-5 w-5 text-black mr-2" />
                  {feature}
                </li>
              ))}
            </ul>
            {!isPro && (
              <Button
                className="w-full mt-6 bg-black hover:bg-black/80 text-white border-2 border-black/20 shadow-lg"
                onClick={() => setShowCheckout(true)}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Fazer Upgrade'
                )}
              </Button>
            )}
            {isPro && (
              <Button
                className="w-full mt-6 bg-black/10 text-black border-2 border-black/20"
                disabled
              >
                Plano Atual
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* PayPal Checkout Modal */}
      {showCheckout && (
        <PayPalCheckout
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </>
  );
};

export default Plans; 