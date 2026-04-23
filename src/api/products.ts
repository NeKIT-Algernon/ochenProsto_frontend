import api from './client'
import type { DirectusListResponse, DirectusQueryParams, DirectusSingletonResponse, Product } from './types'

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

export function getProductsByIds(productIds: number[], params?: DirectusQueryParams) {
  return api.get<DirectusListResponse<Product>>('/items/products', {
    params: {
      ...params,
      filter: {
        id: {
          _in: productIds,
        },
        ...(params?.filter ?? {}),
      },
    },
  })
}

export function getProductById(productId: number, params?: DirectusQueryParams) {
  return api.get<DirectusSingletonResponse<Product>>(`/items/products/${productId}`, {
    params,
  })
}
