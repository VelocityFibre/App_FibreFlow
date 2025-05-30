"use client";

import React, { useState } from "react";
import { useRealtime, RealtimeStatusIndicator, PresenceIndicator, NotificationBadge } from "@/contexts/RealtimeContext";
import { useProjectRealtime, useNotifications, useRealtimeStatus } from "@/hooks/useRealtimeUpdates";
import { supabase } from "@/lib/supabaseClient";

// Test component for presence tracking
export function PresenceTest() {
  const { presenceState, updatePresenceLocation } = useRealtime();
  const [testProjectId, setTestProjectId] = useState('');
  const [testTaskId, setTestTaskId] = useState('');

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Presence Tracking Test</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Test Project ID:</label>
          <input
            type="text"
            value={testProjectId}
            onChange={(e) => setTestProjectId(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter project ID to simulate presence"
          />
          <button
            onClick={() => updatePresenceLocation({ projectId: testProjectId })}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Join Project
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Test Task ID:</label>
          <input
            type="text"
            value={testTaskId}
            onChange={(e) => setTestTaskId(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter task ID to simulate editing"
          />
          <button
            onClick={() => updatePresenceLocation({ taskId: testTaskId })}
            className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Start Editing Task
          </button>
        </div>

        <div>
          <h4 className="font-medium">Current Presence State:</h4>
          <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-auto">
            {JSON.stringify(presenceState, null, 2)}
          </pre>
        </div>

        <div className="flex gap-4">
          <PresenceIndicator projectId={testProjectId} showNames={true} />
          <PresenceIndicator taskId={testTaskId} showNames={true} />
        </div>
      </div>
    </div>
  );
}

// Test component for notifications
export function NotificationTest() {
  const { notifications, unreadCount, markAsRead, clearNotifications } = useNotifications();
  const [testMessage, setTestMessage] = useState('');

  const sendTestNotification = () => {
    // Simulate a notification by dispatching a custom event
    const notification = {
      type: 'task_assignment' as const,
      entityId: 'test-task-123',
      entityType: 'task' as const,
      userId: 'current-user',
      data: {
        taskTitle: testMessage || 'Test Task',
        assignedBy: 'test-user',
      },
      timestamp: new Date().toISOString(),
    };

    window.dispatchEvent(new CustomEvent('fibreflow:notification', {
      detail: notification
    }));
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        Notification System Test
        <NotificationBadge />
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Test Notification Message:</label>
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter test message"
          />
          <button
            onClick={sendTestNotification}
            className="mt-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Send Test Notification
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => markAsRead()}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Mark All Read
          </button>
          <button
            onClick={clearNotifications}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear All
          </button>
        </div>

        <div>
          <h4 className="font-medium">Unread Count: {unreadCount}</h4>
          <h4 className="font-medium">Recent Notifications ({notifications.length}):</h4>
          <div className="mt-2 max-h-60 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-gray-500">No notifications</p>
            ) : (
              notifications.slice(0, 10).map((notification, index) => (
                <div key={index} className="p-2 mb-2 border rounded bg-gray-50 dark:bg-gray-700">
                  <div className="text-sm font-medium">{notification.type}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {notification.data?.taskTitle || 'No title'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Test component for database change simulation
export function DatabaseChangeTest() {
  const [projectId, setProjectId] = useState('');
  const [status, setStatus] = useState('');

  const simulateProjectUpdate = async () => {
    if (!projectId) {
      alert('Please enter a project ID');
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .update({ 
          status: status || 'test-status',
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (error) {
        console.error('Error updating project:', error);
        alert('Error: ' + error.message);
      } else {
        alert('Project updated successfully! Check for real-time updates.');
      }
    } catch (error) {
      console.error('Exception:', error);
      alert('Exception occurred');
    }
  };

  const simulateTaskUpdate = async () => {
    try {
      // Get the first available task to update
      const { data: tasks, error: tasksError } = await supabase
        .from('project_tasks')
        .select('id')
        .limit(1);

      if (tasksError || !tasks || tasks.length === 0) {
        alert('No tasks found to update');
        return;
      }

      const { error } = await supabase
        .from('project_tasks')
        .update({ 
          status: 'test-updated',
          updated_at: new Date().toISOString()
        })
        .eq('id', tasks[0].id);

      if (error) {
        console.error('Error updating task:', error);
        alert('Error: ' + error.message);
      } else {
        alert('Task updated successfully! Check for real-time updates.');
      }
    } catch (error) {
      console.error('Exception:', error);
      alert('Exception occurred');
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Database Change Simulation</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Project ID to Update:</label>
          <input
            type="text"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter project ID"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">New Status:</label>
          <input
            type="text"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter new status (optional)"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={simulateProjectUpdate}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Update Project
          </button>
          <button
            onClick={simulateTaskUpdate}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Update Random Task
          </button>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>Use these buttons to simulate database changes and test real-time subscriptions.</p>
          <p>Make sure you have the real-time subscription active on the project you're testing.</p>
        </div>
      </div>
    </div>
  );
}

// Connection status test
export function ConnectionStatusTest() {
  const { isConnected, connectionCount, subscriptions } = useRealtimeStatus();

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        Connection Status
        <RealtimeStatusIndicator />
      </h3>
      
      <div className="space-y-2">
        <div>
          <span className="font-medium">Connected: </span>
          <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
            {isConnected ? 'Yes' : 'No'}
          </span>
        </div>
        
        <div>
          <span className="font-medium">Active Subscriptions: </span>
          <span>{connectionCount}</span>
        </div>

        <div>
          <h4 className="font-medium mt-4 mb-2">Subscription Details:</h4>
          <pre className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-auto">
            {JSON.stringify(subscriptions, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

// Main test dashboard
export function RealtimeTestDashboard() {
  const realtime = useRealtime();

  if (!realtime.isRealtimeEnabled) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800">Real-time Features Disabled</h3>
        <p className="text-yellow-700">
          Real-time features are disabled by feature flag. Enable the RealTimeNotifications feature flag to test.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">FibreFlow Real-time Test Dashboard</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Test all real-time collaboration features
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConnectionStatusTest />
        <PresenceTest />
        <NotificationTest />
        <DatabaseChangeTest />
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Testing Instructions:
        </h4>
        <ol className="list-decimal list-inside text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>Open this page in multiple browser tabs/windows</li>
          <li>Test presence tracking by entering the same project/task IDs</li>
          <li>Send test notifications to see real-time updates</li>
          <li>Simulate database changes to test subscription triggers</li>
          <li>Check the connection status to verify subscriptions are active</li>
        </ol>
      </div>
    </div>
  );
}