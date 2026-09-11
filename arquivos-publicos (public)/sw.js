// Service worker do Gestop.
//
// Faz duas coisas:
//  1. Recebe as notificações de lembrete e mostra na tela do celular, mesmo
//     com o app fechado.
//  2. Guarda o app para ele abrir sem internet — cozinha com wifi oscilando
//     é regra, não exceção.
//
// De propósito NÃO usa o SDK do Firebase aqui dentro: o servidor envia a
// notificação como dados puros e este arquivo monta o aviso na mão. Assim o
// arquivo não precisa das chaves do projeto e pode ser público sem risco.

const CACHE = 'gestop-v1'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', evento => {
  evento.waitUntil((async () => {
    const nomes = await caches.keys()
    await Promise.all(nomes.filter(n => n !== CACHE).map(n => caches.delete(n)))
    await self.clients.claim()
  })())
})

// Rede primeiro, cache como rede de segurança. Nunca serve versão velha
// enquanto houver internet — app desatualizado em produção é pior que app lento.
self.addEventListener('fetch', evento => {
  const req = evento.request
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return

  evento.respondWith((async () => {
    try {
      const resposta = await fetch(req)
      if (resposta && resposta.status === 200 && resposta.type === 'basic') {
        const copia = resposta.clone()
        caches.open(CACHE).then(c => c.put(req, copia)).catch(() => {})
      }
      return resposta
    } catch (e) {
      const guardado = await caches.match(req)
      if (guardado) return guardado
      // Navegação sem rede e sem cache da rota: devolve a página inicial
      if (req.mode === 'navigate') {
        const inicial = await caches.match('/')
        if (inicial) return inicial
      }
      throw e
    }
  })())
})

self.addEventListener('push', evento => {
  let dados = {}
  try { dados = evento.data ? evento.data.json() : {} } catch (e) { dados = {} }
  const conteudo = dados.data || dados
  const titulo = conteudo.titulo || 'Gestop'
  evento.waitUntil(self.registration.showNotification(titulo, {
    body: conteudo.corpo || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    // Mesma tag = o aviso novo substitui o antigo em vez de empilhar
    tag: conteudo.tag || 'gestop-lembrete',
    renotify: true,
    data: { url: conteudo.url || '/' },
  }))
})

self.addEventListener('notificationclick', evento => {
  evento.notification.close()
  const destino = evento.notification.data?.url || '/'
  evento.waitUntil((async () => {
    const abertas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    // Se o app já estiver aberto, foca nele em vez de abrir outra janela
    for (const cliente of abertas) {
      if (cliente.url.includes(self.location.origin) && 'focus' in cliente) return cliente.focus()
    }
    if (self.clients.openWindow) return self.clients.openWindow(destino)
  })())
})
