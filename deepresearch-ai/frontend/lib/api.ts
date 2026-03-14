import axios from 'axios'

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api/v1",
})

export const setAuthToken = (token: string) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
        delete api.defaults.headers.common['Authorization']
    }
}

export const startResearch = async (topic: string, uploadedDocIds: string[] = []) => {
    const res = await api.post('/research/start', { topic, uploaded_doc_ids: uploadedDocIds })
    return res.data
}

export const approveResearchPlan = async (sessionId: string, approved: boolean, feedback: string = "") => {
    const res = await api.post(`/research/${sessionId}/approve-plan`, { approved, feedback })
    return res.data
}

export const getSessionStatus = async (sessionId: string) => {
    const res = await api.get(`/research/${sessionId}/status`)
    return res.data
}

export const getReport = async (reportId: string) => {
    const res = await api.get(`/reports/${reportId}`)
    return res.data
}

export const uploadDocument = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await api.post('/documents/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    return res.data
}

export const listDocuments = async () => {
    const res = await api.get('/documents')
    return res.data
}

export const getUserStats = async () => {
    const res = await api.get('/users/me/stats')
    return res.data
}

export default api
