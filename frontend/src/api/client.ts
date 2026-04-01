import axios from 'axios'

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

function transformKeys(data: unknown): unknown {
  if (Array.isArray(data)) {
    return data.map(transformKeys)
  }
  if (data !== null && typeof data === 'object' && !(data instanceof Date)) {
    return Object.fromEntries(
      Object.entries(data as Record<string, unknown>).map(([key, value]) => [
        snakeToCamel(key),
        transformKeys(value),
      ])
    )
  }
  return data
}

function transformKeysToSnake(data: unknown): unknown {
  if (Array.isArray(data)) {
    return data.map(transformKeysToSnake)
  }
  if (data !== null && typeof data === 'object' && !(data instanceof Date)) {
    return Object.fromEntries(
      Object.entries(data as Record<string, unknown>).map(([key, value]) => [
        camelToSnake(key),
        transformKeysToSnake(value),
      ])
    )
  }
  return data
}

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Convert camelCase request data/params to snake_case for the backend
api.interceptors.request.use((config) => {
  if (config.data) {
    config.data = transformKeysToSnake(config.data)
  }
  if (config.params) {
    config.params = transformKeysToSnake(config.params)
  }
  return config
})

// Convert snake_case response data to camelCase for the frontend
api.interceptors.response.use(
  (response) => {
    response.data = transformKeys(response.data)
    return response
  },
  (error) => {
    const message = error.response?.data?.detail || error.message
    console.error(`API Error: ${message}`)
    return Promise.reject(error)
  }
)

export default api
