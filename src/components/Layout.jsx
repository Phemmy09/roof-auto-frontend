import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  HomeIcon,
  PlusCircleIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'

export default function Layout() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <header className="bg-brand-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 flex items-center h-14 gap-6">
          {/* Logo */}
          <button
            onClick={() => navigate('/jobs')}
            className="flex items-center gap-2 font-bold text-lg tracking-tight"
          >
            <span className="text-accent">⬡</span>
            <span>Roof Auto</span>
          </button>

          <nav className="flex items-center gap-1 ml-2">
            <NavLink
              to="/jobs"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors
                 ${isActive ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`
              }
            >
              <HomeIcon className="w-4 h-4" />
              Jobs
            </NavLink>

            <NavLink
              to="/jobs/new"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors
                 ${isActive ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`
              }
            >
              <PlusCircleIcon className="w-4 h-4" />
              New Job
            </NavLink>

            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors
                 ${isActive ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`
              }
            >
              <Cog6ToothIcon className="w-4 h-4" />
              Formula Engine
            </NavLink>
          </nav>

          <div className="ml-auto text-xs text-white/50">
            Reliable Exteriors Group
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
