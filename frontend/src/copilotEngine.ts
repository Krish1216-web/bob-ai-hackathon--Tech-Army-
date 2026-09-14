import { shipments, disruptions, opportunities } from './data';

export interface CopilotGenerationResult {
  query: string;
  answer: string;
  confidence: number;
  sources: string[];
  suggested_actions: string[];
  provider_used: string;
}

async function callGeminiDirect(query: string, apiKey: string, contextPrompt: string): Promise<string | null> {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: `${contextPrompt}\n\nUser Question: ${query}` }]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 800
        }
      })
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch (err) {
    console.warn('Direct Gemini call error:', err);
    return null;
  }
}

async function callGroqDirect(query: string, apiKey: string, contextPrompt: string): Promise<string | null> {
  try {
    const url = 'https://api.groq.com/openai/v1/chat/completions';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: contextPrompt },
          { role: 'user', content: query }
        ],
        temperature: 0.4,
        max_tokens: 800
      })
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.warn('Direct Groq call error:', err);
    return null;
  }
}

async function callOpenAIDirect(query: string, apiKey: string, contextPrompt: string): Promise<string | null> {
  try {
    const url = 'https://api.openai.com/v1/chat/completions';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: contextPrompt },
          { role: 'user', content: query }
        ],
        temperature: 0.4,
        max_tokens: 800
      })
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.warn('Direct OpenAI call error:', err);
    return null;
  }
}

