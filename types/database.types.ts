/**
 * Lightweight app-level table shapes for GrouPulse.
 * These are intentionally framework-agnostic interfaces you can use across UI and server code.
 *
 * Note: If you later generate Supabase `Database` types from your actual Postgres schema,
 * you can replace these with the generated types and keep your app code strongly typed.
 */

export type UUID = string
export type ISODateString = string

export interface Group {
  id: UUID
  created_at: ISODateString
  updated_at?: ISODateString | null

  /** Therapist/owner user id (Supabase auth) */
  owner_id: UUID

  name: string
  description?: string | null

  /** Optional scheduling metadata */
  timezone?: string | null
  meeting_days?: string[] | null
  meeting_time?: string | null

  is_archived?: boolean | null
}

export interface Participant {
  id: UUID
  created_at: ISODateString
  updated_at?: ISODateString | null

  group_id: UUID

  first_name: string
  last_name?: string | null
  preferred_name?: string | null

  email?: string | null
  phone?: string | null

  /** Admin-facing metadata */
  status?: 'active' | 'inactive' | 'waitlisted' | 'discharged' | null
  joined_at?: ISODateString | null
  discharged_at?: ISODateString | null

  /** Emergency/contact & misc */
  notes?: string | null
}

export interface Session {
  id: UUID
  created_at: ISODateString
  updated_at?: ISODateString | null

  group_id: UUID

  /** When the session occurred (or is scheduled) */
  starts_at: ISODateString
  ends_at?: ISODateString | null

  topic?: string | null
  summary?: string | null

  status?: 'scheduled' | 'completed' | 'cancelled' | null
}

export interface IndividualNote {
  id: UUID
  created_at: ISODateString
  updated_at?: ISODateString | null

  group_id: UUID
  participant_id: UUID
  session_id?: UUID | null

  /**
   * Clinical note content (consider encrypting at rest or using RLS + strict policies).
   * Keep this as plain text in the app type; storage decisions happen in the DB.
   */
  content: string

  /** Optional structured fields */
  mood_rating?: number | null
  risk_level?: 'none' | 'low' | 'moderate' | 'high' | null

  is_private?: boolean | null
}

export interface DatabaseTables {
  groups: Group
  participants: Participant
  sessions: Session
  individual_notes: IndividualNote
}

