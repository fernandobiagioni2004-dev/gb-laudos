import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import gbLaudosLoginLogo from '@/assets/gb-laudos-login-logo.png';
import loginBg from '@/assets/login-bg.jpeg';

type AuthMode = 'login' | 'signup' | 'forgot';

export default function Auth() {
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (session) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/reset-password',
        });
        if (error) {
          toast({ title: 'Erro ao enviar link', description: error.message, variant: 'destructive' });
        } else {
          toast({ title: '✅ Link enviado!', description: 'Verifique sua caixa de e-mail.' });
          setMode('login');
        }
      } else if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          toast({ title: 'Erro ao entrar', description: error.message, variant: 'destructive' });
        }
      } else {
        if (!nome.trim()) {
          toast({ title: 'Informe seu nome', variant: 'destructive' });
          return;
        }
        const { error } = await signUp(email, password, nome);
        if (error) {
          toast({ title: 'Erro ao cadastrar', description: error.message, variant: 'destructive' });
        } else {
          toast({ title: '✅ Conta criada!', description: 'Aguarde a aprovação do administrador.' });
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const title = mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Criar Conta' : 'Recuperar Senha';

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center p-4"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <Card className="relative z-10 w-full max-w-sm">
        <CardHeader className="text-center space-y-3">
          <div className="flex justify-center">
            <img src={gbLaudosLoginLogo} alt="GB Laudos" className="h-16 w-auto object-contain" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <Label>Nome completo</Label>
                <Input placeholder="Seu nome" value={nome} onChange={e => setNome(e.target.value)} required />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>E-mail</Label>
              <Input type="email" placeholder="email@exemplo.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            {mode !== 'forgot' && (
              <div className="space-y-1.5">
                <Label>Senha</Label>
                <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
              </div>
            )}
            {mode === 'login' && (
              <div className="text-right">
                <button type="button" onClick={() => setMode('forgot')} className="text-xs text-primary hover:underline font-medium">
                  Esqueceu sua senha?
                </button>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Aguarde...' : mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Cadastrar' : 'Enviar link'}
            </Button>
          </form>
          <p className="text-xs text-center text-muted-foreground mt-4">
            {mode === 'login' ? 'Não tem conta?' : 'Já tem conta?'}{' '}
            <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-primary hover:underline font-medium">
              {mode === 'login' ? 'Cadastre-se' : 'Entrar'}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
