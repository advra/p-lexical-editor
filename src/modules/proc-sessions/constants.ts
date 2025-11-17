export const SESSION_STATUS = ['ACTIVE', 'COMPLETED', 'CANCELED'] as const;
export type SessionStatus = (typeof SESSION_STATUS)[number];
