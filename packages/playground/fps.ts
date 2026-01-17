import { computed, ref } from 'vue';

const frameTimes: number[] = [];
const calibrationSamples: number[] = [];
const CALIBRATION_LIMIT = 60;
let isCalibrating = true;
let lastFrameTime = 0;
let rafId: number | null = null;

export const currentFps = ref(0);
export const refreshRate = ref<number | null>(null);

export const efficiency = computed(() => {
  if (!refreshRate.value || refreshRate.value === 0) {
    return 0;
  }
  return Math.min(100, Math.round((currentFps.value / refreshRate.value) * 100));
});

function updateFps(timestamp: number) {
  if (lastFrameTime !== 0) {
    const dt = timestamp - lastFrameTime;

    if (isCalibrating) {
      calibrationSamples.push(dt);
      if (calibrationSamples.length >= CALIBRATION_LIMIT) {
        const sorted = [ ...calibrationSamples ].sort((a, b) => a - b);
        const medianDt = sorted[ Math.floor(sorted.length / 4) ];
        const estimatedHz = Math.round(1000 / medianDt);

        const commonRates = [ 60, 75, 90, 120, 144, 165, 240, 360 ];
        refreshRate.value = commonRates.reduce((prev, curr) => Math.abs(curr - estimatedHz) < Math.abs(prev - estimatedHz) ? curr : prev);
        isCalibrating = false;
      }
    }

    frameTimes.push(dt);
    if (frameTimes.length > 20) {
      frameTimes.shift();
    }

    if (frameTimes.length >= 5) {
      const avgDt = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
      const newFps = Math.round(1000 / avgDt);

      if (Math.abs(currentFps.value - newFps) > 0.5) {
        currentFps.value = newFps;
      }
    }
  }

  lastFrameTime = timestamp;
  rafId = requestAnimationFrame(updateFps);
}

export function startDetection() {
  rafId = requestAnimationFrame(updateFps);
}

export function stopDetection() {
  if (rafId) {
    cancelAnimationFrame(rafId);
  }
}
