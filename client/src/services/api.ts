import { AnalysisResult, DashboardStats } from '../types';

const BASE_URL = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = 'An unexpected error occurred';
    try {
      const data = await res.json();
      errorMsg = data.error || errorMsg;
    } catch {
      errorMsg = res.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  // Analyze Message
  analyzeMessage: async (text: string, channel?: string): Promise<AnalysisResult> => {
    const res = await fetch(`${BASE_URL}/analyze/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, channel })
    });
    return handleResponse<AnalysisResult>(res);
  },

  // Analyze URL
  analyzeUrl: async (url: string, contextText?: string): Promise<AnalysisResult> => {
    const res = await fetch(`${BASE_URL}/analyze/url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, contextText })
    });
    return handleResponse<AnalysisResult>(res);
  },

  // Analyze QR
  analyzeQr: async (qrData: string, userContext?: string): Promise<AnalysisResult> => {
    const res = await fetch(`${BASE_URL}/analyze/qr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qrData, userContext })
    });
    return handleResponse<AnalysisResult>(res);
  },

  // Analyze Transaction
  analyzeTransaction: async (data: {
    amount: number;
    receiverUpi: string;
    merchantCategory?: string;
    transactionDescription?: string;
    isNewRecipient: boolean;
    isUserInitiated: boolean;
    suspiciousMessageReceived: boolean;
  }): Promise<AnalysisResult> => {
    const res = await fetch(`${BASE_URL}/analyze/transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<AnalysisResult>(res);
  },

  // Analyze Context
  analyzeContext: async (
    scenarioDescription: string,
    supportingData?: string
  ): Promise<AnalysisResult> => {
    const res = await fetch(`${BASE_URL}/analyze/context`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenarioDescription, supportingData })
    });
    return handleResponse<AnalysisResult>(res);
  },

  // History
  getHistory: async (params?: {
    search?: string;
    classification?: string;
    threatType?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ analyses: AnalysisResult[]; total: number }> => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.classification && params.classification !== 'ALL')
      query.append('classification', params.classification);
    if (params?.threatType && params.threatType !== 'ALL')
      query.append('threatType', params.threatType);
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.offset) query.append('offset', String(params.offset));

    const res = await fetch(`${BASE_URL}/history?${query.toString()}`);
    return handleResponse<{ analyses: AnalysisResult[]; total: number }>(res);
  },

  getAnalysisById: async (id: string): Promise<AnalysisResult> => {
    const res = await fetch(`${BASE_URL}/history/${id}`);
    return handleResponse<AnalysisResult>(res);
  },

  deleteAnalysis: async (id: string): Promise<{ message: string }> => {
    const res = await fetch(`${BASE_URL}/history/${id}`, {
      method: 'DELETE'
    });
    return handleResponse<{ message: string }>(res);
  },

  clearHistory: async (): Promise<{ message: string }> => {
    const res = await fetch(`${BASE_URL}/history`, {
      method: 'DELETE'
    });
    return handleResponse<{ message: string }>(res);
  },

  // Stats
  getStats: async (): Promise<DashboardStats> => {
    const res = await fetch(`${BASE_URL}/stats`);
    return handleResponse<DashboardStats>(res);
  },

  // Health
  getHealth: async (): Promise<any> => {
    const res = await fetch(`${BASE_URL}/health`);
    return handleResponse<any>(res);
  }
};
