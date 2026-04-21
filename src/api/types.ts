export interface DirectusListResponse<T> {
  data: T[]
}

export interface DirectusSingletonResponse<T> {
  data: T
}

export interface DirectusQueryParams {
  fields?: string | string[]
  filter?: Record<string, unknown>
  sort?: string | string[]
  limit?: number
  page?: number
  search?: string
  deep?: Record<string, unknown>
  [key: string]: unknown
}

export interface Category {
  id: number
  name: string
  products?: number[] | Product[]
}

export interface Product {
  id: number
  category: number | Category
  name: string
  photo: string | null
  weight: number
  count: number
  description: string
  ingridients: string
  calories: number
  proteins: number
  fats: number
  carbs: number
  price: number
  redprice: number
  isHidden: boolean
  isAvailable: boolean
}

export interface Banner {
  id: number
  sort: number
  name: string
  primary_photo: string | null
  mobile_photo: string | null
}

export interface SiteSettings {
  id: number
  primary_phone: string
  free_delivery_amount: number
  start_of_work: string
  end_of_work: string
  VK_link: string
  warning_text: string
  isWarning: boolean
  isClosed: boolean
}
