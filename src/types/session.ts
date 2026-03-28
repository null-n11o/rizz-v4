export interface Session {
  id: string
  userId: string
  sessionDate: string
  startTime: string | null
  location: string | null
  approached: number
  getContact: number
  instantDate: number
  instantCv: number
  notes: string | null
  isFinalized: boolean
  migratedFromRecordId: string | null
  createdAt: string
  updatedAt: string
}

export interface SessionInsert {
  userId: string
  sessionDate: string
  startTime?: string | null
  location?: string | null
  approached?: number
  getContact?: number
  instantDate?: number
  instantCv?: number
  notes?: string | null
}

export interface SessionUpdate {
  startTime?: string | null
  location?: string | null
  approached?: number
  getContact?: number
  instantDate?: number
  instantCv?: number
  notes?: string | null
  isFinalized?: boolean
}
