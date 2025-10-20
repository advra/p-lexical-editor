/*
    Checks whether there is an active proc session for the current user
*/
export const checkActiveSession = async (procId: string, username?: string) => {
  if (!procId) return;

  try {
    let url = `/api/proc-sessions?procId=${procId}&status=active`;
    if (username) {
      url += `&username=${username}`;
    }

    const response = await fetch(url);
    if (response.ok) {
      const result = await response.json();
      // Return the first active session (for current user if username provided)
      return result.sessions.length > 0 ? result.sessions[0] : null;
    }
  } catch (error) {
    console.error('Failed to check active session:', error);
  }
};
