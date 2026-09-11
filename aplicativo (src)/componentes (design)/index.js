/**
 * Design System do Gestop — ponto único de importação.
 *
 *   import { Button, Card, Input, Badge } from '../../componentes (design)'
 *
 * Os CSS entram uma vez só, aqui, e valem pro app inteiro.
 * Regras de uso e exemplos vivem nos comentários de cada componente.
 */
import './tokens.css'
import './base.css'

export { default as Button } from './Button'
export { default as Card } from './Card'
export { Input, Select, Textarea } from './Field'
export { default as Badge, Eyebrow } from './Badge'
export { default as Banner } from './Banner'
export { default as Modal, Lightbox } from './Modal'
export { default as PillTabs } from './PillTabs'
export { ProgressRing, ProgressBar } from './Progress'
export { default as AppBar } from './AppBar'
export { default as Screen, ScreenBody } from './Screen'
export { default as EmptyState, Loading } from './EmptyState'
