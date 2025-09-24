function isAdmin(user: SessionUser) { return user.roles?.includes('admin'); }

function canSeeAcl(user: SessionUser, proc: Proc) {
  if (!user) return false;
  return isAdmin(user) ||
         user.username === proc.metadata.owner ||
         proc.metadata.sharedWith.includes(user.username);
}

function canReadProc(user: SessionUser, proc: Proc) {
  if (proc.status === 'published') return true; // public content
  return canSeeAcl(user, proc);                 // drafts/archived restricted
}