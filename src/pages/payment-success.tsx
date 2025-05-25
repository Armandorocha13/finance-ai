import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default function PaymentSuccess() {
  const router = useRouter();
  const { updateProStatus } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const handleSuccess = async () => {
      try {
        await updateProStatus(true);
        toast({
          title: 'Pagamento confirmado!',
          description: 'Seu plano PRO foi ativado com sucesso.',
        });
      } catch (error) {
        console.error('Erro ao atualizar status:', error);
        toast({
          title: 'Atenção',
          description: 'Seu pagamento foi confirmado, mas houve um erro ao ativar seu plano. Entre em contato com o suporte.',
          variant: 'destructive',
        });
      }
    };

    handleSuccess();
  }, [updateProStatus, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-black to-black flex items-center justify-center p-4">
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 w-full max-w-md p-8 text-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="rounded-full bg-green-500/20 p-3">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Pagamento Confirmado!</h1>
            <p className="text-slate-300">
              Seu plano PRO foi ativado com sucesso. Aproveite todos os recursos premium!
            </p>
          </div>

          <Button
            onClick={() => router.push('/dashboard')}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white w-full"
          >
            Voltar para o Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
} 