import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createJob } from '../api/client'

export default function NewJob() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    customer_name: '',
    address: '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Job name is required')
      return
    }
    setSaving(true)
    try {
      const job = await createJob(form)
      navigate(`/jobs/${job.id}`)
    } catch (err) {
      setError('Failed to create job. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New Job</h1>
        <p className="text-sm text-gray-500 mt-1">
          Create a job record then upload documents to process.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6 shadow-sm space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="e.g. Bramlage-2025"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
          <input
            type="text"
            value={form.customer_name}
            onChange={e => set('customer_name', e.target.value)}
            placeholder="e.g. Becky Bramlage"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Property Address</label>
          <input
            type="text"
            value={form.address}
            onChange={e => set('address', e.target.value)}
            placeholder="e.g. 29369 Thunderbolt Cir, Conifer, CO 80433"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="Any additional notes..."
            rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-brand-900 hover:bg-brand-800 text-white py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
          >
            {saving ? 'Creating…' : 'Create Job & Upload Documents →'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/jobs')}
            className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
