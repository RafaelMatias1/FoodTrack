import { useState, useCallback, type ReactNode } from 'react';
import { createContext, useContext } from 'react';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';

type ToastTipo = 'sucesso' | 'erro' | 'aviso';

interface Toast {
  id: number;
  mensagem: string;
  tipo: ToastTipo;
}

interface ToastContextType {
  sucesso: (msg: string) => void;
  erro: (msg: string) => void;
  aviso: (msg: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  let nextId = 0;

  const add = useCallback((mensagem: string, tipo: ToastTipo) => {
    const id = ++nextId;
    setToasts(prev => [...prev, { id, mensagem, tipo }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const sucesso = useCallback((msg: string) => add(msg, 'sucesso'), [add]);
  const erro    = useCallback((msg: string) => add(msg, 'erro'),    [add]);
  const aviso   = useCallback((msg: string) => add(msg, 'aviso'),   [add]);

  const iconMap: Record<ToastTipo, ReactNode> = {
    sucesso: <CheckCircle size={16} />,
    erro:    <XCircle size={16} />,
    aviso:   <AlertTriangle size={16} />,
  };

  return (
    <ToastContext.Provider value={{ sucesso, erro, aviso }}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 9999 }}>
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 16px', borderRadius: 10, minWidth: 280, maxWidth: 380,
              boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
              background: t.tipo === 'sucesso' ? 'var(--verde)' : t.tipo === 'erro' ? 'var(--vermelho)' : 'var(--amarelo)',
              color: 'white', fontWeight: 600, fontSize: 14,
              animation: 'slideIn 0.25s ease',
            }}
          >
            {iconMap[t.tipo]}
            <span style={{ flex: 1 }}>{t.mensagem}</span>
            <button
              onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0, display: 'flex' }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast deve ser usado dentro de ToastProvider');
  return ctx;
}
