// Define all available feature flags
// Note: React Query and Optimized Queries are now always enabled (graduated from flags)
export enum FeatureFlag {
  USE_ERROR_BOUNDARIES = 'useErrorBoundaries',
  PERFORMANCE_MONITORING = 'performanceMonitoring',
  ANALYTICS_DASHBOARD = 'analyticsDashboard',
}

// Simple feature flags implementation that doesn't require context
// All flags are disabled by default for safety
const featureFlags: Record<FeatureFlag, boolean> = {
  [FeatureFlag.USE_ERROR_BOUNDARIES]: false,
  [FeatureFlag.PERFORMANCE_MONITORING]: true,
  [FeatureFlag.ANALYTICS_DASHBOARD]: false,
};

// Check if a feature flag is enabled
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return featureFlags[flag] === true;
}

// Enable a feature flag
export function enableFeature(flag: FeatureFlag): void {
  featureFlags[flag] = true;
}

// Disable a feature flag
export function disableFeature(flag: FeatureFlag): void {
  featureFlags[flag] = false;
}

// Toggle a feature flag
export function toggleFeature(flag: FeatureFlag): void {
  featureFlags[flag] = !featureFlags[flag];
}

// Get all feature flags
export function getAllFeatureFlags(): Record<FeatureFlag, boolean> {
  return { ...featureFlags };
}

// Reset all feature flags to default (disabled)
export function resetFeatureFlags(): void {
  Object.keys(featureFlags).forEach(key => {
    featureFlags[key as FeatureFlag] = false;
  });
}
