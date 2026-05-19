import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { api } from '../services/api';
import { Save, LogOut, Shield, Store, Key } from 'lucide-react';

export function Configuracoes() {
  const { configuracoes, salvarConfiguracoes, logout } = useApp();
  const toast = useToast();

  const [nomeFoodTruck, setNomeFoodTruck]       = useState(configuracoes.nomeFoodTruck);
  const [nomeProprietario, setNomeProprietario] = useState(configuracoes.nomeProprietario);
  const [cidade, setCidade]                     = useState(configuracoes.cidade);
  const [codigoQuiosque, setCodigoQuiosque]     = useState(configuracoes.codigoQuiosque);
  const [senhaAtual, setSenhaAtual]             = useState('');
  const [novaSenha, setNovaSenha]               = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [erroSenha, setErroSenha]               = useState('');
  const [salvandoGeral, setSalvandoGeral]       = useState(false);
  const [salvandoSenha, setSalvandoSenha]       = useState(false);

  const salvarGeral = async () => {
    setSalvandoGeral(true);
    try {
      const res = await api.patch<{ usuario: { nomeFoodTruck: string; nomeProprietario: string; cidade: string; codigoQuiosque: string } }>(
        '/auth/me',
        { nomeFoodTruck, nomeProprietario, cidade, codigoQuiosque }
      );
      salvarConfiguracoes({ ...res.usuario });
      toast.sucesso('Dados salvos com sucesso!');
    } catch (e) {
      toast.erro((e as Error).message ?? 'Erro ao salvar.');
    } finally {
      setSalvandoGeral(false);
    }
  };

  const salvarSenha = async () => {
    setErroSenha('');
    if (novaSenha.length < 4)          { setErroSenha('A nova senha deve ter no mínimo 4 caracteres.'); return; }
    if (novaSenha !== confirmarNovaSenha) { setErroSenha('As senhas não coincidem.'); return; }
    setSalvandoSenha(true);
    try {
      await api.patch('/auth/me/senha', { senhaAtual, novaSenha });
      setSenhaAtual(''); setNovaSenha(''); setConfirmarNovaSenha('');
      toast.sucesso('Senha alterada com sucesso!');
    } catch (e) {
      setErroSenha((e as Error).message ?? 'Erro ao alterar senha.');
    } finally {
      setSalvandoSenha(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Configurações</h1>
      </div>

      <div className="configuracoes-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>

        {/* Dados gerais */}
        <div className="card">
          <div className="chart-title" style={{ marginBottom: 16 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Store size={16} /> Dados do Food Truck</span>
          </div>
          <div className="form-group">
            <label className="form-label">Nome do Food Truck</label>
            <input className="form-control" value={nomeFoodTruck} onChange={e => setNomeFoodTruck(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Nome do Proprietário</label>
            <input className="form-control" value={nomeProprietario} onChange={e => setNomeProprietario(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Cidade</label>
            <input className="form-control" value={cidade} onChange={e => setCidade(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">E-mail de acesso</label>
            <input className="form-control" type="email" value={configuracoes.email} readOnly style={{ opacity: 0.6, cursor: 'not-allowed' }} />
            <p style={{ fontSize: 11, color: 'var(--texto-claro)', marginTop: 4 }}>O e-mail não pode ser alterado.</p>
          </div>
          <div className="form-group">
            <label className="form-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Shield size={13} /> Código do Quiosque</span>
            </label>
            <input className="form-control" value={codigoQuiosque} onChange={e => setCodigoQuiosque(e.target.value)} maxLength={6} placeholder="Ex: 0000" />
            <p style={{ fontSize: 11, color: 'var(--texto-claro)', marginTop: 4 }}>
              Este código é exigido para sair da tela de autoatendimento.
            </p>
          </div>
          <button className="btn btn-primary" onClick={salvarGeral} disabled={salvandoGeral}>
            <Save size={14} /> {salvandoGeral ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Alterar Senha */}
          <div className="card">
            <div className="chart-title" style={{ marginBottom: 16 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Key size={16} /> Alterar Senha</span>
            </div>
            <div className="form-group">
              <label className="form-label">Senha atual</label>
              <input className="form-control" type="password" value={senhaAtual} onChange={e => { setSenhaAtual(e.target.value); setErroSenha(''); }} />
            </div>
            <div className="form-group">
              <label className="form-label">Nova senha</label>
              <input className="form-control" type="password" value={novaSenha} onChange={e => { setNovaSenha(e.target.value); setErroSenha(''); }} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirmar nova senha</label>
              <input className="form-control" type="password" value={confirmarNovaSenha} onChange={e => { setConfirmarNovaSenha(e.target.value); setErroSenha(''); }} />
            </div>
            {erroSenha && <p className="input-erro-msg" style={{ marginBottom: 10 }}>{erroSenha}</p>}
            <button className="btn btn-primary" onClick={salvarSenha} disabled={salvandoSenha || !senhaAtual || !novaSenha || !confirmarNovaSenha}>
              <Key size={14} /> {salvandoSenha ? 'Alterando...' : 'Alterar senha'}
            </button>
          </div>

          {/* Sair */}
          <div className="card">
            <div className="chart-title" style={{ marginBottom: 12 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><LogOut size={16} /> Sessão</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--texto-claro)', marginBottom: 14 }}>
              Ao sair, será necessário fazer login novamente para acessar o sistema.
            </p>
            <button className="btn btn-danger" onClick={logout}>
              <LogOut size={14} /> Sair do sistema
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
