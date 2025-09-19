export type User = {
  // id: string; // not used?
  username: string;
  roles: string[] | null;
};

export type Session = {
  user: User;
  sessionId: string;
};
