import { createLucideIcon } from 'lucide-react'

/** Usuário dentro de setas circulares (não existe no Lucide) — mesmo grid 24x24 e API dos ícones nativos. */
export const UserRoundSync = createLucideIcon('user-round-sync', [
  ['path', { d: 'M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8', key: 'arc-top' }],
  ['path', { d: 'M3 3v5h5', key: 'arrow-top' }],
  ['path', { d: 'M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16', key: 'arc-bottom' }],
  ['path', { d: 'M16 16h5v5', key: 'arrow-bottom' }],
  ['circle', { cx: '12', cy: '10', r: '2.5', key: 'head' }],
  ['path', { d: 'M8.5 16.5a3.5 3.5 0 0 1 7 0', key: 'body' }],
])
