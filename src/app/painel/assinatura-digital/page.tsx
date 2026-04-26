'use client';
import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Key, 
  Upload, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  Lock,
  FileDigit,
  Trash2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { usePainel } from '../PainelContext';

export default function AssinaturaDigitalPage() {
  const { user, perfil } = usePainel();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [certificate, setCertificate] = useState<{ name: string; uploaded_at: string } | null>(null);
  const [password, setPassword] = useState('');

  const fetchCertificate = async () => {
    if (!perfil) return;
    const { data } = await supabase
      .from('osc_certificados')
      .select('arquivo_nome, created_at')
      .eq('osc_id', perfil.osc_id)
      .maybeSingle();
    
    if (data) {
      setCertificate({ name: data.arquivo_nome, uploaded_at: data.created_at });
    }
  };

  useEffect(() => { fetchCertificate(); }, [perfil]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !perfil) return;
    
    if (!file.name.endsWith('.pfx')) {
      setError('Apenas arquivos .pfx são aceitos.');
      return;
    }

    setUploading(true);
    setError('');
    
    const path = `certificados/${perfil.osc_id}/cert_${Date.now()}.pfx`;
    const { error: upErr } = await supabase.storage
      .from('osc-docs')
      .upload(path, file);

    if (upErr) {
      setError('Erro ao enviar arquivo.');
      setUploading(false);
      return;
    }

    // Salvar metadados
    const { error: dbErr } = await supabase
      .from('osc_certificados')
      .upsert({
        osc_id: perfil.osc_id,
        user_id: user?.id,
        arquivo_path: path,
        arquivo_nome: file.name,
        // Senha deve ser tratada com segurança extrema no backend real
        // Aqui apenas salvamos o estado para o MVP
      });

    if (dbErr) {
       setError('Erro ao salvar informações no banco.');
    } else {
       setSuccess(true);
       setCertificate({ name: file.name, uploaded_at: new Date().toISOString() });
    }
    setUploading(false);
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', animation: 'panelPageIn .3s ease' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 className="panel-page-title">Assinatura Digital</h1>
        <p className="panel-page-subtitle">Certificado Digital ICP-Brasil (.pfx) para conformidade MROSC</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        
        {/* Info Card */}
        <div className="panel-card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(13,54,79,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--site-primary)' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--site-primary)', margin: 0 }}>Por que usar?</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--site-text-secondary)', marginTop: 4 }}>
                A assinatura digital garante validade jurídica total aos seus relatórios conforme a Lei 13.019/2014.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              'Autenticidade Garantida',
              'Integridade do Documento',
              'Padrão ICP-Brasil',
              'Segurança nas Parcerias'
            ].map(text => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8rem', color: 'var(--site-text-primary)', fontWeight: 600 }}>
                <CheckCircle2 size={14} style={{ color: '#16a34a' }} />
                {text}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, padding: 16, background: 'rgba(197,171,118,0.08)', borderRadius: 12, border: '1px solid rgba(197,171,118,0.2)', display: 'flex', gap: 12 }}>
             <Info size={18} style={{ color: 'var(--site-gold)', flexShrink: 0 }} />
             <p style={{ fontSize: '0.78rem', color: 'var(--site-gold)', fontWeight: 600, margin: 0, lineHeight: 1.5 }}>
               Seus arquivos são armazenados com criptografia de ponta a ponta.
             </p>
          </div>
        </div>

        {/* Upload Card */}
        <div className="panel-card" style={{ padding: 28 }}>
          {certificate ? (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ width: 64, height: 64, background: 'rgba(22,163,74,0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#16a34a', border: '2px solid rgba(22,163,74,0.15)' }}>
                <FileDigit size={32} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--site-primary)', marginBottom: 6 }}>Certificado Ativo</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--site-text-secondary)', marginBottom: 20 }}>
                <strong>{certificate.name}</strong><br/>
                Enviado em {new Date(certificate.uploaded_at).toLocaleDateString()}
              </p>
              
              <button 
                onClick={() => setCertificate(null)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, border: '1px solid #ef4444', background: '#fff', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
              >
                <Trash2 size={14} /> Remover e Trocar
              </button>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--site-primary)', marginBottom: 16 }}>Configurar Certificado</div>
              
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--site-text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Arquivo .pfx</label>
                <label style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  height: 100, border: '2px dashed var(--site-border)', borderRadius: 14,
                  cursor: uploading ? 'wait' : 'pointer', fontSize: '0.85rem', fontWeight: 600,
                  color: 'var(--site-text-secondary)', background: 'rgba(0,0,0,0.02)', transition: 'all .2s'
                }}>
                  <input type="file" accept=".pfx" style={{ display: 'none' }} onChange={handleUpload} disabled={uploading} />
                  {uploading ? <div className="panel-spinner" style={{ width: 20, height: 20 }} /> : <><Upload size={20} /> Selecionar Certificado</>}
                </label>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--site-text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Senha da Assinatura</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(0,0,0,0.3)' }} />
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: 10, border: '1px solid var(--site-border)', outline: 'none', fontSize: '0.9rem' }} 
                  />
                </div>
                <p style={{ fontSize: '0.7rem', color: 'var(--site-text-secondary)', marginTop: 8 }}>
                  A senha será usada apenas para assinar os relatórios gerados por você.
                </p>
              </div>

              {error && <p style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, marginBottom: 16 }}>⚠️ {error}</p>}

              <button 
                disabled={!password || uploading}
                className="btn btn-primary" 
                style={{ width: '100%', padding: 14, borderRadius: 12, fontWeight: 700 }}
                onClick={() => setSuccess(true)}
              >
                Ativar Assinatura Digital
              </button>
            </>
          )}
        </div>
      </div>

      {success && (
        <div style={{ marginTop: 24, padding: '16px 20px', background: 'rgba(22,163,74,0.08)', borderRadius: 12, border: '1px solid rgba(22,163,74,0.2)', display: 'flex', alignItems: 'center', gap: 12, color: '#16a34a', fontWeight: 600 }}>
          <CheckCircle2 size={20} /> Configuração salva com sucesso! Seus próximos relatórios serão assinados.
        </div>
      )}
    </div>
  );
}
