import axios from 'axios'
import { useAuth } from '@clerk/nextjs'

// Using global function to keep it simple outside components, assuming access to Clerk window object is not robust.
// In actual app, tokens are fetched inside components or passed down.
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
})

export const setAuthToken = (token: str) => {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export const startResearch = async (topic: str) => {
    const res = await api.post('/research/start', { topic, uploaded_doc_ids: [] })
    return res.data
}

export const approveResearchPlan = async (sessionId: str, approved: boolean, feedback: str = "") => {
    const res = await api.post(`/research/${sessionId}/approve-plan`, { approved, feedback })
    return res.data
}

export const getSessionStatus = async (sessionId: str) => {
    const res = await api.get(`/research/${sessionId}/status`)
    return res.data
}

export default api
