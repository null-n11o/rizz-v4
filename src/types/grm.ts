export type GRMStatus =
  | 'lead'
  | 'apo_1' | 'apo_2' | 'apo_3' | 'apo_4' | 'apo_5plus'
  | 'sex' | 'ltr' | 'graduate'

export type BodyType = 'slim' | 'normal' | 'curvy' | 'chubby'

export interface Girl {
  id: string
  userId: string
  sourceSessionId: string | null
  sourceType: 'get_contact' | 'instant_cv'
  nickname: string
  birthday: string | null
  nationality: string | null
  occupation: string | null
  residence: string | null
  height: number | null
  bodyType: BodyType | null
  status: GRMStatus
  apoCount: number
  totalSpent: number
  rating: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface GirlInsert {
  userId: string
  sourceSessionId?: string | null
  sourceType: 'get_contact' | 'instant_cv'
  nickname: string
  birthday?: string | null
  nationality?: string | null
  occupation?: string | null
  residence?: string | null
  height?: number | null
  bodyType?: BodyType | null
  rating?: number | null
  notes?: string | null
}

export interface GirlUpdate {
  nickname?: string
  birthday?: string | null
  nationality?: string | null
  occupation?: string | null
  residence?: string | null
  height?: number | null
  bodyType?: BodyType | null
  status?: GRMStatus
  rating?: number | null
  notes?: string | null
}

export interface Apo {
  id: string
  userId: string
  girlId: string
  apoNumber: number
  apoDate: string
  location: string | null
  spent: number
  notes: string | null
  createdAt: string
}

export interface ApoInsert {
  userId: string
  girlId: string
  apoDate: string
  location?: string | null
  spent?: number
  notes?: string | null
}

export interface GRMStats {
  pipelineCounts: Record<GRMStatus, number>
  leadToSexRate: number
  leadToApo1Rate: number
  avgApoCountToSex: number
  avgSpentToSex: number
  avgDaysLeadToApo1: number
  totalGirls: number
  totalSpent: number
  activeGirls: number
}

export const GRM_STATUS_LABELS: Record<GRMStatus, string> = {
  lead: 'Lead',
  apo_1: 'Apo 1',
  apo_2: 'Apo 2',
  apo_3: 'Apo 3',
  apo_4: 'Apo 4',
  apo_5plus: 'Apo 5+',
  sex: 'Sex',
  ltr: 'LTR',
  graduate: '卒業',
}

export const GRM_STATUS_ORDER: GRMStatus[] = [
  'lead', 'apo_1', 'apo_2', 'apo_3', 'apo_4', 'apo_5plus', 'sex', 'ltr', 'graduate'
]
