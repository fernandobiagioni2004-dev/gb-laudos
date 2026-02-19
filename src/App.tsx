import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "@/context/AppContext";
import { Layout } from "@/components/Layout";

// Admin pages
import Dashboard from "@/pages/admin/Dashboard";
import Exames from "@/pages/admin/Exames";
import Clientes from "@/pages/admin/Clientes";
import Radiologistas from "@/pages/admin/Radiologistas";
import TabelasPreco from "@/pages/admin/TabelasPreco";
import Relatorios from "@/pages/admin/Relatorios";

// Radiologist pages
import ExamesDisponiveis from "@/pages/radiologista/ExamesDisponiveis";
import MeusExamesRadiologista from "@/pages/radiologista/MeusExames";
import MeuFinanceiro from "@/pages/radiologista/MeuFinanceiro";

// External user pages
import NovoExame from "@/pages/externo/NovoExame";
import MeusExamesExterno from "@/pages/externo/MeusExames";

// Shared
import MeuPerfil from "@/pages/shared/MeuPerfil";
import Calendario from "@/pages/shared/Calendario";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { role } = useApp();

  return (
    <Layout>
      <Routes>
        {/* Admin routes */}
        {role === 'admin' && (
          <>
            <Route path="/" element={<Dashboard />} />
            <Route path="/exames" element={<Exames />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/radiologistas" element={<Radiologistas />} />
            <Route path="/tabelas-preco" element={<TabelasPreco />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/calendario" element={<Calendario />} />
          </>
        )}

        {/* Radiologist routes */}
        {role === 'radiologista' && (
          <>
            <Route path="/" element={<Navigate to="/exames-disponiveis" replace />} />
            <Route path="/exames-disponiveis" element={<ExamesDisponiveis />} />
            <Route path="/meus-exames" element={<MeusExamesRadiologista />} />
            <Route path="/meu-financeiro" element={<MeuFinanceiro />} />
            <Route path="/calendario" element={<Calendario />} />
          </>
        )}

        {/* External user routes */}
        {role === 'externo' && (
          <>
            <Route path="/" element={<Navigate to="/novo-exame" replace />} />
            <Route path="/novo-exame" element={<NovoExame />} />
            <Route path="/meus-exames" element={<MeusExamesExterno />} />
          </>
        )}

        {/* Shared */}
        <Route path="/perfil" element={<MeuPerfil />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
