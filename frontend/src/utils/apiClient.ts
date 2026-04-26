import axios, { AxiosError, AxiosInstance } from 'axios'

interface ApiErrorResponse {
  detail?: string | { msg: string }[]
  message?: string
  error?: string
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

class ApiClient {
  private instance: AxiosInstance
  private token: string | null = null

  constructor(baseURL = 'http://localhost:8000') {
    this.instance = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor for auth
    this.instance.interceptors.request.use(config => {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Response interceptor for errors
    this.instance.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          // Clear auth and redirect to login
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/login'
        }
        throw this.formatError(error)
      }
    )
  }

  private formatError(error: AxiosError<ApiErrorResponse>): ApiError {
    const status = error.response?.status || 500
    const data = error.response?.data

    let message = 'An error occurred'
    if (typeof data?.detail === 'string') {
      message = data.detail
    } else if (Array.isArray(data?.detail)) {
      message = data.detail[0]?.msg || message
    } else if (data?.message) {
      message = data.message
    } else if (data?.error) {
      message = data.error
    } else if (error.message) {
      message = error.message
    }

    return new ApiError(status, message, error.response?.data)
  }

  async get<T>(url: string, config?: any): Promise<T> {
    try {
      const response = await this.instance.get<T>(url, config)
      return response.data
    } catch (error) {
      throw error instanceof ApiError ? error : this.formatError(error as AxiosError)
    }
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await this.instance.post<T>(url, data, config)
      return response.data
    } catch (error) {
      throw error instanceof ApiError ? error : this.formatError(error as AxiosError)
    }
  }

  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await this.instance.put<T>(url, data, config)
      return response.data
    } catch (error) {
      throw error instanceof ApiError ? error : this.formatError(error as AxiosError)
    }
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    try {
      const response = await this.instance.delete<T>(url, config)
      return response.data
    } catch (error) {
      throw error instanceof ApiError ? error : this.formatError(error as AxiosError)
    }
  }

  setToken(token: string | null) {
    this.token = token
  }
}

export const api = new ApiClient()
