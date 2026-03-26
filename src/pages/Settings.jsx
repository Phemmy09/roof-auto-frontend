import { useEffect, useState } from 'react'
import {
  getFormulas, createFormula, updateFormula, deleteFormula,
  seedFormulas, previewFormula,
} from '../api/client'
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  BeakerIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

const EMPTY_FORMULA = { name: '', description: '', item: '', color: '', size: '', unit: '', formula_expr: '', is_active: true }

const TEST_MEASUREMENTS = {
  squares: 18.33,
  squares_at_waste: 20.16,
  waste_factor: 0.1,
  pitch: 4,
  ridges_ft: 48.1,
  hips_ft: 4.6,
  valleys_ft: 0,
  rakes_ft: 75.6,
  eaves_ft: 104.3,
  skylights: 0,
  chimneys: 0,
  pipe_boots: 3,
  vents: 4,
}

function FormulaRow({ formula, onSave, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(formula)
  const [preview, setPreview] = useState(null)
  const [previewError, setPreviewError] = useState('')
  const [previewing, setPreviewing] = useState(false)
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    await onSave(formula.id, form)
    setEditing(false)
    setSaving(false)
  }

  const handlePreview = async () => {
    setPreviewing(true)
    setPreviewError('')
    setPreview(null)
    try {
      const result = await previewFormula(form.formula_expr, TEST_MEASUREMENTS)
      setPreview(result.result)
    } catch (err) {
      setPreviewError(err?.response?.data?.detail || 'Invalid formula')
    }
    setPreviewing(false)
  }

  if (!editing) {
    return (
      <div className="flex items-start gap-4 px-4 py-3 hover:bg-gray-50 group">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900 text-sm">{formula.name}</span>
            {!formula.is_active && (
              <span className="text-xs bg-gray-100 text-gray-400 rounded px-1.5 py-0.5">Inactive</span>
            )}
          </div>
          {formula.description && (
            <div className="text-xs text-gray-400 mt-0.5">{formula.description}</div>
          )}
          <code className="text-xs text-blue-700 bg-blue-50 rounded px-2 py-0.5 mt-1 inline-block font-mono">
            {formula.formula_expr}
          </code>
          <div className="text-xs text-gray-400 mt-1">
            → {formula.item}{formula.color ? ` · ${formula.color}` : ''}{formula.size ? ` · ${formula.size}` : ''} ({formula.unit})
          </div>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setEditing(true)} className="text-gray-400 hover:text-brand-600">
            <PencilIcon className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(formula.id)} className="text-gray-400 hover:text-red-500">
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-blue-50 border-l-4 border-brand-500 px-4 py-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-600">Name *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)}
            className="mt-1 w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">Item Label</label>
          <input value={form.item} onChange={e => set('item', e.target.value)}
            className="mt-1 w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">Color</label>
          <input value={form.color} onChange={e => set('color', e.target.value)}
            className="mt-1 w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">Size</label>
          <input value={form.size} onChange={e => set('size', e.target.value)}
            className="mt-1 w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">Unit</label>
          <input value={form.unit} onChange={e => set('unit', e.target.value)}
            className="mt-1 w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500" />
        </div>
        <div className="flex items-end gap-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)}
              className="rounded" />
            <span className="text-gray-600">Active</span>
          </label>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-600">Description</label>
        <input value={form.description} onChange={e => set('description', e.target.value)}
          className="mt-1 w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500" />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-600">Formula Expression *</label>
        <div className="flex gap-2 mt-1">
          <input
            value={form.formula_expr}
            onChange={e => set('formula_expr', e.target.value)}
            placeholder="e.g. ceil(squares_at_waste * 3)"
            className="flex-1 border rounded px-2 py-1 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <button
            onClick={handlePreview}
            disabled={previewing}
            className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1 rounded transition-colors"
          >
            <BeakerIcon className="w-3.5 h-3.5" />
            {previewing ? '…' : 'Test'}
          </button>
        </div>
        {preview !== null && !previewError && (
          <div className="text-xs text-green-700 bg-green-50 rounded px-2 py-1 mt-1">
            Result: <strong>{preview}</strong> (with sample measurements)
          </div>
        )}
        {previewError && (
          <div className="text-xs text-red-600 bg-red-50 rounded px-2 py-1 mt-1">{previewError}</div>
        )}
        <div className="text-xs text-gray-400 mt-1">
          Variables: squares, squares_at_waste, waste_factor, pitch, ridges_ft, hips_ft, valleys_ft, rakes_ft, eaves_ft, skylights, chimneys, pipe_boots, vents, satellite_dishes, existing_layers
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1 bg-brand-900 text-white text-xs px-3 py-1.5 rounded transition-colors hover:bg-brand-800 disabled:opacity-60"
        >
          <CheckIcon className="w-3.5 h-3.5" />
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          onClick={() => { setEditing(false); setForm(formula) }}
          className="flex items-center gap-1 text-gray-600 text-xs px-3 py-1.5 rounded border hover:bg-gray-50 transition-colors"
        >
          <XMarkIcon className="w-3.5 h-3.5" /> Cancel
        </button>
      </div>
    </div>
  )
}

