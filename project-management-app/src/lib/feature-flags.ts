import { createContext, useContext, useState, ReactNode } from 'react';

// Define all available feature flags
export enum FeatureFlag {
  USE_REACT_QUERY = 'useReactQuery',
  OPTIMIZED_PROJECT_QUERIES = 'optimizedProjectQueries',
  OPTIMIZED_TASK_QUERIES = 'optimizedTaskQueries',
  USE_ERROR_BOUNDARIES = 'useErrorBoundaries',
  PERFORMANCE_MONITORING = 'performanceMonitoring',
}

// Default state of all feature flags (all disabled by default)
const DEFAULT_FLAGS: Record<FeatureFlag, boolean> = {
  [FeatureFlag.USE_REACT_QUERY]: false,
  [FeatureFlag.OPTIMIZED_PROJECT_QUERIES]: false,
  [FeatureFlag.OPTIMIZED_TASK_QUERIES]: false,
  [FeatureFlag.USE_ERROR_BOUNDARIES]: false,
  [FeatureFlag.PERFORMANCE_MONITORING]: false,
};

// Type for the feature flags context
type FeatureFlagsContextType = {
  flags: Record<FeatureFlag, boolean>;
  enableFlag: (flag: FeatureFlag) => void;
  disableFlag: (flag: FeatureFlag) => void;
  toggleFlag: (flag: FeatureFlag) => void;
  isEnabled: (flag: FeatureFlag) => boolean;
};

// Create context with default values
const FeatureFlagsContext = createContext<FeatureFlagsContextType>({
  flags: DEFAULT_FLAGS,
  enableFlag: () => {},
  disableFlag: () => {},
  toggleFlag: () => {},
  isEnabled: () => false,
});

// Provider component for feature flags
export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<Record<FeatureFlag, boolean>>(DEFAULT_FLAGS);

  const enableFlag = (flag: FeatureFlag) => {
    setFlags((prevFlags) => ({
      ...prevFlags,
      [flag]: true,
    }));
  };

  const disableFlag = (flag: FeatureFlag) => {
    setFlags((prevFlags) => ({
      ...prevFlags,
      [flag]: false,
    }));
  };

  const toggleFlag = (flag: FeatureFlag) => {
    setFlags((prevFlags) => ({
      ...prevFlags,
      [flag]: !prevFlags[flag],
    }));
  };

  const isEnabled = (flag: FeatureFlag) => flags[flag];

  return (
    <FeatureFlagsContext.Provider
      value={{ flags, enableFlag, disableFlag, toggleFlag, isEnabled }}
    >
      {children}
    </FeatureFlagsContext.Provider>
  );
}

// Hook to use feature flags
export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext);
  if (context === undefined) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
  }
  return context;
}

// Utility function to conditionally render based on feature flag
export function FeatureGated({
  flag,
  children,
  fallback = null,
}: {
  flag: FeatureFlag;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(flag) ? <>{children}</> : <>{fallback}</>;
}
