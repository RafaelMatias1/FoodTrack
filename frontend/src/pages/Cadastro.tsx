import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChefHat, Utensils } from 'lucide-react';

export function Cadastro() {
  const { cadastrar } = useApp();
  const [passo, setPasso] = useState(1);
  const [nomeFoodTruck, setNomeFoodTruck] = useState('');
  const [nomeProprietario, setNomeProprietario] = useState('');
  const [cidade, setCidade] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');

  const avancar = () => {
    if (passo === 1) {
      if (!nomeFoodTruck.trim() || !nomeProprietario.trim()) {
        setErro('Preencha todos os campos obrigatórios.');
        return;
      }
      setErro('');
      setPasso(2);
    } else if (passo === 2) {
      if (!email.trim()) {
        setErro('Preencha o e-mail.');
        return;
      }
      if (!/\S+@\S+\.\S+/.test(email)) {
        setErro('Digite um e-mail válido.');
        return;
      }
      setErro('');
      setPasso(3);
    } else {
      if (!senha || senha.length < 4) {
        setErro('A senha deve ter no mínimo 4 caracteres.');
        return;
      }
      if (senha !== confirmarSenha) {
        setErro('As senhas não coincidem.');
        return;
      }
      cadastrar({ nomeFoodTruck, nomeProprietario, cidade, email, senha });
    }
  };

  const voltar = () => {
    setErro('');
    setPasso(p => p - 1);
  };

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: 440 }}>
        <div className="login-logo">
          <ChefHat size={36} />
        </div>
        <h1 className="login-title">Bem-vindo ao FoodTrack!</h1>
        <p className="login-sub">Configure seu sistema — Passo {passo} de 3</p>

        {/* Barra de progresso */}
        <div style={{ background: 'var(--creme-escuro)', borderRadius: 4, height: 6, margin: '12px 0 20px', overflow: 'hidden' }}>
          <div style={{ width: passo === 1 ? '33%' : passo === 2 ? '66%' : '100%', height: '100%', background: 'var(--laranja)', borderRadius: 4, transition: 'width 0.4s' }} />
        </div>

        {passo === 1 && (
          <>
            <div className="form-group">
              <label className="form-label">Nome do Food Truck *</label>
              <input
                className="form-control"
                value={nomeFoodTruck}
                onChange={e => { setNomeFoodTruck(e.target.value); setErro(''); }}
                placeholder="Ex: Food Truck do Elpidio"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nome do proprietário *</label>
              <input
                className="form-control"
                value={nomeProprietario}
                onChange={e => { setNomeProprietario(e.target.value); setErro(''); }}
                placeholder="Ex: Elpidio Santos"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Cidade</label>
              <input
                className="form-control"
                value={cidade}
                onChange={e => setCidade(e.target.value)}
                placeholder="Ex: Guaramirim - SC"
              />
            </div>
          </>
        )}

        {passo === 2 && (
          <>
            <div className="form-group">
              <label className="form-label">E-mail de acesso *</label>
              <input
                className="form-control"
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setErro(''); }}
                placeholder="Ex: elpidio@email.com"
                autoFocus
              />
              <span style={{ fontSize: 12, color: 'var(--texto-claro)', marginTop: 4, display: 'block' }}>
                Você usará este e-mail para entrar no sistema.
              </span>
            </div>
          </>
        )}

        {passo === 3 && (
          <>
            <div className="form-group">
              <label className="form-label">Crie uma senha de acesso *</label>
              <input
                className="form-control"
                type="password"
                value={senha}
                onChange={e => { setSenha(e.target.value); setErro(''); }}
                placeholder="Mínimo 4 caracteres"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirmar senha *</label>
              <input
                className="form-control"
                type="password"
                value={confirmarSenha}
                onChange={e => { setConfirmarSenha(e.target.value); setErro(''); }}
                placeholder="Repita a senha"
                onKeyDown={e => e.key === 'Enter' && avancar()}
              />
            </div>
            <div className="alert alert-warning" style={{ marginBottom: 12 }}>
              <Utensils size={14} />
              Guarde sua senha em local seguro. Ela será necessária para acessar o sistema.
            </div>
          </>
        )}

        {erro && <p className="input-erro-msg" style={{ marginBottom: 12 }}>{erro}</p>}

        <div style={{ display: 'flex', gap: 10 }}>
          {passo > 1 && (
            <button className="btn btn-ghost" onClick={voltar}>
              Voltar
            </button>
          )}
          <button
            className="btn btn-primary btn-block btn-lg"
            onClick={avancar}
            disabled={
              passo === 1 ? !nomeFoodTruck || !nomeProprietario :
              passo === 2 ? !email :
              !senha || !confirmarSenha
            }
          >
            {passo < 3 ? 'Continuar →' : '🚀 Começar a usar'}
          </button>
        </div>
      </div>
    </div>
  );
}