function NewFormulaForm({ onSave, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORMULA)
  const [preview, setPreview] = useState(null)
  const [previewError, setPreviewError] = useState('')
  const [previewing, setPreviewing] = useState(false)
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handlePreview = async () => {
    setPreviewing(true)
    setPreviewError('')
    setPreview(null)
    try {
      const result = await previewFormula(form.formula_expr, TEST_MEASUREMENTS)
      setPreview(result.result)
    } catch (err) {
      setPreviewError(err?.response?.data?.detail || 'Invalid formula')
    }
    setPreviewing(false)
  }

  const handleSave = async () => {
    if (!form.name || !form.formula_expr) return
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <div className="bg-green-50 border-l-4 border-green-500 px-4 py-4 space-y-3">
      <div className="text-sm font-semibold text-gray-700">New Formula</div>
      <div className="grid grid-cols-2 gap-3">
        {[
          ['Name *', 'name', 'text'],
          ['Item Label', 'item', 'text'],
          ['Color', 'color', 'text'],
          ['Size', 'size', 'text'],
          ['Unit', 'unit', 'text'],
        ].map(([label, key]) => (
          <div key={key}>
            <label className="text-xs font-medium text-gray-600">{label}</label>
            <input value={form[key]} onChange={e => set(key, e.target.value)}
              className="mt-1 w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500" />
          </div>
        ))}
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} className="rounded" />
            <span className="text-gray-600">Active</span>
          </label>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-600">Description</label>
        <input value={form.description} onChange={e => set('description', e.target.value)}
          className="mt-1 w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500" />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-600">Formula Expression *</label>
        <div className="flex gap-2 mt-1">
          <input
            value={form.formula_expr}
            onChange={e => set('formula_expr', e.target.value)}
            placeholder="e.g. ceil(squares_at_waste * 3)"
            className="flex-1 border rounded px-2 py-1 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <button onClick={handlePreview} disabled={previewing}
            className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1 rounded transition-colors">
            <BeakerIcon className="w-3.5 h-3.5" />
            {previewing ? '…' : 'Test'}
          </button>
        </div>
        {preview !== null && !previewError && (
          <div className="text-xs text-green-700 bg-green-100 rounded px-2 py-1 mt-1">
            Result: <strong>{preview}</strong>
          </div>
        )}
        {previewError && <div className="text-xs text-red-600 bg-red-50 rounded px-2 py-1 mt-1">{previewError}</div>}
      </div>

      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving || !form.name || !form.formula_expr}
          className="flex items-center gap-1 bg-green-700 text-white text-xs px-3 py-1.5 rounded hover:bg-green-800 disabled:opacity-50 transition-colors">
          <CheckIcon className="w-3.5 h-3.5" />
          {saving ? 'Adding…' : 'Add Formula'}
        </button>
        <button onClick={onCancel}
          className="flex items-center gap-1 text-gray-600 text-xs px-3 py-1.5 rounded border hover:bg-gray-50 transition-colors">
          <XMarkIcon className="w-3.5 h-3.5" /> Cancel
        </button>
      </div>
    </div>
  )
}

export default function Settings() {
  const [formulas, setFormulas] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [seeding, setSeeding] = useState(false)

  const load = async () => {
    setLoading(true)
    const data = await getFormulas()
    setFormulas(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSeed = async () => {
    if (!confirm('Reset all formulas to defaults? This will replace existing formulas.')) return
    setSeeding(true)
    await seedFormulas()
    await load()
    setSeeding(false)
  }

  const handleSave = async (id, data) => {
    await updateFormula(id, data)
    await load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this formula?')) return
    await deleteFormula(id)
    await load()
  }

  const handleCreate = async (data) => {
    await createFormula(data)
    setAdding(false)
    await load()
  }

  const active = formulas.filter(f => f.is_active)
  const inactive = formulas.filter(f => !f.is_active)

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Formula Engine</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Configure how measurements are converted to material quantities.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-1.5 text-sm border rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <ArrowPathIcon className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
            {seeding ? 'Resetting…' : 'Reset to Defaults'}
          </button>
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 text-sm bg-brand-900 hover:bg-brand-800 text-white px-3 py-2 rounded-lg transition-colors"
          >
            <PlusIcon className="w-4 h-4" /> Add Formula
          </button>
        </div>
      </div>

      {/* Sample measurements hint */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-xs text-blue-700">
        <strong>Test measurements used for preview:</strong>{' '}
        18.33 sq, pitch 4/12, ridges 48.1ft, hips 4.6ft, valleys 0ft, rakes 75.6ft, eaves 104.3ft,
        pipe_boots 3, vents 4
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading formulas…</div>
      ) : (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          {adding && (
            <div className="border-b">
              <NewFormulaForm onSave={handleCreate} onCancel={() => setAdding(false)} />
            </div>
          )}

          {formulas.length === 0 && !adding ? (
            <div className="text-center py-10 text-gray-400">
              <div className="text-3xl mb-2">⚙️</div>
              <div className="font-medium">No formulas configured</div>
              <button
                onClick={handleSeed}
                className="mt-3 text-brand-600 underline text-sm"
              >
                Load default formulas
              </button>
            </div>
          ) : (
            <>
              {active.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Active ({active.length})
                  </div>
                  <div className="divide-y">
                    {active.map(f => (
                      <FormulaRow key={f.id} formula={f} onSave={handleSave} onDelete={handleDelete} />
                    ))}
                  </div>
                </div>
              )}
              {inactive.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 border-t border-b text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Inactive ({inactive.length})
                  </div>
                  <div className="divide-y">
                    {inactive.map(f => (
                      <FormulaRow key={f.id} formula={f} onSave={handleSave} onDelete={handleDelete} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
