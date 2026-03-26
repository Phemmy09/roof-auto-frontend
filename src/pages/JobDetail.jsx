import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getJob, updateJob, deleteJob,
  uploadDocument, deleteDocument,
  processJob,
  getMaterials, updateMaterials,
  getCrew, updateCrew,
  exportMaterialsPDF, exportCrewPDF, downloadBlob,
} from '../api/client'
import StatusBadge from '../components/StatusBadge'
import {
  ArrowLeftIcon,
  CloudArrowUpIcon,
  SparklesIcon,
  DocumentArrowDownIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'

const DOC_TYPES = [
  { value: 'eagle_view', label: 'Eagle View Report' },
  { value: 'contract',   label: 'Contract' },
  { value: 'insurance',  label: 'Insurance Paperwork' },
  { value: 'city_code',  label: 'City Code Items' },
  { value: 'photos',     label: 'Job Photos' },
]

// ─── Upload Zone ───────────────────────────────────────────────────────────────
function UploadZone({ jobId, onUploaded }) {
  const [docType, setDocType] = useState('eagle_view')
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFiles = async (files) => {
    if (!files.length) return
    setUploading(true)
    setError('')
    try {
      for (const file of files) {
        if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
          setError('Only PDF files are supported.')
          setUploading(false)
          return
        }
        await uploadDocument(jobId, file, docType)
      }
      onUploaded()
    } catch {
      setError('Upload failed. Please try again.')
    }
    setUploading(false)
  }

  return (
    <div className="bg-white border rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Upload Documents</h3>
      <div className="flex gap-3 mb-3">
        <select
          value={docType}
          onChange={e => setDocType(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {DOC_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFiles([...e.dataTransfer.files]) }}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
          ${dragging ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-300 bg-gray-50'}`}
        onClick={() => document.getElementById('file-input').click()}
      >
        <CloudArrowUpIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">
          {uploading ? 'Uploading…' : 'Drop PDF here or click to browse'}
        </p>
        <input
          id="file-input"
          type="file"
          accept=".pdf,application/pdf"
          multiple
          className="hidden"
          onChange={e => handleFiles([...e.target.files])}
        />
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  )
}

// ─── Document List ─────────────────────────────────────────────────────────────
function DocList({ jobId, documents, onDeleted }) {
  const handleDelete = async (docId) => {
    if (!confirm('Delete this document?')) return
    await deleteDocument(jobId, docId)
    onDeleted()
  }

  if (!documents.length) {
    return <p className="text-sm text-gray-400 py-2">No documents uploaded yet.</p>
  }

  return (
    <div className="space-y-2">
      {documents.map(doc => {
        const label = DOC_TYPES.find(t => t.value === doc.doc_type)?.label || doc.doc_type
        return (
          <div key={doc.id} className="flex items-center gap-3 bg-gray-50 border rounded-lg px-3 py-2 text-sm">
            <span className="flex-1 truncate font-medium text-gray-800">{doc.filename}</span>
            <span className="text-xs text-gray-400 bg-white border rounded px-2 py-0.5">{label}</span>
            <button
              onClick={() => handleDelete(doc.id)}
              className="text-gray-300 hover:text-red-500 transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

// ─── Measurements Panel ────────────────────────────────────────────────────────
function MeasurementsPanel({ measurements }) {
  if (!measurements || Object.keys(measurements).length === 0) return null

  const groups = {
    'Area': ['squares', 'squares_at_waste', 'waste_factor', 'pitch'],
    'Linear Feet': ['ridges_ft', 'hips_ft', 'valleys_ft', 'rakes_ft', 'eaves_ft'],
    'Roof Features': ['skylights', 'chimneys', 'pipe_boots', 'vents', 'satellite_dishes', 'existing_layers'],
    'Other': [],
  }
  const shown = new Set()
  Object.values(groups).flat().forEach(k => shown.add(k))

  // Put remaining keys under Other
  Object.keys(measurements).forEach(k => {
    if (!shown.has(k)) groups['Other'].push(k)
  })

  return (
    <div className="bg-white border rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Extracted Measurements</h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1">
        {Object.entries(groups).map(([group, keys]) => {
          const items = keys.filter(k => measurements[k] !== undefined && measurements[k] !== null)
          if (!items.length) return null
          return (
            <div key={group} className="col-span-2 sm:col-span-1">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-3 mb-1">{group}</div>
              {items.map(k => (
                <div key={k} className="flex justify-between text-sm py-0.5 border-b border-gray-50">
                  <span className="text-gray-500 capitalize">{k.replace(/_/g, ' ')}</span>
                  <span className="font-medium text-gray-800">{String(measurements[k])}</span>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Materials Table ───────────────────────────────────────────────────────────
function MaterialsTable({ items, onChange }) {
  const [rows, setRows] = useState(items || [])
  const [editIdx, setEditIdx] = useState(null)
  const [editRow, setEditRow] = useState({})

  useEffect(() => setRows(items || []), [items])

  const startEdit = (i) => {
    setEditIdx(i)
    setEditRow({ ...rows[i] })
  }

  const saveEdit = () => {
    const updated = rows.map((r, i) => i === editIdx ? editRow : r)
    setRows(updated)
    onChange(updated)
    setEditIdx(null)
  }

  const cancelEdit = () => setEditIdx(null)

  const deleteRow = (i) => {
    const updated = rows.filter((_, idx) => idx !== i)
    setRows(updated)
    onChange(updated)
  }

  const addRow = () => {
    const updated = [...rows, { item: '', color: '', size: '', qty: 0, unit: '' }]
    setRows(updated)
    onChange(updated)
    setEditIdx(updated.length - 1)
    setEditRow({ item: '', color: '', size: '', qty: 0, unit: '' })
  }

  const cols = ['item', 'color', 'size', 'qty', 'unit']

  return (
    <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700">Materials Order</h3>
        <button
          onClick={addRow}
          className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-800 font-medium"
        >
          <PlusIcon className="w-4 h-4" /> Add Row
        </button>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wide text-left">
            {['Item', 'Color', 'Size', 'Qty', 'Unit', ''].map(h => (
              <th key={h} className="px-3 py-2">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.length === 0 && (
            <tr>
              <td colSpan={6} className="px-3 py-6 text-center text-gray-400 text-xs">
                No materials yet. Process documents to auto-generate.
              </td>
            </tr>
          )}
          {rows.map((row, i) => (
            <tr key={i} className={editIdx === i ? 'bg-blue-50' : 'hover:bg-gray-50'}>
              {editIdx === i ? (
                <>
                  {cols.map(col => (
                    <td key={col} className="px-2 py-1">
                      <input
                        type={col === 'qty' ? 'number' : 'text'}
                        value={editRow[col] ?? ''}
                        onChange={e => setEditRow(r => ({ ...r, [col]: col === 'qty' ? Number(e.target.value) : e.target.value }))}
                        className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </td>
                  ))}
                  <td className="px-2 py-1">
                    <div className="flex gap-1">
                      <button onClick={saveEdit} className="text-green-600 hover:text-green-700"><CheckIcon className="w-4 h-4" /></button>
                      <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-4 h-4" /></button>
                    </div>
                  </td>
                </>
              ) : (
                <>
                  <td className="px-3 py-2 font-medium text-gray-900">{row.item}</td>
                  <td className="px-3 py-2 text-gray-600">{row.color || '—'}</td>
                  <td className="px-3 py-2 text-gray-600">{row.size || '—'}</td>
                  <td className="px-3 py-2 text-gray-800 font-medium">{row.qty}</td>
                  <td className="px-3 py-2 text-gray-600">{row.unit}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(i)} className="text-gray-300 hover:text-brand-600"><PencilIcon className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deleteRow(i)} className="text-gray-300 hover:text-red-500"><TrashIcon className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Crew Form ─────────────────────────────────────────────────────────────────
function CrewForm({ data, onChange }) {
  const [form, setForm] = useState(data || {})

  useEffect(() => setForm(data || {}), [data])

  const set = (k, v) => {
    const updated = { ...form, [k]: v }
    setForm(updated)
    onChange(updated)
  }

  const Field = ({ label, fieldKey, type = 'text', rows }) => (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      {rows ? (
        <textarea
          rows={rows}
          value={form[fieldKey] || ''}
          onChange={e => set(fieldKey, e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />
      ) : (
        <input
          type={type}
          value={form[fieldKey] || ''}
          onChange={e => set(fieldKey, e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      )}
    </div>
  )

  const sections = [
    { title: 'Roof Specs', fields: [
      { label: 'Total Squares', fieldKey: 'total_squares' },
      { label: 'Pitch', fieldKey: 'pitch' },
      { label: 'Layers to Remove', fieldKey: 'layers_to_remove', type: 'number' },
      { label: 'Decking Condition', fieldKey: 'decking_condition' },
    ]},
    { title: 'Scope of Work', fields: [
      { label: 'Shingle Type / Color', fieldKey: 'shingle_type' },
      { label: 'Insurance Approved Items', fieldKey: 'insurance_approved_items', rows: 3 },
      { label: 'City Code Requirements', fieldKey: 'city_code_requirements', rows: 2 },
    ]},
    { title: 'Roof Features', fields: [
      { label: 'Skylights', fieldKey: 'skylights' },
      { label: 'Chimneys', fieldKey: 'chimneys' },
      { label: 'Pipe Boots', fieldKey: 'pipe_boots' },
      { label: 'Vents', fieldKey: 'vents' },
      { label: 'Satellite Dishes', fieldKey: 'satellite_dishes' },
    ]},
    { title: 'Crew Assignment', fields: [
      { label: 'Lead Crew Member', fieldKey: 'lead_crew' },
      { label: 'Crew Size', fieldKey: 'crew_size', type: 'number' },
      { label: 'Estimated Days', fieldKey: 'estimated_days', type: 'number' },
      { label: 'Scheduled Date', fieldKey: 'scheduled_date', type: 'date' },
    ]},
    { title: 'Notes', fields: [
      { label: 'Special Instructions', fieldKey: 'special_instructions', rows: 3 },
      { label: 'Additional Notes', fieldKey: 'additional_notes', rows: 2 },
    ]},
  ]

  return (
    <div className="space-y-5">
      {sections.map(({ title, fields }) => (
        <div key={title} className="bg-white border rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(f => (
              <div key={f.fieldKey} className={f.rows ? 'sm:col-span-2' : ''}>
                <Field {...f} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('documents')

  const [processing, setProcessing] = useState(false)
  const [processError, setProcessError] = useState('')

  const [materials, setMaterials] = useState([])
  const [materialsDirty, setMaterialsDirty] = useState(false)
  const [savingMaterials, setSavingMaterials] = useState(false)

  const [crew, setCrew] = useState({})
  const [crewDirty, setCrewDirty] = useState(false)
  const [savingCrew, setSavingCrew] = useState(false)

  const [exporting, setExporting] = useState('')

  const load = useCallback(async () => {
    try {
      const [j, m, c] = await Promise.all([getJob(id), getMaterials(id), getCrew(id)])
      setJob(j)
      setMaterials(m?.items || [])
      setCrew(c?.data || {})
    } catch {
      // ignore
    }
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  const handleProcess = async () => {
    if (!job.documents?.length) {
      setProcessError('Upload at least one document first.')
      return
    }
    setProcessing(true)
    setProcessError('')
    try {
      await processJob(id)
      await load()
      setTab('materials')
    } catch (err) {
      setProcessError(err?.response?.data?.detail || 'Processing failed. Please try again.')
    }
    setProcessing(false)
  }

  const handleSaveMaterials = async () => {
    setSavingMaterials(true)
    await updateMaterials(id, materials)
    setMaterialsDirty(false)
    setSavingMaterials(false)
  }

  const handleSaveCrew = async () => {
    setSavingCrew(true)
    await updateCrew(id, crew)
    setCrewDirty(false)
    setSavingCrew(false)
  }

  const handleExport = async (type) => {
    setExporting(type)
    try {
      const blob = type === 'materials'
        ? await exportMaterialsPDF(id)
        : await exportCrewPDF(id)
      downloadBlob(blob, `${job.name}-${type}.pdf`)
    } catch {
      // ignore
    }
    setExporting('')
  }

  const handleDelete = async () => {
    if (!confirm('Delete this job and all its documents?')) return
    await deleteJob(id)
    navigate('/jobs')
  }

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading job…</div>
  }

  if (!job) {
    return <div className="text-center py-20 text-gray-400">Job not found.</div>
  }

  const TABS = [
    { key: 'documents', label: 'Documents' },
    { key: 'materials', label: 'Materials Order' },
    { key: 'crew',      label: 'Crew Form' },
  ]

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <button
            onClick={() => navigate('/jobs')}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-2"
          >
            <ArrowLeftIcon className="w-4 h-4" /> All Jobs
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{job.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <StatusBadge status={job.status} />
            {job.customer_name && <span className="text-sm text-gray-500">{job.customer_name}</span>}
            {job.address && <span className="text-sm text-gray-400">{job.address}</span>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('materials')}
            disabled={exporting === 'materials' || !materials.length}
            className="flex items-center gap-1.5 text-sm border rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            {exporting === 'materials' ? 'Exporting…' : 'Materials PDF'}
          </button>
          <button
            onClick={() => handleExport('crew')}
            disabled={exporting === 'crew'}
            className="flex items-center gap-1.5 text-sm border rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            {exporting === 'crew' ? 'Exporting…' : 'Crew PDF'}
          </button>
          <button
            onClick={handleDelete}
            className="text-gray-300 hover:text-red-500 transition-colors p-2 rounded-lg border"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AI Process Button */}
      <div className="bg-gradient-to-r from-brand-900 to-brand-700 rounded-xl p-5 mb-6 flex items-center justify-between shadow">
        <div className="text-white">
          <div className="font-semibold">AI Document Processing</div>
          <div className="text-sm text-white/70 mt-0.5">
            Upload all documents then run AI extraction to auto-generate materials and crew forms.
          </div>
          {processError && (
            <div className="text-red-300 text-xs mt-1">{processError}</div>
          )}
        </div>
        <button
          onClick={handleProcess}
          disabled={processing}
          className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-brand-900 font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60 whitespace-nowrap ml-4 shadow"
        >
          <SparklesIcon className="w-4 h-4" />
          {processing ? 'Processing…' : 'Run AI Extraction'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-6">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px
              ${tab === t.key
                ? 'border-brand-900 text-brand-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Documents */}
      {tab === 'documents' && (
        <div className="space-y-5">
          <UploadZone jobId={id} onUploaded={load} />
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Uploaded Documents ({job.documents?.length || 0})
            </h3>
            <DocList jobId={id} documents={job.documents || []} onDeleted={load} />
          </div>
          {job.measurements && Object.keys(job.measurements).length > 0 && (
            <MeasurementsPanel measurements={job.measurements} />
          )}
        </div>
      )}

      {/* Tab: Materials */}
      {tab === 'materials' && (
        <div className="space-y-4">
          <MaterialsTable
            items={materials}
            onChange={rows => { setMaterials(rows); setMaterialsDirty(true) }}
          />
          {materialsDirty && (
            <div className="flex justify-end">
              <button
                onClick={handleSaveMaterials}
                disabled={savingMaterials}
                className="bg-brand-900 hover:bg-brand-800 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
              >
                {savingMaterials ? 'Saving…' : 'Save Materials'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab: Crew */}
      {tab === 'crew' && (
        <div className="space-y-4">
          <CrewForm
            data={crew}
            onChange={data => { setCrew(data); setCrewDirty(true) }}
          />
          {crewDirty && (
            <div className="flex justify-end">
              <button
                onClick={handleSaveCrew}
                disabled={savingCrew}
                className="bg-brand-900 hover:bg-brand-800 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
              >
                {savingCrew ? 'Saving…' : 'Save Crew Form'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
