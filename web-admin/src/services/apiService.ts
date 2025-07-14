const API_BASE_URL = window.location.origin + '/api';

export const API = {
  get: async (endpoint: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || '요청 실패');
      }
      return data;
    } catch (error) {
      console.error('API GET 오류:', error);
      throw error;
    }
  },

  post: async (endpoint: string, data: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || '요청 실패');
      }
      return responseData;
    } catch (error) {
      console.error('API POST 오류:', error);
      throw error;
    }
  },

  put: async (endpoint: string, data: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || '요청 실패');
      }
      return responseData;
    } catch (error) {
      console.error('API PUT 오류:', error);
      throw error;
    }
  },

  delete: async (endpoint: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || '요청 실패');
      }
      return data;
    } catch (error) {
      console.error('API DELETE 오류:', error);
      throw error;
    }
  },

  patch: async (endpoint: string, data: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || '요청 실패');
      }
      return responseData;
    } catch (error) {
      console.error('API PATCH 오류:', error);
      throw error;
    }
  }
};
