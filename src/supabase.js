import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ── Sessions ──────────────────────────────────────────────────────────────────

export async function loadSessions() {
  if (!SUPABASE_URL) return null
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('date', { ascending: false })
  if (error) { console.error('loadSessions:', error); return null }
  return data.map(row => ({ ...row, lifts: row.lifts || [] }))
}

export async function saveSession(session) {
  if (!SUPABASE_URL) return null
  const { data, error } = await supabase
    .from('sessions')
    .upsert({
      id: session.id,
      date: session.date,
      time_of_day: session.timeOfDay,
      preworkout: session.preworkout,
      session_type: session.sessionType,
      muscle_groups: session.muscleGroups,
      hrv: session.hrv ? parseInt(session.hrv) : null,
      avg_hr: session.avgHR || null,
      peak_hr: session.peakHR || null,
      intensity_rating: session.intensityRating || null,
      lifts: session.lifts,
      notes: session.notes || '',
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' })
  if (error) { console.error('saveSession:', error); return null }
  return data
}

export async function deleteSession(id) {
  if (!SUPABASE_URL) return null
  const { error } = await supabase.from('sessions').delete().eq('id', id)
  if (error) console.error('deleteSession:', error)
}

// Map DB row → app session shape
export function dbToSession(row) {
  return {
    id: row.id,
    date: row.date,
    timeOfDay: row.time_of_day,
    preworkout: row.preworkout,
    sessionType: row.session_type,
    muscleGroups: row.muscle_groups || [],
    hrv: row.hrv,
    avgHR: row.avg_hr,
    peakHR: row.peak_hr,
    intensityRating: row.intensity_rating,
    lifts: row.lifts || [],
    notes: row.notes || '',
  }
}
