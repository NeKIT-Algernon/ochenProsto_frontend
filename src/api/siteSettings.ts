import api from './client'
import type { DirectusQueryParams, DirectusSingletonResponse, SiteSettings } from './types'

export async function getSiteSettings(params?: DirectusQueryParams) {
  const response = await api.get<DirectusSingletonResponse<SiteSettings>>('/items/site_settings/', {
    params,
  })

  return response.data.data
}
