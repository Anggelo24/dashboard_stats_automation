// src/services/supabaseService.ts

const SUPABASE_URL = 'https://cdgolvcyibkdcpoqbifv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkZ29sdmN5aWJrZGNwb3FiaWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MjY0OTIsImV4cCI6MjA3ODMwMjQ5Mn0.7rxnYNKDakBuvG_11KIsalGlgSJI4fyqjbbq79k-FbY';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ==================== TYPES ====================

export interface BusinessMetrics {
  summary: {
    totalEvents: number;
    uniqueContacts: number;
    successRate: number;
    last24Hours: number;
  };
  metrics: {
    whatsapp?: {
      sent: number;
      delivered: number;
      read: number;
    };
    calls?: {
      made: number;
      answered: number;
      avgDuration: string;
    };
    surveys?: {
      sent: number;
      completed: number;
      completionRate: number;
    };
    sales?: {
      registered: number;
      totalRevenue: number;
      avgOrderValue: number;
    };
    abandonedCart?: {
      contacted: number;
      recovered: number;
      recoveryRate: number;
    };
    aiComments?: {
      processed: number;
      replied: number;
      dmsSent: number;
    };
  };
  recentActivity: Array<{
    id: string;
    eventType: string;
    timestamp: string;
    status: string;
    workflowName: string;
  }>;
  timeline: {
    [date: string]: {
      total: number;
      success: number;
      failed: number;
    };
  };
}

export interface WorkflowExecution {
  id: string;
  client_id: string;
  workflow_id: string;
  workflow_name: string;
  event_type: string;
  started_at: string;
  finished_at?: string;
  status: string;
  metadata: any;
  created_at: string;
}

// ==================== SUPABASE SERVICE ====================

class SupabaseService {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1${endpoint}`, {
        ...options,
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Supabase Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(`Supabase Error (${endpoint}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ==================== GET CLIENT INFO ====================

  async getClientBySlug(slug: string) {
    return this.request(`/clients?slug=eq.${slug}&select=*`);
  }

  async getClientById(clientId: string) {
    return this.request(`/clients?id=eq.${clientId}&select=*`);
  }

  // ==================== GET WORKFLOW EXECUTIONS ====================

  async getWorkflowExecutions(
    clientId: string,
    options?: {
      limit?: number;
      status?: string;
      eventType?: string;
      days?: number;
    }
  ): Promise<ApiResponse<WorkflowExecution[]>> {
    const limit = options?.limit || 100;
    const days = options?.days || 7;
    
    // Calculate date for filtering
    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - days);
    const dateString = dateFilter.toISOString();

    let query = `/workflow_executions?client_id=eq.${clientId}&started_at=gte.${dateString}&order=started_at.desc&limit=${limit}`;

    if (options?.status) {
      query += `&status=eq.${options.status}`;
    }

    if (options?.eventType) {
      query += `&event_type=eq.${options.eventType}`;
    }

    return this.request<WorkflowExecution[]>(query);
  }

  // ==================== GET BUSINESS METRICS ====================

