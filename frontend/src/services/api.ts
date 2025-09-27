// PharmaChain API Client
// This service handles all API communications between the frontend and backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
  timestamp: string
}

export interface BatchData {
  tokenId: string
  drugName: string
  batchNumber: string
  manufacturer: string
  manufacturingDate: string
  expiryDate: string
  status: string
  quantity: number
  ipfsHash?: string
  qrCodeHash?: string
}

export interface StakeholderData {
  walletAddress: string
  name: string
  role: 'MANUFACTURER' | 'DISTRIBUTOR' | 'RETAILER' | 'HEALTHCARE_PROVIDER' | 'REGULATOR'
  licenseNumber: string
  location: string
  isActive: boolean
}

export interface AuthData {
  token: string
  refreshToken: string
  user: {
    id: string
    walletAddress: string
    role: string
    name: string
  }
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
    this.token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Add any additional headers from options
    if (options.headers) {
      Object.assign(headers, options.headers)
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Authentication
  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken')
    }
  }

  async login(walletAddress: string, signature: string): Promise<ApiResponse<AuthData>> {
    return this.request<AuthData>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, signature }),
    })
  }

  async logout(): Promise<ApiResponse> {
    const result = await this.request('/api/auth/logout', {
      method: 'POST',
    })
    this.clearToken()
    return result
  }

  async refreshToken(): Promise<ApiResponse<AuthData>> {
    return this.request<AuthData>('/api/auth/refresh', {
      method: 'POST',
    })
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse> {
    return this.request('/api/health')
  }

  // Batch Management
  async createBatch(batchData: Omit<BatchData, 'tokenId'>): Promise<ApiResponse<BatchData>> {
    return this.request<BatchData>('/api/batches', {
      method: 'POST',
      body: JSON.stringify(batchData),
    })
  }

  async getBatch(tokenId: string): Promise<ApiResponse<BatchData>> {
    return this.request<BatchData>(`/api/batches/${tokenId}`)
  }

  async getAllBatches(): Promise<ApiResponse<BatchData[]>> {
    return this.request<BatchData[]>('/api/batches')
  }

  async updateBatchStatus(
    tokenId: string, 
    status: string, 
    location?: string
  ): Promise<ApiResponse<BatchData>> {
    return this.request<BatchData>(`/api/batches/${tokenId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, location }),
    })
  }

  async transferBatch(
    tokenId: string, 
    toAddress: string, 
    notes?: string
  ): Promise<ApiResponse<BatchData>> {
    return this.request<BatchData>(`/api/batches/${tokenId}/transfer`, {
      method: 'POST',
      body: JSON.stringify({ toAddress, notes }),
    })
  }

  async verifyBatch(identifier: string): Promise<ApiResponse<BatchData>> {
    return this.request<BatchData>(`/api/batches/verify/${identifier}`)
  }

  async getBatchQRCode(tokenId: string): Promise<ApiResponse<{ qrCodeUrl: string }>> {
    return this.request<{ qrCodeUrl: string }>(`/api/batches/${tokenId}/qr`)
  }

  // Stakeholder Management
  async registerStakeholder(stakeholderData: StakeholderData): Promise<ApiResponse<StakeholderData>> {
    return this.request<StakeholderData>('/api/stakeholders', {
      method: 'POST',
      body: JSON.stringify(stakeholderData),
    })
  }

  async getStakeholder(walletAddress: string): Promise<ApiResponse<StakeholderData>> {
    return this.request<StakeholderData>(`/api/stakeholders/${walletAddress}`)
  }

  async getAllStakeholders(): Promise<ApiResponse<StakeholderData[]>> {
    return this.request<StakeholderData[]>('/api/stakeholders')
  }

  async updateStakeholder(
    walletAddress: string, 
    updates: Partial<StakeholderData>
  ): Promise<ApiResponse<StakeholderData>> {
    return this.request<StakeholderData>(`/api/stakeholders/${walletAddress}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  // File Upload (for IPFS)
  async uploadFile(file: File): Promise<ApiResponse<{ ipfsHash: string; url: string }>> {
    const formData = new FormData()
    formData.append('file', file)

    const headers: Record<string, string> = {}
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/upload`, {
        method: 'POST',
        headers,
        body: formData,
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error('File upload failed:', error)
      throw error
    }
  }

  // Analytics (optional)
  async getAnalytics(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.request('/api/analytics')
  }
}

// Create singleton instance
export const apiClient = new ApiClient()

export default apiClient