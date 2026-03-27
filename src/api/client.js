import axios from 'axios'

const BASE = '/api'

const api = axios.create({ baseURL: BASE })

// ── Jobs ──────────────────────────────────────────────────────────────────────
export const getJobs = () => api.get('/jobs/').then(r => r.data)
export const createJob = (data) => api.post('/jobs/', data).then(r => r.data)
export const getJob = (id) => api.get(`/jobs/${id}`).then(r => r.data)
export const updateJob = (id, data) => api.put(`/jobs/${id}`, data).then(r => r.data)
export const deleteJob = (id) => api.delete(`/jobs/${id}`)

// ── Process ───────────────────────────────────────────────────────────────────
export const processJob = (id) => api.post(`/jobs/${id}/process`).then(r => r.data)

// ── Documents ─────────────────────────────────────────────────────────────────
export const uploadDocument = (jobId, file, docType) => {
  const form = new FormData()
  form.append('file', file)
  form.append('doc_type', docType)
  return api.post(`/jobs/${jobId}/documents/`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)
}
export const deleteDocument = (jobId, docId) => api.delete(`/jobs/${jobId}/documents/${docId}`)

// ── Materials ─────────────────────────────────────────────────────────────────
export const getMaterials = (jobId) => api.get(`/jobs/${jobId}/materials`).then(r => r.data)
export const updateMaterials = (jobId, items) =>
  api.put(`/jobs/${jobId}/materials`, { items }).then(r => r.data)

// ── Crew ──────────────────────────────────────────────────────────────────────
export const getCrew = (jobId) => api.get(`/jobs/${jobId}/crew`).then(r => r.data)
export const updateCrew = (jobId, data) =>
  api.put(`/jobs/${jobId}/crew`, { data }).then(r => r.data)

// ── Formulas ──────────────────────────────────────────────────────────────────
export const getFormulas = () => api.get('/formulas/').then(r => r.data)
export const createFormula = (data) => api.post('/formulas/', data).then(r => r.data)
export const updateFormula = (id, data) => api.put(`/formulas/${id}`, data).then(r => r.data)
export const deleteFormula = (id) => api.delete(`/formulas/${id}`)
export const seedFormulas = () => api.post('/formulas/seed').then(r => r.data)
export const previewFormula = (expr, measurements) =>
  api.post('/formulas/preview', { formula_expr: expr, measurements }).then(r => r.data)

// ── Exports ───────────────────────────────────────────────────────────────────
export const exportMaterialsPDF = (jobId) =>
  api.get(`/jobs/${jobId}/export/materials`, { responseType: 'blob' }).then(r => r.data)
export const exportCrewPDF = (jobId) =>
  api.get(`/jobs/${jobId}/export/crew`, { responseType: 'blob' }).then(r => r.data)

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
