'use client';

export default function ThemeTestPage() {
  return (
    <div className="space-y-12">
      {/* Page Header - Apple Style */}
      <div className="border-b border-gray-100 pb-8 mb-12">
        <h1 className="text-5xl font-light text-gray-900 mb-4">
          Design System
        </h1>
        <p className="text-xl text-gray-600 font-light">
          FibreFlow's modern, clean design language.
        </p>
      </div>
        
        {/* Typography Showcase */}
        <section className="mb-20">
          <h2 className="text-3xl font-light text-gray-900 mb-12">Typography</h2>
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
        <section className="mb-20">
          <h2 className="text-3xl font-light text-gray-900 mb-12">Content Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Clean Card */}
            <div className="bg-white border border-gray-100 rounded-xl p-8 hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-xl font-medium text-gray-900 mb-4">Project Overview</h3>
              <p className="text-gray-600 mb-6">Clean, minimal card design with subtle shadows and rounded corners.</p>
              <button className="bg-gray-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors">
                View Details
              </button>
            </div>

            {/* Stats Card */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-8">
              <h3 className="text-xl font-medium text-gray-900 mb-4">Statistics</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-2xl font-light text-gray-900">1,247</div>
                  <div className="text-sm text-gray-600">Active Projects</div>
                </div>
                <div>
                  <div className="text-2xl font-light text-gray-900">94.8%</div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                </div>
              </div>
            </div>

            {/* Action Card */}
            <div className="bg-white border border-gray-100 rounded-xl p-8">
              <h3 className="text-xl font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors text-gray-900">
                  Create New Project
                </button>
                <button className="w-full text-left py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors text-gray-900">
                  Import Data
                </button>
                <button className="w-full text-left py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors text-gray-900">
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Form Elements */}
        <section className="mb-20">
          <h2 className="text-3xl font-light text-gray-900 mb-12">Form Elements</h2>
          <div className="max-w-2xl bg-white border border-gray-100 rounded-xl p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Project Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-colors"
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                <textarea 
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-colors resize-none"
                  rows={4}
                  placeholder="Project description..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Status</label>
                <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-colors">
                  <option>Active</option>
                  <option>Pending</option>
                  <option>Completed</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Table Example */}
        <section className="mb-20">
          <h2 className="text-3xl font-light text-gray-900 mb-12">Data Tables</h2>
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Project</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Status</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Progress</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Due Date</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-50 hover:bg-gray-25 transition-colors">
                  <td className="py-4 px-6 text-gray-900">Fiber Installation - CBD</td>
                  <td className="py-4 px-6">
                    <span className="inline-flex px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">Active</span>
                  </td>
                  <td className="py-4 px-6 text-gray-600">75%</td>
                  <td className="py-4 px-6 text-gray-600">Dec 15, 2024</td>
                </tr>
                <tr className="border-b border-gray-50 hover:bg-gray-25 transition-colors">
                  <td className="py-4 px-6 text-gray-900">Network Upgrade - Suburbs</td>
                  <td className="py-4 px-6">
                    <span className="inline-flex px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">Planning</span>
                  </td>
                  <td className="py-4 px-6 text-gray-600">25%</td>
                  <td className="py-4 px-6 text-gray-600">Jan 30, 2025</td>
                </tr>
                <tr className="hover:bg-gray-25 transition-colors">
                  <td className="py-4 px-6 text-gray-900">Equipment Maintenance</td>
                  <td className="py-4 px-6">
                    <span className="inline-flex px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">Pending</span>
                  </td>
                  <td className="py-4 px-6 text-gray-600">0%</td>
                  <td className="py-4 px-6 text-gray-600">Nov 20, 2024</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Color Palette */}
        <section>
          <h2 className="text-3xl font-light text-gray-900 mb-12">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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