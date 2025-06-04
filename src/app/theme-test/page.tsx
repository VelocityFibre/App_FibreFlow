'use client';

export default function ThemeTestPage() {
  return (
    <div className="ff-page-container">
      {/* Page Header - Apple Style */}
      <div className="ff-page-header">
        <h1 className="ff-page-title">
          Design System
        </h1>
        <p className="ff-page-subtitle">
          FibreFlow's modern, clean design language.
        </p>
      </div>
        
        {/* Typography Showcase */}
        <section className="ff-section">
          <h2 className="ff-section-title">Typography</h2>
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-light text-gray-900 mb-2">Display Large</h1>
              <p className="text-sm text-gray-500">48px, Light weight</p>
            </div>
            <div>
              <h2 className="text-3xl font-light text-gray-900 mb-2">Heading Large</h2>
              <p className="text-sm text-gray-500">32px, Light weight</p>
            </div>
            <div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Heading Medium</h3>
              <p className="text-sm text-gray-500">20px, Medium weight</p>
            </div>
            <div>
              <p className="text-base text-gray-900 mb-2">Body Text</p>
              <p className="text-sm text-gray-500">16px, Regular weight</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Secondary Text</p>
              <p className="text-sm text-gray-500">14px, Regular weight</p>
            </div>
          </div>
        </section>

        {/* Cards & Content Areas */}
        <section className="ff-section">
          <h2 className="ff-section-title">Content Cards</h2>
          <div className="ff-grid-cards">
            
            {/* Clean Card */}
            <div className="ff-card">
              <h3 className="ff-card-title">Project Overview</h3>
              <p className="ff-card-content">Clean, minimal card design with subtle shadows and rounded corners.</p>
              <button className="ff-button-primary">
                View Details
              </button>
            </div>

            {/* Stats Card */}
            <div className="ff-card-stats">
              <h3 className="ff-card-title">Statistics</h3>
              <div className="space-y-4">
                <div>
                  <div className="ff-stat-value">1,247</div>
                  <div className="ff-stat-label">Active Projects</div>
                </div>
                <div>
                  <div className="ff-stat-value">94.8%</div>
                  <div className="ff-stat-label">Completion Rate</div>
                </div>
              </div>
            </div>

            {/* Action Card */}
            <div className="ff-card">
              <h3 className="ff-card-title">Quick Actions</h3>
              <div className="space-y-3">
                <button className="ff-button-ghost">
                  Create New Project
                </button>
                <button className="ff-button-ghost">
                  Import Data
                </button>
                <button className="ff-button-ghost">
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Form Elements */}
        <section className="ff-section">
          <h2 className="ff-section-title">Form Elements</h2>
          <div className="ff-form-container">
            <div className="space-y-6">
              <div>
                <label className="ff-label">Project Name</label>
                <input 
                  type="text" 
                  className="ff-input"
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <label className="ff-label">Description</label>
                <textarea 
                  className="ff-input resize-none"
                  rows={4}
                  placeholder="Project description..."
                />
              </div>
              <div>
                <label className="ff-label">Status</label>
                <select className="ff-input">
                  <option>Active</option>
                  <option>Pending</option>
                  <option>Completed</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Table Example */}
        <section className="ff-section">
          <h2 className="ff-section-title">Data Tables</h2>
          <div className="ff-table-container">
            <table className="w-full">
              <thead className="ff-table-header">
                <tr>
                  <th className="ff-table-header-cell">Project</th>
                  <th className="ff-table-header-cell">Status</th>
                  <th className="ff-table-header-cell">Progress</th>
                  <th className="ff-table-header-cell">Due Date</th>
                </tr>
              </thead>
              <tbody>
                <tr className="ff-table-row">
                  <td className="ff-table-cell">Fiber Installation - CBD</td>
                  <td className="ff-table-cell">
                    <span className="ff-status-active">Active</span>
                  </td>
                  <td className="ff-table-cell-secondary">75%</td>
                  <td className="ff-table-cell-secondary">Dec 15, 2024</td>
                </tr>
                <tr className="ff-table-row">
                  <td className="ff-table-cell">Network Upgrade - Suburbs</td>
                  <td className="ff-table-cell">
                    <span className="ff-status-planning">Planning</span>
                  </td>
                  <td className="ff-table-cell-secondary">25%</td>
                  <td className="ff-table-cell-secondary">Jan 30, 2025</td>
                </tr>
                <tr className="ff-table-row">
                  <td className="ff-table-cell">Equipment Maintenance</td>
                  <td className="ff-table-cell">
                    <span className="ff-status-pending">Pending</span>
                  </td>
                  <td className="ff-table-cell-secondary">0%</td>
                  <td className="ff-table-cell-secondary">Nov 20, 2024</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Color Palette */}
        <section>
          <h2 className="ff-section-title">Color Palette</h2>
          <div className="ff-grid-stats">
            <div className="text-center">
              <div className="w-20 h-20 bg-white border-2 border-gray-200 rounded-lg mb-3 mx-auto"></div>
              <p className="text-sm text-gray-600">Background</p>
              <p className="text-xs text-gray-500">#FFFFFF</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-900 rounded-lg mb-3 mx-auto"></div>
              <p className="text-sm text-gray-600">Primary Text</p>
              <p className="text-xs text-gray-500">#1F2937</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-500 rounded-lg mb-3 mx-auto"></div>
              <p className="text-sm text-gray-600">Accent Charcoal</p>
              <p className="text-xs text-gray-500">#6B7280</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-lg mb-3 mx-auto"></div>
              <p className="text-sm text-gray-600">Subtle Gray</p>
              <p className="text-xs text-gray-500">#F3F4F6</p>
            </div>
          </div>
        </section>
    </div>
  );
}