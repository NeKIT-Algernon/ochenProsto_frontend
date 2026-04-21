import api from './client'
import type { Category, DirectusListResponse, DirectusQueryParams } from './types'

export function getCategories(params?: DirectusQueryParams) {
  return api.get<DirectusListResponse<Category>>('/items/categories', { params })
}