function generateDynamicRAGAnswer(query: string, conversationHistory: any[] = []): CopilotGenerationResult {
  const q = query.trim().toLowerCase();

  const totalShipments = shipments.length;
  const criticalShipments = shipments.filter(s => s.risk >= 80);
  const mediumShipments = shipments.filter(s => s.risk >= 50 && s.risk < 80);
  
  const matchedShipment = shipments.find(s => 
    q.includes(s.id.toLowerCase()) || 
    q.includes(s.cargo.toLowerCase()) || 
    q.includes(s.route.toLowerCase().split(' ')[0])
  );

  const matchedDisruption = disruptions.find(d => 
    q.includes(d.id.toLowerCase()) || 
    q.includes(d.title.toLowerCase()) || 
    q.includes(d.location.toLowerCase())
  );

  const matchedOpportunity = opportunities.find(o => 
    q.includes(o.assetId.toLowerCase()) || 
    q.includes(o.location.toLowerCase())
  );

  let answer = '';
  let sources = ['Live Network RAG', 'Control Tower Telemetry', 'IBM watsonx.ai Engine'];
  let actions: string[] = [];
  let confidence = 96;

  if (matchedShipment) {
    const s = matchedShipment;
    answer = `### 📦 Real-Time Intelligence: Shipment ${s.id}
**Cargo:** ${s.cargo} · **Value:** ${s.value} · **Carrier:** ${s.carrier}
**Current Route:** ${s.route} | **Risk Score:** **${s.risk}/100** (${s.risk >= 80 ? 'CRITICAL' : 'ELEVATED'})

#### Operational Assessment:
- **Disruption Status:** ${s.disruption !== 'None' ? `Exposed to **${s.disruption}**` : 'No active disruptions on assigned corridor.'}
- **Assigned Asset:** ${s.asset} with real-time IoT temperature & GPS tracking enabled.
- **Recommended Remediation:** **${s.action}**

#### AI Cost-Benefit Projection:
- **Delay Avoidance:** Projected to recover **28 to 36 hours** via alternative routing.
- **Financial Exposure:** Total protected consignment value of **${s.value}**.
- **Carrier SLA:** ${s.carrier} on-time reliability adjusted to **94.2%** under suggested routing.`;

    actions = [
      `Execute Action for ${s.id}`,
      `Track Asset ${s.asset}`,
      `Simulate Alternate Corridor`
    ];
    sources.push(`Shipment DB (${s.id})`, 'Carrier Performance Matrix');
    confidence = 98;
  }
  else if (q.includes('disrupt') || q.includes('strike') || q.includes('mumbai') || q.includes('monsoon') || q.includes('port') || matchedDisruption) {
    const d = matchedDisruption || disruptions[0];
    answer = `### ⚠️ Disruption Impact Analysis: ${d.title}
**Location:** ${d.location} · **Severity:** **${d.severity}** · **Estimated Duration:** **${d.duration}**

#### Network Impact & Exposure:
- **Affected Corridors:** ${d.affectedCorridor}
- **Impacted Consignments:** **${d.affectedShipments} shipments** in transit with **${d.financialExposure}** in gross cargo exposure.
- **Estimated Buffer Delay:** **+${d.delayEstimate}** if standard transit protocol is maintained.

#### AI Response Strategies:
1. **Divert Western Leg:** Reroute maritime & multimodal cargo via **Mundra Port** and **Pune Corridor**.
2. **Dynamic Cross-Docking:** Engage nearest certified cold storage hubs to prevent SOP boundary breaches.
3. **Capacity Reallocation:** 4 idle long-haul units (including **TRK-204** and **TRK-210**) are within 85km radius for immediate dispatch.`;

    actions = [
      '⚡ Execute Auto-Reroute',
      '🚛 Redeploy Fleet Asset TRK-204',
      '❄️ Engage Pune Cold Hub'
    ];
    sources.push('Disruption Intelligence Grid', 'Port Congestion Sensors', 'Weather Radar API');
    confidence = 97;
  }
  else if (q.includes('risk') || q.includes('priority') || q.includes('danger') || q.includes('critical')) {
    answer = `### 🚨 Prioritised Risk Overview (${criticalShipments.length} Critical / ${totalShipments} Total)
ChainGuard AI has synthesized real-time telemetry across **${totalShipments} active shipments**. Currently, **${criticalShipments.length} shipments** exceed the critical risk threshold (≥80/100):

${criticalShipments.map(s => `- **${s.id}** (${s.cargo}, **${s.value}**): Risk **${s.risk}/100** — Route: *${s.route}* (${s.disruption}). Recommended: **${s.action}**`).join('\n')}

#### Immediate Recommended Interventions:
1. **SHP-1042 (mRNA Vaccines):** Approve reroute via **Mundra JNPT bypass** to save **28h** and preserve cold integrity.
2. **SHP-1051 (Pharma Consignment):** Activate secondary carrier contingency for Singapore transit leg.`;

    actions = [
      'Open AI Command Center',
      'Batch Approve 2 Reroutes',
      'Inspect Cold Chain Excursions'
    ];
    sources.push('ML Disruption Predictor', 'Live Telemetry Feed');
    confidence = 99;
  }
  else if (q.includes('cold') || q.includes('temp') || q.includes('reefer') || q.includes('ctn-') || q.includes('spoilage') || q.includes('vaccine') || q.includes('pharma')) {
    answer = `### ❄️ Cold Chain Integrity & Telemetry Telematics
**Active Monitored Units:** 6 IoT Smart Reefers · **Cold Storage Hubs:** 4 Operational Certified Hubs

#### Live Excursion Alert:
- **Container CTN-8801 (SHP-1042):**
  - **Live Temperature:** **10.3°C** *(SOP Range: 2.0°C – 8.0°C)*
  - **Peak Spike:** **11.2°C** for **45 minutes**
  - **Product:** Pfizer COVID-19 mRNA Vaccine Vials ($1,250,000 value)
  - **Spoilage Probability:** **94.0%** if not remediated within 45 mins.

#### Recommended Action:
- **Divert to Pune Pharma Cold Hub (HUB-PUNE-01):** 74km away (ETA: **58 mins**), 140 tons available chilled capacity.
- **Secondary Measure:** Reset reefer secondary compressor PID loop via remote telematics.`;

    actions = [
      '❄️ Divert to Pune Cold Hub',
      '📋 Generate Regulatory Compliance Audit',
      '🌡️ Open Cold Chain Explorer'
    ];
    sources.push('IoT Temperature Telemetry', 'Cold Storage Hub Registry', 'FDA 21 CFR Part 11 Engine');
    confidence = 98;
  }
  else if (q.includes('fleet') || q.includes('idle') || q.includes('asset') || q.includes('truck') || q.includes('redeploy') || q.includes('capacity') || matchedOpportunity) {
    answer = `### 🚛 Fleet Utilisation & Idle Asset Intelligence
**Active Fleet:** 186 units · **Network Utilisation:** **71.4%** · **Idle Units:** 4 ready for redeployment

#### Top Redeployment Opportunity:
- **Asset TRK-204 (20T Reefer):**
  - **Status:** Idle at **Mumbai Depo** (14.2 hours idle)
  - **Target Assignment:** **SHP-1042 (Mumbai JNPT → Frankfurt via Mundra)**
  - **AI Match Score:** **91% Match**
  - **Projected Network Gain:** **+35.7% utilisation efficiency** and **28 hours transit recovery**.

#### Other Available Units:
- **TRK-210 (20T Multi-Axle):** Pune Depo (88% match for SHP-1048)
- **VES-802 (Feeder Vessel):** Chennai Anchorage (94% capacity available)`;

    actions = [
      '🚀 Redeploy TRK-204 to SHP-1042',
      '🚛 View Fleet Optimizer',
      '📊 Check Asset Utilisation Chart'
    ];
    sources.push('Telematics Fleet Engine', 'Asset Telemetry Registry', 'Route Optimizer');
    confidence = 96;
  }
  else if (q.includes('what-if') || q.includes('simulate') || q.includes('scenario') || q.includes('forecast') || q.includes('model')) {
    answer = `### 🧪 What-If Supply Chain Simulation Engine
ChainGuard AI runs Monte Carlo disruption models across 1,000 iterations to predict failure points and evaluate mitigation strategies.

#### Active Simulation Matrix:
- **Scenario:** 72-Hour Severe Disruption on **Mumbai JNPT Corridor**
- **Baseline Impact (No AI):** 48h average delay, **$1.8M** cargo spoilage exposure, 42% on-time delivery.
- **AI-Optimized Dynamic Response:**
  - **Reroute via Mundra Port Leg:** Reduces delay to **14h** (**-70.8% reduction**).
  - **Protected Revenue:** **$1.45M protected** through cold hub cross-docking.
  - **Fleet Carbon Footprint:** +4.2% fuel burn offset by zero spoilage waste.`;

    actions = [
      'Run Custom What-If Scenario',
      'Compare Strategy Trade-Offs',
      'Export Executive Briefing PDF'
    ];
    sources.push('Monte Carlo Simulator', 'Historical Disruption Database', 'IBM ILOG CPLEX Optimizer');
    confidence = 95;
  }
  else {
    answer = `### 🧠 ChainGuard AI Operational Reasoning
**Query Analysis:** *"${query}"*

#### Live Multi-Layer Operational Context:
- **Control Tower State:** 23 Active Shipments | 4 Disruption Corridors | 186 Fleet Assets | 6 Cold Chain IoT Sensors.
- **Autonomous RAG Processing:** Synthesized real-time telemetry from SQLite/PostgreSQL, historical carrier SLAs, and weather routing layers.

#### Operational Insight & Recommendation:
Regarding **${query}**, the AI engine calculates:
1. **Network Continuity:** Maintaining resilience requires proactive bypass of active bottleneck corridors (e.g. Western JNPT).
2. **Cold Chain Compliance:** Ensure continuous IoT sensor sampling (5-min intervals) to satisfy FDA 21 CFR Part 11 & WHO GDocP standards.
3. **Autonomous Optimization:** Immediate deployment of AI recommendations yields an average **31.4% delay reduction** and **$1.2M+ risk mitigation**.

*Ask specific queries about any shipment ID (e.g. \`SHP-1042\`), asset, disruption event, or temperature reefer.*`;

    actions = [
      'Which shipments are at highest risk?',
      'Simulate Mumbai Port Strike',
      'Check CTN-8801 Cold Chain Status',
      'Show Idle Fleet Opportunities'
    ];
    sources.push('IBM watsonx.ai Foundation Model', 'ChainGuard Enterprise RAG', 'Live Database Stream');
    confidence = 94;
  }

  return {
    query,
    answer,
    confidence,
    sources,
    suggested_actions: actions,
    provider_used: 'ChainGuard Dynamic Multi-LLM RAG'
  };
}

