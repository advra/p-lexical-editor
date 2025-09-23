const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const envLevel = process.env.NEXT_PUBLIC_LOG_LEVEL || 'info';
const currentLevel = levels[envLevel] ?? levels.info;

const isClient = typeof window !== 'undefined';
const showClient = process.env.NEXT_PUBLIC_LOG_CLIENT !== 'false';
const showServer = process.env.NEXT_PUBLIC_LOG_SERVER !== 'false';

function shouldLog() {
  return (isClient && showClient) || (!isClient && showServer);
}

export function createLogger(fileName) {
  const prefix = `[${isClient ? 'CLIENT' : 'SERVER'}][${fileName}]`;

  const logAtLevel = (level, method, ...args) => {
    if (currentLevel >= levels[level] && shouldLog()) {
      const logFn = console[method] || console.log;
      logFn(`${prefix} [${level.toUpperCase()}]`, ...args);
      //console.log(`${prefix} [${level.toUpperCase()}]`, ...args);
    }
  };

  return {
    error: (...args) => logAtLevel('error', 'error', ...args),
    warn: (...args) => logAtLevel('warn', 'warn', ...args),
    info: (...args) => logAtLevel('info', 'info', ...args),
    debug: (...args) => logAtLevel('debug', 'debug', ...args),
  };
}
