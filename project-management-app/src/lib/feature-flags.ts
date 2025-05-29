// Define all available feature flags
export enum FeatureFlag {
  USE_REACT_QUERY = 'useReactQuery',
  OPTIMIZED_PROJECT_QUERIES = 'optimizedProjectQueries',
  OPTIMIZED_TASK_QUERIES = 'optimizedTaskQueries',
  USE_ERROR_BOUNDARIES = 'useErrorBoundaries',
  PERFORMANCE_MONITORING = 'performanceMonitoring',
}

// Simple feature flags implementation that doesn't require context
// All flags are disabled by default for safety
const featureFlags: Record<FeatureFlag, boolean> = {
  [FeatureFlag.USE_REACT_QUERY]: false,
  [FeatureFlag.OPTIMIZED_PROJECT_QUERIES]: false,
  [FeatureFlag.OPTIMIZED_TASK_QUERIES]: false,
  [FeatureFlag.USE_ERROR_BOUNDARIES]: false,
  [FeatureFlag.PERFORMANCE_MONITORING]: false,
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
