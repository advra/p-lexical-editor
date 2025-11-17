// Seconds since epoch
export const nowUnixSeconds = (): number => Math.floor(Date.now() / 1000);

// Date rounded to the current second (from unix seconds)
export const createUnixDatetime = (): Date => new Date(nowUnixSeconds() * 1000);

export const displayUnixDatetimeInTimeZone = (
  date: Date,
  // IANA tz like 'UTC' or 'America/Los_Angeles'
  timeZone: Intl.DateTimeFormatOptions['timeZone'],
  locale: string = 'en-US',
  options: Intl.DateTimeFormatOptions = {},
): string => {
  const base: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  };
  try {
    return date.toLocaleString(locale, { ...base, ...options, timeZone });
  } catch {
    // Fallback if an invalid timezone string is passed
    return date.toLocaleString(locale, { ...base, ...options });
  }
};

// Format a Date using locale + options and return a string
export const displayUnixDatetime = (
  date: Date,
  locale: string = 'en-US',
  options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  },
): string => date.toLocaleString(locale, options);

// Helpers if you have a unix timestamp already:
export const fromUnixSeconds = (unixSeconds: number): Date =>
  new Date(unixSeconds * 1000);

export const toUnixSeconds = (date: Date): number =>
  Math.floor(date.getTime() / 1000);
