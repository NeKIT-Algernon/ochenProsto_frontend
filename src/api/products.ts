import api from './client'
import type { DirectusListResponse, DirectusQueryParams, Product } from './types'

export function getProductsByCategory(categoryId: number, params?: DirectusQueryParams) {
  return api.get<DirectusListResponse<Product>>('/items/products', {
    params: {
      ...params,
      filter: {
        category: {
          _eq: categoryId,
        },
        ...(params?.filter ?? {}),
      },
    },
  })
}