  async getBusinessMetrics(
    clientId: string,
    days: number = 7
  ): Promise<ApiResponse<BusinessMetrics>> {
    try {
      // Fetch all executions for the period
      const execResponse = await this.getWorkflowExecutions(clientId, { days, limit: 1000 });

      if (!execResponse.success || !execResponse.data) {
        throw new Error('Failed to fetch executions');
      }

      const executions = execResponse.data;

      // Initialize metrics
      const metrics: BusinessMetrics = {
        summary: {
          totalEvents: 0,
          uniqueContacts: 0,
          successRate: 0,
          last24Hours: 0,
        },
        metrics: {},
        recentActivity: [],
        timeline: {},
      };

      // Calculate summary metrics
      metrics.summary.totalEvents = executions.length;
      const successCount = executions.filter(e => e.status === 'success').length;
      metrics.summary.successRate = executions.length > 0
        ? Math.round((successCount / executions.length) * 100)
        : 0;

      // Calculate last 24 hours
      const last24Hours = new Date();
      last24Hours.setHours(last24Hours.getHours() - 24);
      metrics.summary.last24Hours = executions.filter(
        e => new Date(e.started_at) >= last24Hours
      ).length;

      // Group by event type
      const eventGroups: { [key: string]: WorkflowExecution[] } = {};
      const uniqueContactsSet = new Set<string>();

      executions.forEach(exec => {
        if (!eventGroups[exec.event_type]) {
          eventGroups[exec.event_type] = [];
        }
        eventGroups[exec.event_type].push(exec);

        // Track unique contacts
        if (exec.metadata?.contact_email) {
          uniqueContactsSet.add(exec.metadata.contact_email);
        }
        if (exec.metadata?.contact_phone) {
          uniqueContactsSet.add(exec.metadata.contact_phone);
        }
        if (exec.metadata?.commenter_username) {
          uniqueContactsSet.add(exec.metadata.commenter_username);
        }
      });

      metrics.summary.uniqueContacts = uniqueContactsSet.size;

      // Calculate metrics by event type

      // WhatsApp metrics
      const whatsappEvents = eventGroups['whatsapp_sent'] || [];
      if (whatsappEvents.length > 0) {
        metrics.metrics.whatsapp = {
          sent: whatsappEvents.length,
          delivered: whatsappEvents.filter(e => e.status === 'success').length,
          read: whatsappEvents.filter(e => e.metadata?.read === true).length,
        };
      }

      // Call metrics
      const callEvents = eventGroups['voice_call_made'] || [];
      if (callEvents.length > 0) {
        const answeredCalls = callEvents.filter(e => e.metadata?.call_answered === true);
        const totalDuration = callEvents.reduce((sum, e) => {
          return sum + (e.metadata?.duration_seconds || 0);
        }, 0);
        const avgDurationSecs = callEvents.length > 0 ? totalDuration / callEvents.length : 0;
        const minutes = Math.floor(avgDurationSecs / 60);
        const seconds = Math.floor(avgDurationSecs % 60);

        metrics.metrics.calls = {
          made: callEvents.length,
          answered: answeredCalls.length,
          avgDuration: `${minutes}:${seconds.toString().padStart(2, '0')}`,
        };
      }

      // Survey metrics
      const surveyEvents = eventGroups['survey_sent'] || [];
      if (surveyEvents.length > 0) {
        const completedSurveys = surveyEvents.filter(e => e.metadata?.completed === true).length;
        metrics.metrics.surveys = {
          sent: surveyEvents.length,
          completed: completedSurveys,
          completionRate: Math.round((completedSurveys / surveyEvents.length) * 100),
        };
      }

      // Sales metrics
      const salesEvents = eventGroups['sale_registered'] || [];
      if (salesEvents.length > 0) {
        const totalRevenue = salesEvents.reduce((sum, e) => {
          return sum + (parseFloat(e.metadata?.sale_amount) || 0);
        }, 0);
        metrics.metrics.sales = {
          registered: salesEvents.length,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          avgOrderValue: Math.round((totalRevenue / salesEvents.length) * 100) / 100,
        };
      }

      // Abandoned cart metrics
      const cartEvents = eventGroups['abandoned_cart_message'] || [];
      if (cartEvents.length > 0) {
        const recovered = cartEvents.filter(e => e.metadata?.cart_recovered === true).length;
        metrics.metrics.abandonedCart = {
          contacted: cartEvents.length,
          recovered,
          recoveryRate: Math.round((recovered / cartEvents.length) * 100),
        };
      }

      // AI Comments metrics
      const commentEvents = eventGroups['ai_comment_made'] || [];
      if (commentEvents.length > 0) {
        const replied = commentEvents.filter(e => e.metadata?.public_response).length;
        const dmsSent = commentEvents.filter(e => e.metadata?.dm_sent === true).length;
        metrics.metrics.aiComments = {
          processed: commentEvents.length,
          replied,
          dmsSent,
        };
      }

      // Recent activity (last 10)
      metrics.recentActivity = executions.slice(0, 10).map(exec => ({
        id: exec.id,
        eventType: exec.event_type,
        timestamp: exec.started_at,
        status: exec.status,
        workflowName: exec.workflow_name,
      }));

      // Timeline (group by date)
      const timelineMap: { [key: string]: { total: number; success: number; failed: number } } = {};

      executions.forEach(exec => {
        const date = exec.started_at.split('T')[0]; // Get YYYY-MM-DD
        if (!timelineMap[date]) {
          timelineMap[date] = { total: 0, success: 0, failed: 0 };
        }
        timelineMap[date].total++;
        if (exec.status === 'success') {
          timelineMap[date].success++;
        } else if (exec.status === 'error') {
          timelineMap[date].failed++;
        }
      });

      metrics.timeline = timelineMap;

      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      console.error('Error calculating business metrics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ==================== INSERT WORKFLOW EXECUTION ====================

  async insertWorkflowExecution(data: {
    client_id: string;
    workflow_id: string;
    workflow_name: string;
    event_type: string;
    started_at: string;
    status: string;
    metadata?: any;
  }) {
    return this.request('/workflow_executions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const supabaseService = new SupabaseService();
export default supabaseService;