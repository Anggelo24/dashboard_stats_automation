// src/types/n8n.types.ts

/**
 * N8N API Type Definitions
 * These types match the N8N API responses
 */

export interface N8NTag {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface N8NWorkflowSettings {
  saveDataErrorExecution?: string;
  saveDataSuccessExecution?: string;
  saveExecutionProgress?: boolean;
  saveManualExecutions?: boolean;
  callerPolicy?: string;
  errorWorkflow?: string;
  timezone?: string;
}

export interface N8NNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, any>;
  credentials?: Record<string, any>;
}

export interface N8NConnection {
  [key: string]: {
    [key: string]: Array<{
      node: string;
      type: string;
      index: number;
    }>;
  };
}

export interface N8NWorkflow {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  nodes: N8NNode[];
  connections: N8NConnection;
  settings?: N8NWorkflowSettings;
  staticData?: any;
  tags?: N8NTag[];
  versionId?: string;
  meta?: {
    instanceId?: string;
  };
}

export interface N8NExecution {
  id: string;
  finished: boolean;
  mode: 'manual' | 'trigger' | 'webhook' | 'internal';
  retryOf?: string;
  retrySuccessId?: string;
  startedAt: string;
  stoppedAt: string | null;
  workflowId: string;
  workflowData?: {
    id: string;
    name: string;
  };
  data?: {
    resultData: {
      runData: Record<string, any>;
      error?: {
        message: string;
        stack?: string;
      };
    };
    executionData?: any;
    startData?: any;
  };
  waitTill?: string | null;
  status?: 'error' | 'success' | 'running' | 'waiting' | 'canceled';
}

export interface N8NCredential {
  id: string;
  name: string;
  type: string;
  data?: any;
  createdAt: string;
  updatedAt: string;
}

export interface N8NVariable {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'boolean' | 'number';
}

export interface N8NUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
  role?: 'global:owner' | 'global:admin' | 'global:member';
}

export interface N8NProject {
  id: string;
  name: string;
  type: 'team' | 'personal';
  createdAt: string;
  updatedAt: string;
}

// Dashboard-specific aggregated types
export interface WorkflowStats {
  total: number;
  active: number;
  inactive: number;
  errored: number;
}

export interface ExecutionStats {
  total: number;
  success: number;
  failed: number;
  running: number;
  waiting: number;
  successRate: number;
  averageDuration: number;
}

export interface TimelineEntry {
  date: string;
  success: number;
  failed: number;
  total: number;
}

export interface TopWorkflow {
  id: string;
  name: string;
  executionCount: number;
  successRate: number;
  active: boolean;
}

// API Response wrappers
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  total?: number;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  statusCode?: number;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Utility type guards
export function isApiSuccess<T>(
  response: ApiResponse<T>
): response is ApiSuccessResponse<T> {
  return response.success === true;
}

export function isApiError<T>(
  response: ApiResponse<T>
): response is ApiErrorResponse {
  return response.success === false;
}

// Execution status helpers
export function getExecutionStatus(execution: N8NExecution): string {
  if (execution.status) {
    return execution.status;
  }
  
  if (!execution.finished) {
    return execution.waitTill ? 'waiting' : 'running';
  }
  
  if (execution.stoppedAt && execution.data?.resultData?.error) {
    return 'error';
  }
  
  return 'success';
}

export function isExecutionSuccess(execution: N8NExecution): boolean {
  return getExecutionStatus(execution) === 'success';
}

export function isExecutionFailed(execution: N8NExecution): boolean {
  return getExecutionStatus(execution) === 'error';
}

export function isExecutionRunning(execution: N8NExecution): boolean {
  return getExecutionStatus(execution) === 'running';
}

// Date formatting helpers
export function formatExecutionDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Justo ahora';
  if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export function formatExecutionTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatExecutionDuration(startedAt: string, stoppedAt: string | null): string {
  if (!stoppedAt) return 'En ejecución';
  
  const start = new Date(startedAt);
  const stop = new Date(stoppedAt);
  const diffMs = stop.getTime() - start.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);

  if (diffSecs < 60) return `${diffSecs}s`;
  if (diffMins < 60) return `${diffMins}m ${diffSecs % 60}s`;
  
  const hours = Math.floor(diffMins / 60);
  return `${hours}h ${diffMins % 60}m`;
}