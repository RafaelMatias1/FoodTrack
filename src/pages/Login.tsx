import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Utensils, Lock, Mail, Eye, EyeOff } from 'lucide-react';

export function Login() {
  const { login, configuracoes, resetarAcesso } = useApp();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [tentando, setTentando] = useState(false);

  const handleEsqueciSenha = () => {
    const ok = window.confirm(
      'Isso vai apagar seu e-mail e senha atuais para você cadastrar de novo. Seus produtos, pedidos e clientes serão mantidos. Continuar?'
    );
    if (ok) resetarAcesso();
  };

  const exigeEmail = !!configuracoes.email;

  const handleLogin = () => {
    if (exigeEmail && !email.trim()) {
      setErro('Digite seu e-mail.');
      return;
    }
    if (!senha) {
      setErro('Digite sua senha.');
      return;
    }
    setTentando(true);
    setTimeout(() => {
      const ok = login(email.trim(), senha);
      if (!ok) {
        setErro('E-mail ou senha incorretos.');
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

        {exigeEmail && (
          <div className="form-group">
            <label className="form-label">
              <Mail size={12} style={{ marginRight: 4 }} />
              E-mail
            </label>
            <input
              className={`form-control ${erro && !email.trim() ? 'input-erro' : ''}`}
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setErro(''); }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="Digite seu e-mail"
              autoFocus
            />
          </div>
        )}

        <div className="form-group" style={{ position: 'relative' }}>
          <label className="form-label">
            <Lock size={12} style={{ marginRight: 4 }} />
            Senha de acesso
          </label>
          <div style={{ position: 'relative' }}>
            <input
              className={`form-control ${erro && email.trim() && !senha ? 'input-erro' : ''}`}
              type={mostrar ? 'text' : 'password'}
              value={senha}
              onChange={e => { setSenha(e.target.value); setErro(''); }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="Digite a senha"
            />
            <button
              className="input-toggle-vis"
              onClick={() => setMostrar(m => !m)}
              type="button"
            >
              {mostrar ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {erro && <p className="input-erro-msg">{erro}</p>}
        </div>

        <button
          className="btn btn-primary btn-block btn-lg"
          onClick={handleLogin}
          disabled={tentando}
        >
          {tentando ? 'Entrando...' : 'Entrar'}
        </button>

        <button
          type="button"
          onClick={handleEsqueciSenha}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--texto-claro)',
            fontSize: 13,
            marginTop: 12,
            cursor: 'pointer',
            textDecoration: 'underline',
            width: '100%',
          }}
        >
          Esqueci minha senha
        </button>

        <p className="login-hint">
          {configuracoes.cidade}
        </p>
      </div>
    </div>
  );
}