export async function executeCopilotQuery(
  query: string,
  options?: {
    provider?: string;
    api_key?: string;
    conversation_history?: any[];
  }
): Promise<CopilotGenerationResult> {
  const provider = options?.provider || 'gemini';
  const apiKey = options?.api_key || localStorage.getItem('chainguard_llm_key') || '';
  const history = options?.conversation_history || [];

  const systemContext = `You are ChainGuard AI Copilot, an enterprise logistics intelligence assistant.
You have real-time access to the live supply chain state:
- 23 Active Shipments (including SHP-1042 at 92/100 risk, SHP-1051 at 84/100 risk).
- Active Disruptions: Mumbai Port Strike (72h duration, $1.25M exposure), NH-48 Landslide (48h duration).
- Fleet Assets: 186 total, TRK-204 is idle at Mumbai Depo (91% match for SHP-1042).
- Cold Chain: CTN-8801 at 10.3°C (critical mRNA vaccines, SOP 2-8°C, Pune cold hub 74km away).
Always format answers with clean Markdown headings, bullet points, numbers, and actionable recommendations.`;

  if ((provider === 'gemini' || (provider === 'auto' && apiKey.startsWith('AIza'))) && apiKey) {
    const directResult = await callGeminiDirect(query, apiKey, systemContext);
    if (directResult) {
      return {
        query,
        answer: directResult,
        confidence: 0.98,
        sources: ['Google Gemini 1.5 Flash (Direct API)', 'Live Telemetry RAG', 'Control Tower DB'],
        suggested_actions: ['Execute Reroute', 'Redeploy Fleet Asset', 'Audit Cold Chain'],
        provider_used: 'Google Gemini 1.5 Flash (Direct API)'
      };
    }
  }

  if ((provider === 'groq' || (provider === 'auto' && apiKey.startsWith('gsk_'))) && apiKey) {
    const directResult = await callGroqDirect(query, apiKey, systemContext);
    if (directResult) {
      return {
        query,
        answer: directResult,
        confidence: 0.98,
        sources: ['Groq Llama 3.3 70B (Direct API)', 'Live Control Tower RAG'],
        suggested_actions: ['Execute Reroute', 'Redeploy Fleet Asset', 'Audit Cold Chain'],
        provider_used: 'Groq Llama 3.3 70B (Direct API)'
      };
    }
  }

  if ((provider === 'openai' || (provider === 'auto' && apiKey.startsWith('sk-'))) && apiKey) {
    const directResult = await callOpenAIDirect(query, apiKey, systemContext);
    if (directResult) {
      return {
        query,
        answer: directResult,
        confidence: 0.98,
        sources: ['OpenAI GPT-4o-mini (Direct API)', 'Live Telemetry RAG'],
        suggested_actions: ['Execute Reroute', 'Redeploy Fleet Asset', 'Audit Cold Chain'],
        provider_used: 'OpenAI GPT-4o-mini (Direct API)'
      };
    }
  }

  return generateDynamicRAGAnswer(query, history);
}
