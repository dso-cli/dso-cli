interface AuthStatus {
  authenticated: boolean
  user?: {
    login?: string
    username?: string
    name?: string
    avatar_url?: string
  }
}

interface Repo {
  id: number
  name: string
  full_name?: string
  description?: string
  private: boolean
  language?: string
  stargazers_count?: number
  star_count?: number
  updated_at: string
  clone_url?: string
  ssh_url?: string
}

export const repoService = {
  async authenticate(provider: 'github' | 'gitlab', token: string): Promise<boolean> {
    const response = await fetch(`/api/repos/${provider}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Important for cookies
      body: JSON.stringify({ token })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Authentication failed')
    }
    
    const data = await response.json()
    return data.success === true
  },

  async checkAuth(provider: 'github' | 'gitlab'): Promise<AuthStatus> {
    try {
      const response = await fetch(`/api/repos/${provider}/auth/status`, {
        method: 'GET',
        credentials: 'include' // Important for cookies
      })
      
      if (!response.ok) {
        return { authenticated: false }
      }
      
      return await response.json()
    } catch (error) {
      return { authenticated: false }
    }
  },

  async disconnect(provider: 'github' | 'gitlab'): Promise<void> {
    const response = await fetch(`/api/repos/${provider}/auth/disconnect`, {
      method: 'POST',
      credentials: 'include' // Important for cookies
    })
    
    if (!response.ok) {
      throw new Error('Failed to disconnect')
    }
  },

  async listRepos(provider: 'github' | 'gitlab'): Promise<Repo[]> {
    const response = await fetch(`/api/repos/${provider}/list`, {
      method: 'GET',
      credentials: 'include' // Important for cookies
    })
    
    if (!response.ok) {
      throw new Error('Failed to list repositories')
    }
    
    const data = await response.json()
    return data.repos || []
  },

  async cloneAndScan(provider: 'github' | 'gitlab', repo: Repo): Promise<any> {
    const response = await fetch(`/api/repos/${provider}/clone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Important for cookies
      body: JSON.stringify({
        repo: repo.full_name || repo.name,
        clone_url: repo.clone_url || repo.ssh_url
      })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to clone repository')
    }
    
    return await response.json()
  }
}

// Store tokens in sessionStorage (not localStorage for security)
export const tokenStorage = {
  set(provider: 'github' | 'gitlab', token: string): void {
    sessionStorage.setItem(`${provider}_token`, token)
  },
  
  get(provider: 'github' | 'gitlab'): string | null {
    return sessionStorage.getItem(`${provider}_token`)
  },
  
  remove(provider: 'github' | 'gitlab'): void {
    sessionStorage.removeItem(`${provider}_token`)
  }
}

