// lib/supabase/queries.ts
import { supabase } from './client'

// ========== ПОЛЬЗОВАТЕЛИ (user_profiles) ==========
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  
  return { data, error }
}

export const updateUserProfile = async (userId: string, updates: {
  name?: string
  company?: string
  phone?: string
  position?: string
  about?: string
  avatar_url?: string
  website?: string
  preferences?: any
  notification_settings?: any
}) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .maybeSingle()
  
  return { data, error }
}

// ========== ВЫСТАВКИ ==========
export const getExhibitions = async (filters?: {
  category?: string
  status?: string
  is_public?: boolean
  limit?: number
  organizer_id?: string
}) => {
  let query = supabase
    .from('exhibitions')
    .select(`
      *,
      organizer:organizer_id (
        name,
        company,
        email
      )
    `)
    .order('created_at', { ascending: false })

  if (filters?.category) query = query.eq('category', filters.category)
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.is_public !== undefined) query = query.eq('is_public', filters.is_public)
  if (filters?.organizer_id) query = query.eq('organizer_id', filters.organizer_id)
  if (filters?.limit) query = query.limit(filters.limit)

  const { data, error } = await query
  return { data, error }
}

export const getExhibitionById = async (exhibitionId: string) => {
  const { data, error } = await supabase
    .from('exhibitions')
    .select(`
      *,
      organizer:organizer_id (
        name,
        company,
        email
      )
    `)
    .eq('id', exhibitionId)
    .maybeSingle()
  
  return { data, error }
}

export const createExhibition = async (exhibitionData: {
  organizer_id: string
  title: string
  description: string
  start_date: string
  end_date: string
  category: string
  is_public: boolean
  require_registration: boolean
  tags: string[]
}) => {
  const { data, error } = await supabase
    .from('exhibitions')
    .insert([{
      ...exhibitionData,
      status: 'draft',
      visitor_count: 0,
      rating: 0
    }])
    .select()
    .single()
  
  return { data, error }
}

export const updateExhibition = async (exhibitionId: string, updates: Partial<{
  title: string
  description: string
  start_date: string
  end_date: string
  category: string
  status: string
  is_public: boolean
  require_registration: boolean
  tags: string[]
  logo_url: string | null
}>) => {
  const { data, error } = await supabase
    .from('exhibitions')
    .update(updates)
    .eq('id', exhibitionId)
    .select()
    .single()
  
  return { data, error }
}

// ========== ЭКСПОНЕНТЫ ==========

