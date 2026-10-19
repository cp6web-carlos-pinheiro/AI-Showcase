import {
  Repeat,
  UserRoundCheck,
  UserRoundPlus,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import { UserRoundSync } from '@/components/icons/user-round-sync'

/** Ícone é decisão de UI: fica no front, indexado pelo id da métrica (nunca vem da API). */
const METRIC_ICONS: Record<string, LucideIcon> = {
  'total-customers': UsersRound,
  'new-customers': UserRoundPlus,
  'repeat-customers': Repeat,
  'churned-customers': UserRoundSync,
  'active-customers': UserRoundCheck,
}

export const getMetricIcon = (id: string): LucideIcon => METRIC_ICONS[id] ?? UsersRound
