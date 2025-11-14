import { User } from "@/modules/auth/types";

export const isUserAdmin = (u: User | null) => {
  return u?.roles?.some((role) => {
        const r = role.toLowerCase();
        return r === 'admin' || r === 'super-admin';
      }) ?? false;
}