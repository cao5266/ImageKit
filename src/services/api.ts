/**
 * ImageKit API 服务
 * 前后端分离架构 - API 调用封装
 */

// API 基础地址
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// 获取认证 Token
const getAuthToken = (): string | null => {
  return localStorage.getItem('imagekit_token');
};

// 通用请求方法
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  // 如果不是 FormData，添加 Content-Type
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // 添加认证 Token
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: 'Request failed',
      message: response.statusText
    }));
    throw new Error(error.message || error.error);
  }

  return response.json();
}

// ==================== 认证相关 ====================

export const authAPI = {
  /**
   * 发起 Google 登录
   */
  loginWithGoogle: () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  },

  /**
   * 获取当前用户信息
   */
  getCurrentUser: async () => {
    return request<{ user: any }>('/api/auth/me');
  },

  /**
   * 退出登录
   */
  logout: async () => {
    const result = await request<{ message: string }>('/api/auth/logout', {
      method: 'POST',
    });
    localStorage.removeItem('imagekit_token');
    return result;
  },

  /**
   * 保存 Token（从 OAuth 回调获取）
   */
  saveToken: (token: string) => {
    localStorage.setItem('imagekit_token', token);
  },

  /**
   * 检查是否已登录
   */
  isAuthenticated: (): boolean => {
    return !!getAuthToken();
  },
};

// ==================== 用户相关 ====================

export const userAPI = {
  /**
   * 获取用户信息
   */
  getProfile: async () => {
    return request<{ user: any }>('/api/user/profile');
  },

  /**
   * 更新用户信息
   */
  updateProfile: async (data: { name?: string; avatar?: string }) => {
    return request<{ success: boolean; user: any }>('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * 获取点数余额
   */
  getCredits: async () => {
    return request<{ credits: number; vipLevel: number }>('/api/user/credits');
  },
};

// ==================== 上传相关 ====================

export const uploadAPI = {
  /**
   * 上传图片到 OSS
   */
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    return request<{
      success: boolean;
      url: string;
      ossPath: string;
      filename: string;
      size: number;
      mimeType: string;
    }>('/api/upload', {
      method: 'POST',
      body: formData,
    });
  },

  /**
   * 获取签名 URL
   */
  getSignedUrl: async (ossPath: string, expires = 3600) => {
    return request<{ url: string }>('/api/upload/sign-url', {
      method: 'POST',
      body: JSON.stringify({ ossPath, expires }),
    });
  },
};

// ==================== 图片处理相关 ====================

export const processAPI = {
  /**
   * 去水印
   */
  removeWatermark: async (params: { imageUrl: string; ossPath?: string; maskUrl?: string }) => {
    return request<{
      success: boolean;
      message: string;
      imageId: string;
      resultUrl?: string;
      status: string;
      remainingCredits: number;
    }>('/api/process/remove-watermark', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  /**
   * 获取处理状态
   */
  getProcessStatus: async (imageId: string) => {
    return request<{
      status: 'pending' | 'processing' | 'completed' | 'failed';
      processedUrl?: string;
      errorMessage?: string;
    }>(`/api/process/status/${imageId}`);
  },

  /**
   * 获取处理历史
   */
  getHistory: async (page = 1, limit = 20) => {
    return request<{
      images: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/api/process/history?page=${page}&limit=${limit}`);
  },
};

// ==================== 健康检查 ====================

export const healthAPI = {
  /**
   * 检查服务器状态
   */
  check: async () => {
    return request<{
      status: string;
      message: string;
      timestamp: string;
      version: string;
    }>('/api/health');
  },
};

// 默认导出所有 API
export default {
  auth: authAPI,
  user: userAPI,
  upload: uploadAPI,
  process: processAPI,
  health: healthAPI,
};
