export default function Step3Colaboradores({ codigoAcesso, onConcluir, onBack }) {
  return (
    <div style={s.wrap}>
      <div style={s.emoji}>🎉</div>
      <h2 style={s.title}>Tudo pronto!</h2>
      <p style={s.desc}>Compartilhe o código abaixo com sua equipe. Os funcionários acessam o app e digitam este código para começar.</p>

      <div style={s.codeBox}>
        <p style={s.codeLabel}>CÓDIGO DE ACESSO</p>
        <p style={s.code}>{codigoAcesso || '------'}</p>
      </div>

      <p style={s.hint}>💡 O código também fica disponível no Painel do Gestor a qualquer momento.</p>

      <div style={s.footer}>
        <button style={s.back} onClick={onBack}>← Voltar</button>
        <button style={s.next} onClick={onConcluir}>Começar a usar →</button>
      </div>
    </div>
  )
}

const s = {
  wrap: { padding:'24px' },
  emoji: { fontSize:'48px', textAlign:'center', marginBottom:'12px' },
  title: { margin:'0 0 8px', fontSize:'22px', fontWeight:700, color:'#0f172a', textAlign:'center' },
  desc: { margin:'0 0 24px', fontSize:'14px', color:'#64748b', textAlign:'center', lineHeight:'1.5' },
  codeBox: { background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:'12px', padding:'20px', textAlign:'center', marginBottom:'16px' },
  codeLabel: { margin:'0 0 8px', fontSize:'11px', fontWeight:700, color:'#3b82f6', textTransform:'uppercase', letterSpacing:'1px' },
  code: { margin:0, fontSize:'36px', fontWeight:900, color:'#1e40af', letterSpacing:'8px' },
  hint: { margin:'0 0 24px', fontSize:'12px', color:'#94a3b8', textAlign:'center' },
  footer: { display:'flex', gap:'8px', marginTop:'8px' },
  back: { padding:'13px 20px', background:'#f1f5f9', color:'#64748b', border:'none', borderRadius:'8px', fontSize:'14px', cursor:'pointer' },
  next: { flex:1, padding:'13px', background:'#2563eb', color:'#fff', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:600, cursor:'pointer' },
}
