export const onRenderCallback = (
  id: any,
  phase: any,
  actualDuration: any,
  baseDuration: any,
  startTime: any,
  commitTime: any,
) => {
  console.log(`[Profiler] ${id} - ${phase}`, { actualDuration, commitTime });
};
