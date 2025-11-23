export const devLog = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEV]', ...args);
    }
  },
  
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[DEV WARN]', ...args);
    }
  },
  
  error: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[DEV ERROR]', ...args);
    }
  },
  
  table: (data: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.table(data);
    }
  }
};