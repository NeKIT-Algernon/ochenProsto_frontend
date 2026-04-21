import api from './client'
import type { Banner, DirectusListResponse, DirectusQueryParams } from './types'

export function getBanners(params?: DirectusQueryParams) {
  return api.get<DirectusListResponse<Banner>>('/items/banners', { params })
}
