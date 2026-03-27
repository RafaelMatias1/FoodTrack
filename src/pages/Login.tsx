import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Utensils, Lock, Eye, EyeOff } from 'lucide-react';

export function Login() {
  const { login, configuracoes } = useApp();
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(false);
  const [mostrar, setMostrar] = useState(false);
  const [tentando, setTentando] = useState(false);

  const handleLogin = () => {
    setTentando(true);
    setTimeout(() => {
      const ok = login(senha);
      if (!ok) {
        setErro(true);
        setSenha('');
      }
      setTentando(false);
    }, 400);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <Utensils size={36} />
        </div>
        <h1 className="login-title">{configuracoes.nomeFoodTruck}</h1>
        <p className="login-sub">Sistema de Gerenciamento</p>

        <div className="form-group" style={{ position: 'relative' }}>
          <label className="form-label">
            <Lock size={12} style={{ marginRight: 4 }} />
            Senha de acesso
          </label>
          <div style={{ position: 'relative' }}>
            <input
              className={`form-control ${erro ? 'input-erro' : ''}`}
              type={mostrar ? 'text' : 'password'}
              value={senha}
              onChange={e => { setSenha(e.target.value); setErro(false); }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="Digite a senha"
              autoFocus
            />
            <button
              className="input-toggle-vis"
              onClick={() => setMostrar(m => !m)}
              type="button"
            >
              {mostrar ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {erro && <p className="input-erro-msg">Senha incorreta. Tente novamente.</p>}
        </div>

        <button
          className="btn btn-primary btn-block btn-lg"
          onClick={handleLogin}
          disabled={!senha || tentando}
        >
          {tentando ? 'Entrando...' : 'Entrar'}
        </button>

        <p className="login-hint">
          {configuracoes.cidade}
        </p>
      </div>
    </div>
  );
}
