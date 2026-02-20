import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

export function PendingApprovalModal() {
  const { isPending, signOut } = useAuth();

  return (
    <Dialog open={isPending}>
      <DialogContent className="sm:max-w-sm" onInteractOutside={e => e.preventDefault()}>
        <DialogHeader className="text-center items-center gap-3">
          <div className="h-14 w-14 rounded-full bg-amber-500/15 flex items-center justify-center">
            <ShieldAlert className="h-7 w-7 text-amber-600" />
          </div>
          <DialogTitle>Conta Pendente</DialogTitle>
          <DialogDescription className="text-center">
            Sua conta está pendente de aprovação. Aguarde o administrador liberar seu acesso.
          </DialogDescription>
        </DialogHeader>
        <Button variant="outline" className="w-full mt-2" onClick={signOut}>
          Sair
        </Button>
      </DialogContent>
    </Dialog>
  );
}
