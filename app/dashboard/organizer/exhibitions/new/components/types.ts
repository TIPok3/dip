// app/dashboard/organizer/exhibitions/new/components/types.ts

export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface Pavilion {
  id: string
  name: string
  position: Position
  size: Size
  color: string
  boothRows: number
  boothColumns: number
  // boothCount вычисляется как boothRows * boothColumns
}

export interface ExhibitionFormData {
  title: string
  description: string
  start_date: string
  end_date: string
  category: string
  logo_url: string | null
  tags: string[]
  pavilions: Pavilion[]
  is_public: boolean
  require_registration: boolean
}