export const getExhibitorsByUser = async (userId: string) => {
  const { data, error } = await supabase
    .from('exhibitors')
    .select(`
      id,
      status,
      company_name,
      description,
      contact_email,
      contact_phone,
      website,
      exhibition:exhibition_id (
        id,
        title,
        start_date,
        end_date,
        status
      ),
      booths (
        id,
        number,
        name,
        status
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return { data, error }
}

export const getExhibitorsByExhibition = async (exhibitionId: string) => {
  const { data, error } = await supabase
    .from('exhibitors')
    .select(`
      *,
      user_profile:user_id (
        name,
        email,
        company,
        avatar_url
      )
    `)
    .eq('exhibition_id', exhibitionId)
    .eq('status', 'approved')
  
  return { data, error }
}

export const applyAsExhibitor = async (applicationData: {
  user_id: string
  exhibition_id: string
  company_name: string
  description: string
  website?: string
  contact_email: string
  contact_phone?: string
  booth_number?: string
}) => {
  const { data, error } = await supabase
    .from('exhibitors')
    .insert([{
      ...applicationData,
      status: 'pending'
    }])
    .select()
    .single()
  
  return { data, error }
}

// ========== СТЕНДЫ ==========
export const getBoothsByExhibition = async (exhibitionId: string) => {
  const { data, error } = await supabase
    .from('booths')
    .select(`
      *,
      exhibitor:exhibitor_id (
        id,
        company_name,
        description,
        contact_email,
        website,
        user_profile:user_id (
          name,
          email,
          avatar_url
        )
      )
    `)
    .eq('exhibition_id', exhibitionId)
    .order('number')
  
  return { data, error }
}

export const getBoothById = async (boothId: string) => {
  const { data, error } = await supabase
    .from('booths')
    .select(`
      *,
      exhibitor:exhibitor_id (
        *,
        user_profile:user_id (
          name,
          email,
          avatar_url
        )
      ),
      exhibition:exhibition_id (*)
    `)
    .eq('id', boothId)
    .maybeSingle()
  
  return { data, error }
}

export const createBooth = async (boothData: {
  exhibition_id: string
  number: string
  name: string
  description?: string
  category?: string
  tags?: string[]
}) => {
  const { data, error } = await supabase
    .from('booths')
    .insert([{
      ...boothData,
      status: 'available',
      visitor_count: 0,
      rating: 0
    }])
    .select()
    .single()
  
  return { data, error }
}

export const assignBoothToExhibitor = async (boothId: string, exhibitorId: string) => {
  const { data, error } = await supabase
    .from('booths')
    .update({
      exhibitor_id: exhibitorId,
      status: 'occupied'
    })
    .eq('id', boothId)
    .select()
    .single()
  
  return { data, error }
}

// ========== ПОСЕТИТЕЛИ ==========
export const registerForExhibition = async (registrationData: {
  user_id: string
  exhibition_id: string
}) => {
  const { data, error } = await supabase
    .from('exhibition_visitors')
    .insert([{
      ...registrationData,
      status: 'registered'
    }])
    .select()
    .single()
  
  return { data, error }
}

export const getVisitorRegistrations = async (userId: string) => {
  const { data, error } = await supabase
    .from('exhibition_visitors')
    .select(`
      *,
      exhibition:exhibition_id (
        id,
        title,
        description,
        start_date,
        end_date,
        category,
        status,
        visitor_count,
        rating,
        logo_url,
        tags
      )
    `)
    .eq('user_id', userId)
    .order('registered_at', { ascending: false })
  
  return { data, error }
}

export const updateVisitStatus = async (registrationId: string, status: 'attended' | 'cancelled') => {
  const { data, error } = await supabase
    .from('exhibition_visitors')
    .update({ status })
    .eq('id', registrationId)
    .select()
    .single()
  
  return { data, error }
}

// ========== ВСТРЕЧИ ==========
export const getMeetings = async (userId: string, role: 'visitor' | 'exhibitor') => {
  const column = role === 'visitor' ? 'visitor_id' : 'exhibitor_id'
  
  const { data, error } = await supabase
    .from('meetings')
    .select(`
      *,
      exhibition:exhibition_id (
        id,
        title
      ),
      visitor:visitor_id (
        name,
        email,
        avatar_url
      ),
      exhibitor:exhibitor_id (
        id,
        company_name,
        contact_email,
        user_profile:user_id (
          name,
          email
        )
      )
    `)
    .eq(column, userId)
    .order('scheduled_time', { ascending: true })
  
  return { data, error }
}

export const createMeeting = async (meetingData: {
  exhibition_id: string
  visitor_id: string
  exhibitor_id: string
  title: string
  description?: string
  scheduled_time: string
  duration?: number
  meeting_url?: string
}) => {
  const { data, error } = await supabase
    .from('meetings')
    .insert([{
      ...meetingData,
      status: 'scheduled',
      duration: meetingData.duration || 30
    }])
    .select()
    .single()
  
  return { data, error }
}

export const updateMeetingStatus = async (meetingId: string, status: 'completed' | 'cancelled' | 'rescheduled') => {
  const { data, error } = await supabase
    .from('meetings')
    .update({ status })
    .eq('id', meetingId)
    .select()
    .single()
  
  return { data, error }
}

// ========== МАТЕРИАЛЫ ==========
export const getMaterialsByExhibitor = async (exhibitorId: string) => {
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .eq('exhibitor_id', exhibitorId)
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export const createMaterial = async (materialData: {
  exhibitor_id: string
  name: string
  description?: string
  file_url: string
  file_type?: string
}) => {
  const { data, error } = await supabase
    .from('materials')
    .insert([{
      ...materialData,
      downloads: 0
    }])
    .select()
    .single()
  
  return { data, error }
}

export const incrementMaterialDownload = async (materialId: string) => {
  const { data, error } = await supabase.rpc('increment_download_count', {
    material_id: materialId
  })
  
  return { data, error }
}

// ========== МЕРОПРИЯТИЯ ==========
export const getEventsByExhibition = async (exhibitionId: string) => {
  const { data, error } = await supabase
    .from('exhibition_events')
    .select('*')
    .eq('exhibition_id', exhibitionId)
    .eq('is_published', true)
    .order('start_time', { ascending: true })
  
  return { data, error }
}

export const registerForEvent = async (userId: string, eventId: string) => {
  const { data, error } = await supabase
    .from('event_registrations')
    .insert([{
      user_id: userId,
      event_id: eventId,
      status: 'registered'
    }])
    .select()
    .single()
  
  return { data, error }
}

// ========== АКТИВНОСТЬ ==========
export const logActivity = async (activityData: {
  user_id?: string
  exhibition_id: string
  action_type: 'view' | 'download' | 'meeting' | 'registration' | 'visit'
  target_id?: string
  target_type?: string
  details?: any
}) => {
  const { data, error } = await supabase
    .from('activities')
    .insert([activityData])
    .select()
    .single()
  
  return { data, error }
}

export const getExhibitionAnalytics = async (exhibitionId: string) => {
  const { data, error } = await supabase
    .from('activities')
    .select(`
      *,
      user_profile:user_id (
        name,
        email,
        role
      )
    `)
    .eq('exhibition_id', exhibitionId)
    .order('created_at', { ascending: false })
  
  return { data, error }
}

// ========== ПОДПИСКИ И ПЛАТЕЖИ ==========
export const updateSubscription = async (userId: string, subscriptionData: any) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      subscription_data: subscriptionData,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select()
    .maybeSingle()
  
  return { data, error }
}

export const addPaymentHistory = async (userId: string, payment: any) => {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('payment_history')
    .eq('user_id', userId)
    .maybeSingle()
  
  const currentHistory = profile?.payment_history || []
  const newHistory = [...currentHistory, payment]
  
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      payment_history: newHistory,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select()
    .maybeSingle()
  
  return { data, error }
}

// ========== ПАВИЛЬОНЫ ==========
export const getPavilionsByExhibition = async (exhibitionId: string) => {
  const { data, error } = await supabase
    .from('pavilions')
    .select(`
      *,
      booths (
        id,
        number,
        name,
        description,
        status,
        visitor_count,
        rating,
        category,
        tags,
        grid_row,
        grid_column,
        custom_x,
        custom_y,
        exhibitor:exhibitor_id (
          company_name,
          description,
          contact_email,
          website
        )
      )
    `)
    .eq('exhibition_id', exhibitionId)
    .order('position_x', { ascending: true })
    .order('position_y', { ascending: true })
  
  return { data, error }
}

export const createPavilion = async (pavilionData: {
  exhibition_id: string
  name: string
  code: string
  rows?: number
  columns?: number
  position_x?: number
  position_y?: number
  width?: number
  height?: number
  background_color?: string
  border_color?: string
  layout_type?: 'grid' | 'custom'
  settings?: any
}) => {
  const { data, error } = await supabase
    .from('pavilions')
    .insert([{
      ...pavilionData,
      rows: pavilionData.rows || 3,
      columns: pavilionData.columns || 4,
      position_x: pavilionData.position_x || 0,
      position_y: pavilionData.position_y || 0,
      width: pavilionData.width || 400,
      height: pavilionData.height || 300,
      background_color: pavilionData.background_color || '#f9fafb',
      border_color: pavilionData.border_color || '#e5e7eb',
      layout_type: pavilionData.layout_type || 'grid',
      settings: pavilionData.settings || {
        showBoothNumbers: true,
        showLabels: true,
        density: 'normal'
      }
    }])
    .select()
    .single()
  
  return { data, error }
}

export const generateBoothsForPavilion = async (pavilionId: string) => {
  const { data: pavilion } = await supabase
    .from('pavilions')
    .select('*')
    .eq('id', pavilionId)
    .single()
  
  if (!pavilion) return { error: 'Pavilion not found' }
  
  const booths = []
  for (let row = 1; row <= pavilion.rows; row++) {
    for (let col = 1; col <= pavilion.columns; col++) {
      booths.push({
        exhibition_id: pavilion.exhibition_id,
        pavilion_id: pavilionId,
        grid_row: row,
        grid_column: col,
        name: `Стенд ${pavilion.code}${row}${col}`,
        description: `Стенд в павильоне ${pavilion.name}`,
        status: 'available',
        visitor_count: 0,
        rating: 0,
        tags: []
      })
    }
  }
  
  const { data, error } = await supabase
    .from('booths')
    .insert(booths)
    .select()
  
  return { data, error }
}

// ========== ЗАЯВКИ ЭКСПОНЕНТОВ ==========
export const getExhibitorApplications = async (exhibitionId: string) => {
  const { data, error } = await supabase
    .from('exhibitors')
    .select(`
      *,
      user_profile:user_id (
        name,
        email,
        company
      )
    `)
    .eq('exhibition_id', exhibitionId)
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export const updateExhibitorStatus = async (exhibitorId: string, status: 'pending' | 'approved' | 'rejected') => {
  const { data, error } = await supabase
    .from('exhibitors')
    .update({ status })
    .eq('id', exhibitorId)
    .select()
    .single()
  
  return { data, error }
}



