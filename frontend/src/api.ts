import { Shipment, AIAction, Severity } from './data';
import { executeCopilotQuery } from './copilotEngine';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      }
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      return null;
    }
    return await res.json();
  } catch (err) {
    return null;
  }
}

export const api = {
  // Dashboard
  async getDashboard() {
    return await fetchJson<any>('/dashboard');
  },

  // Shipments
  async getShipments(): Promise<Shipment[] | null> {
    return await fetchJson<Shipment[]>('/shipments');
  },

  async getShipmentDetail(id: string) {
    return await fetchJson<any>(`/shipments/${id}`);
  },

  // Disruptions
  async getDisruptions() {
    return await fetchJson<any[]>('/disruptions');
  },

  async getDisruptionImpact(id: string) {
    return await fetchJson<any>(`/disruptions/${id}/impact`);
  },

  // Fleet
  async getFleetUtilisation() {
    return await fetchJson<any>('/fleet/utilisation');
  },

  async getIdleOpportunities() {
    return await fetchJson<any[]>('/fleet/idle');
  },

  async redeployAsset(assetId: string, targetShipmentId: string = 'SHP-1042') {
    return await fetchJson<any>(`/fleet/${assetId}/redeploy`, {
      method: 'POST',
      body: JSON.stringify({ target_shipment_id: targetShipmentId })
    });
  },

  // Cold Chain
  async getColdChainSummary() {
    return await fetchJson<any>('/cold-chain/summary');
  },

  async getColdChainMap(mode: string = 'BALANCED') {
    return await fetchJson<any>(`/cold-chain/map?mode=${mode}`);
  },

  async getShipmentColdChain(shipmentId: string) {
    return await fetchJson<any>(`/cold-chain/${shipmentId}`);
  },

  async getContainerTelemetry(containerId: string) {
    return await fetchJson<any>(`/cold-chain/telemetry/${containerId}`);
  },

  async getAuditReport(containerId: string) {
    return await fetchJson<any>(`/cold-chain/audit-report/${containerId}`);
  },

  async createContainer(data: {
    container_id: string;
    shipment_id?: string;
    cargo_type: string;
    safe_min_temp?: number;
    safe_max_temp?: number;
    latitude?: number;
    longitude?: number;
    cargo_value?: number;
    initial_temperature?: number;
  }) {
    return await fetchJson<any>('/cold-chain/containers', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async bulkImportContainers(count: number = 5) {
    return await fetchJson<any>('/cold-chain/bulk-import', {
      method: 'POST',
      body: JSON.stringify({ count })
    });
  },

  async simulateExcursion(payload: {
    container_id: string;
    target_temp: number;
    duration_mins: number;
    description?: string;
  }) {
    return await fetchJson<any>('/cold-chain/simulate-excursion', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async markInvestigating(containerId: string) {
    return await fetchJson<any>(`/cold-chain/${containerId}/investigate`, {
      method: 'POST'
    });
  },

  async executeColdChainAction(containerId: string, actionType: string = 'RECOVER_REEFER') {
    return await fetchJson<any>('/cold-chain/action', {
      method: 'POST',
      body: JSON.stringify({ container_id: containerId, action_type: actionType })
    });
  },

  // Recommendations
  async getRecommendations(): Promise<AIAction[] | null> {
    return await fetchJson<AIAction[]>('/recommendations');
  },

  async executeAction(actionId: string, accept: boolean = true) {
    return await fetchJson<any>(`/recommendations/${actionId}/action`, {
      method: 'POST',
      body: JSON.stringify({ accept })
    });
  },

  // What-If Simulation
  async runSimulation(payload: {
    disruption_type: string;
    duration_hours: number;
    severity: string;
    affected_route?: string;
    cargo_type?: string;
  }) {
    return await fetchJson<any>('/simulations/disruption', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Copilot Query (Direct Gemini / Multi-LLM / Dynamic RAG)
  async queryCopilot(query: string, options?: { api_key?: string; provider?: string; conversation_history?: any[] }) {
    const directKey = options?.api_key || localStorage.getItem('chainguard_gemini_key') || localStorage.getItem('chainguard_llm_key');
    if (directKey) {
      return await executeCopilotQuery(query, { ...options, api_key: directKey });
    }

    try {
      const backendRes = await fetchJson<any>('/copilot/query', {
        method: 'POST',
        body: JSON.stringify({
          query,
          api_key: options?.api_key || undefined,
          provider: options?.provider || 'auto',
          conversation_history: options?.conversation_history || []
        })
      });
      if (backendRes && backendRes.answer) {
        return backendRes;
      }
    } catch {
      // ignore
    }

    return await executeCopilotQuery(query, options);
  }
};
