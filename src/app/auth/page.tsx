"use client";
import { useState } from "react";
import { UserIcon, CogIcon, ShieldCheckIcon, BellIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'technician' | 'viewer';
  department: string;
  location: string;
  phone: string;
  avatar?: string;
  lastLogin: string;
  status: 'active' | 'inactive' | 'suspended';
}

const DEMO_USER: User = {
  id: "1",
  name: "John Velocity",
  email: "john@velocityfibre.com",
  role: "admin",
  department: "Operations",
  location: "Cape Town HQ",
  phone: "+27 21 123 4567",
  lastLogin: "2024-01-15 09:30",
  status: "active"
};

const ROLES = [
  { value: 'admin', label: 'Administrator', description: 'Full system access' },
  { value: 'manager', label: 'Project Manager', description: 'Manage projects and teams' },
  { value: 'technician', label: 'Field Technician', description: 'Execute tasks and update progress' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access to reports' }
];

const DEPARTMENTS = ['Operations', 'Technical', 'Sales', 'Support', 'Management'];
const LOCATIONS = ['Cape Town HQ', 'Johannesburg Office', 'Durban Branch', 'Field Operations'];

const DEMO_USERS: User[] = [
  DEMO_USER,
  {
    id: "2",
    name: "Sarah Manager",
    email: "sarah@velocityfibre.com",
    role: "manager",
    department: "Operations",
    location: "Johannesburg Office",
    phone: "+27 11 234 5678",
    lastLogin: "2024-01-15 14:22",
    status: "active"
  },
  {
    id: "3",
    name: "Mike Technician",
    email: "mike@velocityfibre.com",
    role: "technician",
    department: "Technical",
    location: "Field Operations",
    phone: "+27 82 345 6789",
    lastLogin: "2024-01-15 08:15",
    status: "active"
  }
];

const PERMISSIONS = {
  dashboard: { label: 'Dashboard', description: 'View main dashboard' },
  projects: { label: 'Projects', description: 'View and manage projects' },
  tasks: { label: 'Tasks', description: 'View and manage tasks' },
  customers: { label: 'Customers', description: 'View and manage customers' },
  materials: { label: 'Materials', description: 'View and manage inventory' },
  suppliers: { label: 'Suppliers', description: 'View and manage suppliers' },
  staff: { label: 'Staff Management', description: 'Manage staff members' },
  analytics: { label: 'Analytics', description: 'View analytics and reports' },
  admin: { label: 'Admin Panel', description: 'Access admin functions' },
  audit: { label: 'Audit Logs', description: 'View system audit logs' },
  settings: { label: 'Settings', description: 'Manage system settings' }
};

const ROLE_PERMISSIONS = {
  admin: Object.keys(PERMISSIONS),
  manager: ['dashboard', 'projects', 'tasks', 'customers', 'materials', 'staff', 'analytics'],
  technician: ['dashboard', 'projects', 'tasks', 'materials'],
  viewer: ['dashboard', 'projects', 'analytics']
};

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'preferences' | 'users'>('profile');
  const [user, setUser] = useState<User>(DEMO_USER);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editedUser, setEditedUser] = useState<User>(DEMO_USER);
  const [users, setUsers] = useState<User[]>(DEMO_USERS);
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userPermissions, setUserPermissions] = useState<Record<string, string[]>>({
    "1": ROLE_PERMISSIONS.admin,
    "2": ROLE_PERMISSIONS.manager,
    "3": ROLE_PERMISSIONS.technician
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: true,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginNotifications: true
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    taskAssignments: true,
    projectUpdates: true,
    systemAlerts: true,
    weeklyReports: false,
    mobileNotifications: true
  });

  // Preferences
  const [preferences, setPreferences] = useState({
    theme: 'system',
    language: 'en',
    timezone: 'Africa/Johannesburg',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h'
  });

  const handleSave = () => {
    setUser(editedUser);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  const getRoleStatusBadge = (role: string) => {
    switch (role) {
      case 'admin': return 'ff-status-pending'; // Red-ish for admin
      case 'manager': return 'ff-status-planning'; // Blue for manager
      case 'technician': return 'ff-status-active'; // Green for technician
      case 'viewer': return 'ff-status-completed'; // Gray for viewer
      default: return 'ff-status-completed';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'ff-status-active';
      case 'inactive': return 'ff-status-pending';
      case 'suspended': return 'ff-status-pending';
      default: return 'ff-status-completed';
    }
  };

  return (
    <div className="ff-page-container">
      {/* Header */}
      <div className="ff-page-header">
        <h1 className="ff-page-title">User Settings</h1>
        <p className="ff-page-subtitle">Manage your account settings and preferences</p>
      </div>

      {/* Profile Header */}
      <div className="ff-card mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <UserIcon className="h-8 w-8 text-gray-500" />
          </div>
          <div className="flex-1">
            <h2 className="ff-heading-large">{user.name}</h2>
            <p className="ff-secondary-text">{user.email}</p>
            <div className="flex items-center space-x-3 mt-2">
              <span className={`${getRoleStatusBadge(user.role)}`}>
                {ROLES.find(r => r.value === user.role)?.label}
              </span>
              <span className={`${getStatusBadge(user.status)}`}>
                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="ff-muted-text">Last login</p>
            <p className="ff-body-text">{user.lastLogin}</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-100 mb-6">
        <nav className="flex space-x-8">
          {[
            { key: 'profile', label: 'Profile', icon: UserIcon },
            { key: 'security', label: 'Security', icon: ShieldCheckIcon },
            { key: 'notifications', label: 'Notifications', icon: BellIcon },
            { key: 'preferences', label: 'Preferences', icon: CogIcon },
            { key: 'users', label: 'User Management', icon: UserIcon }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === key
                  ? 'border-gray-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="ff-card">
        {activeTab === 'profile' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="ff-card-title">Profile Information</h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="ff-button-primary"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="space-x-3">
                  <button
                    onClick={handleSave}
                    className="ff-button-primary"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="ff-label">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUser.name}
                    onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                    className="ff-input"
                  />
                ) : (
                  <p className="ff-body-text">{user.name}</p>
                )}
              </div>

              <div>
                <label className="ff-label">Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedUser.email}
                    onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                    className="ff-input"
                  />
                ) : (
                  <p className="ff-body-text">{user.email}</p>
                )}
              </div>

              <div>
                <label className="ff-label">Role</label>
                {isEditing ? (
                  <select
                    value={editedUser.role}
                    onChange={(e) => setEditedUser({ ...editedUser, role: e.target.value as any })}
                    className="ff-input"
                  >
                    {ROLES.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                ) : (
                  <p className="ff-body-text">{ROLES.find(r => r.value === user.role)?.label}</p>
                )}
              </div>

              <div>
                <label className="ff-label">Department</label>
                {isEditing ? (
                  <select
                    value={editedUser.department}
                    onChange={(e) => setEditedUser({ ...editedUser, department: e.target.value })}
                    className="ff-input"
                  >
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                ) : (
                  <p className="ff-body-text">{user.department}</p>
                )}
              </div>

              <div>
                <label className="ff-label">Location</label>
                {isEditing ? (
                  <select
                    value={editedUser.location}
                    onChange={(e) => setEditedUser({ ...editedUser, location: e.target.value })}
                    className="ff-input"
                  >
                    {LOCATIONS.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                ) : (
                  <p className="ff-body-text">{user.location}</p>
                )}
              </div>

              <div>
                <label className="ff-label">Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedUser.phone}
                    onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                    className="ff-input"
                  />
                ) : (
                  <p className="ff-body-text">{user.phone}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div>
            <h3 className="ff-card-title mb-6">Security Settings</h3>
            
            <div className="space-y-8">
              {/* Password Section */}
              <div className="border-b border-gray-100 pb-6">
                <h4 className="ff-heading-medium mb-4">Password</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="ff-label">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter current password"
                        className="ff-input pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="ff-label">New Password</label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      className="ff-input"
                    />
                  </div>
                </div>
                <button className="mt-4 ff-button-primary">
                  Update Password
                </button>
              </div>

              {/* Two-Factor Authentication */}
              <div className="border-b border-gray-100 pb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="ff-heading-medium">Two-Factor Authentication</h4>
                    <p className="ff-secondary-text">Add an extra layer of security to your account</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securitySettings.twoFactorEnabled}
                      onChange={(e) => setSecuritySettings({...securitySettings, twoFactorEnabled: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-500"></div>
                  </label>
                </div>
              </div>

              {/* Session Settings */}
              <div>
                <h4 className="ff-heading-medium mb-4">Session Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="ff-label">Session Timeout (minutes)</label>
                    <select
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)})}
                      className="ff-input"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={120}>2 hours</option>
                    </select>
                  </div>
                  <div>
                    <label className="ff-label">Password Expiry (days)</label>
                    <select
                      value={securitySettings.passwordExpiry}
                      onChange={(e) => setSecuritySettings({...securitySettings, passwordExpiry: parseInt(e.target.value)})}
                      className="ff-input"
                    >
                      <option value={30}>30 days</option>
                      <option value={60}>60 days</option>
                      <option value={90}>90 days</option>
                      <option value={180}>6 months</option>
                      <option value={365}>1 year</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <h3 className="ff-card-title mb-6">Notification Preferences</h3>
            
            <div className="space-y-6">
              {Object.entries({
                emailNotifications: 'Email Notifications',
                taskAssignments: 'Task Assignments',
                projectUpdates: 'Project Updates',
                systemAlerts: 'System Alerts',
                weeklyReports: 'Weekly Reports',
                mobileNotifications: 'Mobile Push Notifications'
              }).map(([key, label]) => (
                <div key={key} className="flex justify-between items-center">
                  <div>
                    <h4 className="ff-heading-medium">{label}</h4>
                    <p className="ff-secondary-text">
                      {key === 'emailNotifications' && 'Receive email notifications for important updates'}
                      {key === 'taskAssignments' && 'Get notified when tasks are assigned to you'}
                      {key === 'projectUpdates' && 'Receive updates about projects you\'re involved in'}
                      {key === 'systemAlerts' && 'Important system-wide notifications'}
                      {key === 'weeklyReports' && 'Weekly summary reports via email'}
                      {key === 'mobileNotifications' && 'Push notifications on mobile devices'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings[key as keyof typeof notificationSettings]}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        [key]: e.target.checked
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-500"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div>
            <h3 className="ff-card-title mb-6">System Preferences</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="ff-label">Theme</label>
                <select
                  value={preferences.theme}
                  onChange={(e) => setPreferences({...preferences, theme: e.target.value})}
                  className="ff-input"
                >
                  <option value="system">System Default</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              <div>
                <label className="ff-label">Language</label>
                <select
                  value={preferences.language}
                  onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                  className="ff-input"
                >
                  <option value="en">English</option>
                  <option value="af">Afrikaans</option>
                  <option value="zu">Zulu</option>
                </select>
              </div>

              <div>
                <label className="ff-label">Timezone</label>
                <select
                  value={preferences.timezone}
                  onChange={(e) => setPreferences({...preferences, timezone: e.target.value})}
                  className="ff-input"
                >
                  <option value="Africa/Johannesburg">Africa/Johannesburg (SAST)</option>
                  <option value="Africa/Cape_Town">Africa/Cape_Town (SAST)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>

              <div>
                <label className="ff-label">Date Format</label>
                <select
                  value={preferences.dateFormat}
                  onChange={(e) => setPreferences({...preferences, dateFormat: e.target.value})}
                  className="ff-input"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div>
                <label className="ff-label">Time Format</label>
                <select
                  value={preferences.timeFormat}
                  onChange={(e) => setPreferences({...preferences, timeFormat: e.target.value})}
                  className="ff-input"
                >
                  <option value="24h">24 Hour</option>
                  <option value="12h">12 Hour (AM/PM)</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <button className="ff-button-primary">
                Save Preferences
              </button>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="ff-card-title">User Management</h3>
              <button
                onClick={() => setShowAddUser(true)}
                className="ff-button-primary flex items-center gap-2"
              >
                <UserIcon className="h-4 w-4" />
                Add New User
              </button>
            </div>

            {/* Users List */}
            <div className="space-y-4 mb-8">
              {users.map((u) => (
                <div key={u.id} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-gray-500" />
                      </div>
                      <div>
                        <h4 className="ff-heading-medium">{u.name}</h4>
                        <p className="ff-secondary-text">{u.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`${getRoleStatusBadge(u.role)}`}>
                            {ROLES.find(r => r.value === u.role)?.label}
                          </span>
                          <span className={`${getStatusBadge(u.status)}`}>
                            {u.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <button
                        onClick={() => setSelectedUserId(selectedUserId === u.id ? null : u.id)}
                        className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                      >
                        {selectedUserId === u.id ? 'Hide' : 'Manage'} Permissions
                      </button>
                    </div>
                  </div>

                  {/* Permissions Section */}
                  {selectedUserId === u.id && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <h5 className="ff-heading-medium mb-4">Access Permissions</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(PERMISSIONS).map(([key, perm]) => {
                          const isChecked = userPermissions[u.id]?.includes(key) || false;
                          return (
                            <label key={key} className="flex items-start space-x-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  const newPerms = { ...userPermissions };
                                  if (e.target.checked) {
                                    newPerms[u.id] = [...(newPerms[u.id] || []), key];
                                  } else {
                                    newPerms[u.id] = (newPerms[u.id] || []).filter(p => p !== key);
                                  }
                                  setUserPermissions(newPerms);
                                }}
                                className="mt-1 h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                              />
                              <div>
                                <p className="ff-body-text font-medium">{perm.label}</p>
                                <p className="ff-muted-text text-xs">{perm.description}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                      <div className="mt-4 flex justify-end">
                        <button className="ff-button-primary">
                          Save Permissions
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add User Modal */}
            {showAddUser && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-md w-full p-8">
                  <h3 className="ff-card-title mb-6">Add New User</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const newUser: User = {
                      id: Date.now().toString(),
                      name: formData.get('name') as string,
                      email: formData.get('email') as string,
                      role: formData.get('role') as any,
                      department: formData.get('department') as string,
                      location: formData.get('location') as string,
                      phone: formData.get('phone') as string,
                      lastLogin: '-',
                      status: 'active'
                    };
                    setUsers([...users, newUser]);
                    setUserPermissions({
                      ...userPermissions,
                      [newUser.id]: ROLE_PERMISSIONS[newUser.role]
                    });
                    setShowAddUser(false);
                  }}>
                    <div className="space-y-4">
                      <div>
                        <label className="ff-label">Full Name *</label>
                        <input
                          name="name"
                          type="text"
                          required
                          className="ff-input"
                        />
                      </div>
                      <div>
                        <label className="ff-label">Email *</label>
                        <input
                          name="email"
                          type="email"
                          required
                          className="ff-input"
                        />
                      </div>
                      <div>
                        <label className="ff-label">Role *</label>
                        <select
                          name="role"
                          required
                          className="ff-input"
                        >
                          {ROLES.map(role => (
                            <option key={role.value} value={role.value}>{role.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="ff-label">Department *</label>
                        <select
                          name="department"
                          required
                          className="ff-input"
                        >
                          {DEPARTMENTS.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="ff-label">Location *</label>
                        <select
                          name="location"
                          required
                          className="ff-input"
                        >
                          {LOCATIONS.map(loc => (
                            <option key={loc} value={loc}>{loc}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="ff-label">Phone</label>
                        <input
                          name="phone"
                          type="tel"
                          className="ff-input"
                        />
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowAddUser(false)}
                        className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="ff-button-primary"
                      >
                        Add User
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}