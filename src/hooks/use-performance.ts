import { useSettings } from '@/providers/settings-provider';

export interface PerformancePreferences {
  performanceMode: boolean;
  animationsEnabled: boolean;
  autoplay: boolean;
  dataSaver: boolean;
  listProps: {
    removeClippedSubviews: boolean;
    initialNumToRender: number;
    maxToRenderPerBatch: number;
    windowSize: number;
  };
}

export function usePerformance(): PerformancePreferences {
  const { settings } = useSettings();
  const performanceMode = settings.performanceMode;
  const animationsEnabled = !performanceMode && !settings.reducedMotion;
  return {
    performanceMode,
    animationsEnabled,
    autoplay: settings.autoplay && !performanceMode,
    dataSaver: settings.dataSaver || performanceMode,
    listProps: performanceMode
      ? {
          removeClippedSubviews: true,
          initialNumToRender: 2,
          maxToRenderPerBatch: 3,
          windowSize: 3,
        }
      : {
          removeClippedSubviews: false,
          initialNumToRender: 3,
          maxToRenderPerBatch: 5,
          windowSize: 5,
        },
  };
}
