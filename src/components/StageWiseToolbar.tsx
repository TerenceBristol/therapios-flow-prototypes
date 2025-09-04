'use client';

import { useEffect } from 'react';

export default function StageWiseToolbar() {
  useEffect(() => {
    // Only initialize StageWise in development mode
    if (process.env.NODE_ENV === 'development') {
      const initStageWise = async () => {
        try {
          const { initToolbar } = await import('@stagewise/toolbar');
          initToolbar({
            plugins: [],
          });
          console.log('StageWise toolbar initialized');
        } catch (error) {
          console.warn('Failed to initialize StageWise toolbar:', error);
        }
      };

      // Add a slight delay to ensure DOM is ready
      const timer = setTimeout(initStageWise, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // This component doesn't render anything visible
  return null;
}
