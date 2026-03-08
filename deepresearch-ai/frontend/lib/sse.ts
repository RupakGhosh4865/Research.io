import { fetchEventSource } from '@microsoft/fetch-event-source'

export type AgentUpdateEvent = { type: 'agent_update', agent: string, status: 'thinking'|'searching'|'completed'|'error', content: string, timestamp: string }
export type StatusEvent = { type: 'status_update', status: string, progress: number }
export type CompletedEvent = { type: 'completed', report_id: string }

export const createResearchSSE = (sessionId: string, token: string, onMessage: (msg: any) => void, onError: (err: any) => void) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/research/${sessionId}/stream`
    
    const controller = new AbortController();
    
    fetchEventSource(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        signal: controller.signal,
        onmessage(ev) {
            try {
                const data = JSON.parse(ev.data)
                onMessage(data)
            } catch (e) {
                console.error("Failed parsing SSE", e)
            }
        },
        onerror(err) {
            onError(err)
            throw err // to prevent retry loop
        }
    })
    
    return controller; // Call controller.abort() to disconnect
}
