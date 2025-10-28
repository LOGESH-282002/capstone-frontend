const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available (only on client side)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async oauthLogin(userData) {
    return this.request('/api/auth/oauth', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  // Posts endpoints
  async getPosts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/posts?${queryString}` : '/api/posts';
    return this.request(endpoint);
  }

  async getPost(id) {
    return this.request(`/api/posts/${id}`);
  }

  async createPost(postData) {
    return this.request('/api/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async updatePost(id, postData) {
    return this.request(`/api/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  }

  async deletePost(id) {
    return this.request(`/api/posts/${id}`, {
      method: 'DELETE',
    });
  }

  // Users endpoints
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/users?${queryString}` : '/api/users';
    return this.request(endpoint);
  }

  async getUser(id) {
    return this.request(`/api/users/${id}`);
  }

  async updateUser(id, userData) {
    return this.request(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id) {
    return this.request(`/api/users/${id}`, {
      method: 'DELETE',
    });
  }

  async getUserStats(id) {
    return this.request(`/api/users/${id}/stats`);
  }

  // Drafts endpoints
  async getDrafts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/drafts?${queryString}` : '/api/drafts';
    return this.request(endpoint);
  }

  async getDraft(id) {
    return this.request(`/api/drafts/${id}`);
  }

  async createDraft(draftData) {
    return this.request('/api/drafts', {
      method: 'POST',
      body: JSON.stringify(draftData),
    });
  }

  async updateDraft(id, draftData) {
    return this.request(`/api/drafts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(draftData),
    });
  }

  async deleteDraft(id) {
    return this.request(`/api/drafts/${id}`, {
      method: 'DELETE',
    });
  }

  async publishDraft(id, publishData = {}) {
    return this.request(`/api/drafts/${id}/publish`, {
      method: 'POST',
      body: JSON.stringify(publishData),
    });
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();
export default apiClient;

// Export individual methods for convenience
export const {
  register,
  login,
  getCurrentUser,
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserStats,
  getDrafts,
  getDraft,
  createDraft,
  updateDraft,
  deleteDraft,
  publishDraft,
} = apiClient;