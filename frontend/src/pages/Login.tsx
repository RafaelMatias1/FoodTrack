import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Utensils, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Login() {
  const { login, configuracoes, carregando } = useApp();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [mostrar, setMostrar] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) { setErro('Digite seu e-mail.'); return; }
    if (!senha)        { setErro('Digite sua senha.');  return; }

    const erroApi = await login(email.trim(), senha);
    if (erroApi) {
      setErro('E-mail ou senha incorretos.');
      setSenha('');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <Utensils size={36} />
        </div>
        <h1 className="login-title">{configuracoes.nomeFoodTruck}</h1>
        <p className="login-sub">Sistema de Gerenciamento</p>

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
            <button className="input-toggle-vis" onClick={() => setMostrar(m => !m)} type="button">
              {mostrar ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {erro && <p className="input-erro-msg">{erro}</p>}
        </div>

        <button
          className="btn btn-primary btn-block btn-lg"
          onClick={handleLogin}
          disabled={carregando}
        >
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: 'var(--texto-claro)' }}>
          Primeiro acesso?{' '}
          <Link to="/cadastro" style={{ color: 'var(--laranja)', fontWeight: 600 }}>
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
