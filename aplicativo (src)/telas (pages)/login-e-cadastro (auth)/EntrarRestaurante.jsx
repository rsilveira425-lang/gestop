import { useState } from 'react'
import { getDoc, doc } from 'firebase/firestore'
import { db } from '../../conexoes (services)/firebase'
import { Screen, Card, Button, Input } from '../../componentes (design)'

/**
 * Bifurcação depois do cadastro: entrar num restaurante que já existe
 * (funcionário, com código) ou criar o seu (dono).
 * Mesmos componentes e tokens do resto do fluxo de entrada.
 */
export default function EntrarRestaurante({ onCriarRestaurante, onEntrou }) {
  const [codigo, setCodigo] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  async function entrar() {
    if (codigo.trim().length < 4) { setErro('Código inválido'); return }
    setCarregando(true)
    setErro('')
    try {
      const cod = codigo.trim().toUpperCase()
      const snap = await getDoc(doc(db, 'convites', cod))
      if (snap.exists()) {
        await onEntrou(snap.data().restaurantId, cod)
      } else {
        setErro('Código não encontrado. Confirme com o dono do restaurante.')
      }
    } catch {
      setErro('Erro ao buscar. Tente novamente.')
    }
    setCarregando(false)
  }

  return (
    <Screen variant="centered">
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--gs-space-8)' }}>
          <h1 className="gs-h2">Gestop</h1>
          <p className="gs-muted" style={{ marginTop: 'var(--gs-space-2)' }}>Como deseja continuar?</p>
        </div>

        <Card style={{ marginBottom: 'var(--gs-space-4)' }}>
          <h2 className="gs-h4">Sou funcionário</h2>
          <p className="gs-muted" style={{ margin: 'var(--gs-space-1) 0 var(--gs-space-4)' }}>
            Digite o código do restaurante:
          </p>
          <Input
            label="Código de acesso"
            value={codigo}
            onChange={e => setCodigo(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && entrar()}
            placeholder="Ex: ABC123"
            maxLength={8}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            error={erro}
            style={{
              fontSize: 'var(--gs-text-2xl)',
              textAlign: 'center',
              letterSpacing: '.32em',
              fontWeight: 'var(--gs-weight-bold)',
              fontVariantNumeric: 'tabular-nums',
            }}
          />
          <Button
            block
            onClick={entrar}
            loading={carregando}
            loadingText="Buscando..."
            disabled={codigo.trim().length < 4}
          >
            Entrar no restaurante
          </Button>
        </Card>

        <Card>
          <h2 className="gs-h4">Sou dono ou gestor</h2>
          <p className="gs-muted" style={{ margin: 'var(--gs-space-1) 0 var(--gs-space-4)' }}>
            Cadastrar meu restaurante
          </p>
          <Button variant="secondary" block onClick={onCriarRestaurante}>
            Criar meu restaurante
          </Button>
        </Card>
      </div>
    </Screen>
  )
}
