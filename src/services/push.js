// Ativação das notificações no celular do funcionário.
//
// Fluxo: registra o service worker, pede a permissão (só a partir de um toque
// do usuário — navegador exige), pega o endereço do aparelho no Firebase e
// guarda no restaurante para o agendador saber para quem enviar.
import { getMessaging, getToken, isSupported } from 'firebase/messaging'
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import app, { db } from './firebase'

const VAPID = import.meta.env.VITE_FIREBASE_VAPID_KEY

// Um id curto e estável por aparelho, para o mesmo celular não virar vários
// registros quando o Firebase renova o endereço.
function idDoAparelho(token) {
  let h = 0
  for (let i = 0; i < token.length; i++) { h = ((h << 5) - h + token.charCodeAt(i)) | 0 }
  return 'ap' + Math.abs(h).toString(36)
}

export async function pushDisponivel() {
  if (typeof window === 'undefined') return false
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return false
  if (!VAPID) return false
  try { return await isSupported() } catch { return false }
}

export function permissaoAtual() {
  if (typeof Notification === 'undefined') return 'indisponivel'
  return Notification.permission // 'default' | 'granted' | 'denied'
}

// No iPhone, notificação só funciona com o app instalado na tela inicial.
export function ehIOS() {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

export function instaladoNaTelaInicial() {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(display-mode: standalone)')?.matches || window.navigator.standalone === true
}

export async function registrarServiceWorker() {
  if (!('serviceWorker' in navigator)) return null
  return navigator.serviceWorker.register('/sw.js', { scope: '/' })
}

// Devolve { ok, motivo } — o motivo alimenta a mensagem que o usuário vê.
export async function ativarNotificacoes({ restaurantId, uid, nome }) {
  if (!(await pushDisponivel())) return { ok: false, motivo: 'indisponivel' }
  if (ehIOS() && !instaladoNaTelaInicial()) return { ok: false, motivo: 'ios-sem-instalar' }

  const permissao = await Notification.requestPermission()
  if (permissao !== 'granted') return { ok: false, motivo: 'negada' }

  const registro = await registrarServiceWorker()
  const token = await getToken(getMessaging(app), { vapidKey: VAPID, serviceWorkerRegistration: registro })
  if (!token) return { ok: false, motivo: 'sem-token' }

  const aparelho = idDoAparelho(token)
  await setDoc(doc(db, 'restaurants', restaurantId, 'dispositivos', aparelho), {
    token, uid, nome: nome || '', atualizadoEm: serverTimestamp(),
  })
  localStorage.setItem('gestop_aparelho', aparelho)
  return { ok: true, aparelho }
}

export async function desativarNotificacoes({ restaurantId }) {
  const aparelho = localStorage.getItem('gestop_aparelho')
  if (!aparelho) return
  try { await deleteDoc(doc(db, 'restaurants', restaurantId, 'dispositivos', aparelho)) } catch (e) { console.error(e) }
  localStorage.removeItem('gestop_aparelho')
}

export function jaAtivouNesteAparelho() {
  return typeof localStorage !== 'undefined' && !!localStorage.getItem('gestop_aparelho') && permissaoAtual() === 'granted'
}
