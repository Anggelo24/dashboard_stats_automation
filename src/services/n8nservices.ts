// src/services/n8nService.ts

const API_BASE_URL = '/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  total?: number;
}

// ==================== TYPES ====================

export interface WorkflowSummary {
  id: string;
  name: string;
  active: boolean;
  tags?: Array<{ id: string; name: string }>;
  updatedAt: string;
  createdAt: string;
}

export interface Workflow extends WorkflowSummary {
  nodes: any[];
  connections: any;
  settings: any;
}

export interface Execution {
  id: string;
  workflowId: string;
  startedAt: string;
  stoppedAt: string | null;
  finished: boolean;
  status: 'success' | 'error' | 'running' | 'waiting';
}

export interface DashboardMetrics {
  workflows: {
    total: number;
    active: number;
    paused: number;
    withErrors: number;
  };
  executions: {
    total: number;
    successful: number;
    failed: number;
    running: number;
    successRate: number;
    avgExecutionTime: string;
  };
  timeline: {
    [date: string]: {
      success: number;
      failed: number;
      total: number;
    };
  };
  topWorkflows: Array<{
    id: string;
    name: string;
    count: number;
    active: boolean;
  }>;
  lastUpdate: string;
}

export interface WorkflowMetrics {
  workflow: {
    id: string;
    name: string;
    active: boolean;
    tags?: Array<{ id: string; name: string }>;
  };
  metrics: {
    totalExecutions: number;
    successful: number;
    failed: number;
    successRate: number;
    lastExecution: string | null;
    lastStatus: 'success' | 'error' | 'running';
  };
  recentExecutions: Execution[];
}

// ==================== API FUNCTIONS ====================

class N8NService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ==================== WORKFLOWS ====================

  async getWorkflowsSummary(options?: {
    active?: boolean;
    limit?: number;
  }): Promise<ApiResponse<WorkflowSummary[]>> {
    const params = new URLSearchParams();
    if (options?.active !== undefined) params.append('active', options.active.toString());
    if (options?.limit) params.append('limit', options.limit.toString());

    return this.request<WorkflowSummary[]>(
      `/workflows/summary?${params.toString()}`
    );
  }

  async getWorkflow(id: string): Promise<ApiResponse<Workflow>> {
    return this.request<Workflow>(`/workflows/${id}`);
  }

  async activateWorkflow(id: string): Promise<ApiResponse<Workflow>> {
    return this.request<Workflow>(`/workflows/${id}/activate`, {
      method: 'PATCH',
    });
  }

  async deactivateWorkflow(id: string): Promise<ApiResponse<Workflow>> {
    return this.request<Workflow>(`/workflows/${id}/deactivate`, {
      method: 'PATCH',
    });
  }

  // ==================== EXECUTIONS ====================

  async getExecutions(options?: {
    workflowId?: string;
    status?: 'success' | 'error' | 'waiting' | 'running';
    limit?: number;
    includeData?: boolean;
  }): Promise<ApiResponse<Execution[]>> {
    const params = new URLSearchParams();
    if (options?.workflowId) params.append('workflowId', options.workflowId);
    if (options?.status) params.append('status', options.status);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.includeData !== undefined) {
      params.append('includeData', options.includeData.toString());
    }

    return this.request<Execution[]>(`/executions?${params.toString()}`);
  }

  async getExecution(id: string, includeData = true): Promise<ApiResponse<Execution>> {
    return this.request<Execution>(
      `/executions/${id}?includeData=${includeData}`
    );
  }

  // ==================== METRICS ====================

  async getDashboardMetrics(): Promise<ApiResponse<DashboardMetrics>> {
    return this.request<DashboardMetrics>('/metrics/dashboard');
  }

  async getWorkflowMetrics(
    workflowId: string,
    days = 7
  ): Promise<ApiResponse<WorkflowMetrics>> {
    return this.request<WorkflowMetrics>(
      `/metrics/workflow/${workflowId}?days=${days}`
    );
  }

  // ==================== HEALTH ====================

  async checkHealth(): Promise<ApiResponse<any>> {
    return this.request<any>('/health');
  }
}

export const n8nService = new N8NService();
export default n8nService;