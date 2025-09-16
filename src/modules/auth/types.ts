export type User = {
  id: string;
  username: string;
  roles: string[] | null;
}

export type Session = {
  username: string,
  roles: string[],
  sessionId: string
}
