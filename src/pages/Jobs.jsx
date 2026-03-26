import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getJobs, deleteJob } from '../api/client'
import StatusBadge from '../components/StatusBadge'
import {
  PlusIcon,
  TrashIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'

export default function Jobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const load = () => {
    setLoading(true)
    getJobs()
      .then(setJobs)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!confirm('Delete this job and all its documents?')) return
    await deleteJob(id)
    load()
  }

  const filtered = jobs.filter(j =>
    [j.name, j.address, j.customer_name].some(v =>
      v?.toLowerCase().includes(search.toLowerCase())
    )
  )

  const counts = {
    pending:    jobs.filter(j => j.status === 'pending').length,
    processing: jobs.filter(j => j.status === 'processing').length,
    review:     jobs.filter(j => j.status === 'review').length,
    complete:   jobs.filter(j => j.status === 'complete').length,
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-sm text-gray-500 mt-0.5">{jobs.length} total jobs</p>
        </div>
        <button
          onClick={() => navigate('/jobs/new')}
          className="flex items-center gap-2 bg-brand-900 hover:bg-brand-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow"
        >
          <PlusIcon className="w-4 h-4" />
          New Job
        </button>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { key: 'pending', label: 'Pending', color: 'bg-gray-50 border-gray-200' },
          { key: 'processing', label: 'Processing', color: 'bg-yellow-50 border-yellow-200' },
          { key: 'review', label: 'Ready to Review', color: 'bg-blue-50 border-blue-200' },
          { key: 'complete', label: 'Complete', color: 'bg-green-50 border-green-200' },
        ].map(({ key, label, color }) => (
          <div key={key} className={`border rounded-lg p-3 ${color}`}>
            <div className="text-2xl font-bold">{counts[key]}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
        <input
          type="text"
          placeholder="Search jobs by name, address, customer..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Job list */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading jobs…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📋</div>
          <div className="font-medium">{search ? 'No jobs match your search' : 'No jobs yet'}</div>
          {!search && (
            <button
              onClick={() => navigate('/jobs/new')}
              className="mt-4 text-brand-600 underline text-sm"
            >
              Create your first job
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Job Name</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(job => (
                <tr
                  key={job.id}
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      {job.name}
                      <ChevronRightIcon className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{job.customer_name || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{job.address || '—'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(job.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={e => handleDelete(e, job.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
