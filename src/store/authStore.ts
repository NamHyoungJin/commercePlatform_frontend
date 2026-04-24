import { create } from 'zustand';
import { tokenUtils } from '@/lib/tokenUtils';

interface Member {
  member_sid: string;
  member_id: string;
  name: string;
  nickname?: string;
  phone: string;
  email: string;
  email_receive?: boolean;
  sms_receive?: boolean;
  id_verified_email?: boolean;
  id_verified_phone?: boolean;
}

interface AuthState {
  member: Member | null;
  isAuthenticated: boolean;
  /** AuthBootstrap 세션 복원 완료 여부(첫 로드 후 true) */
  authReady: boolean;
  setAuth: (member: Member, accessToken: string) => void;
  setMember: (member: Member) => void;
  clearAuth: () => void;
  setAuthReady: (ready: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  member: null,
  isAuthenticated: false,
  authReady: false,

  setAuth: (member, accessToken) => {
    tokenUtils.setAccess(accessToken);
    set({ member, isAuthenticated: true });
  },

  setMember: (member) => set({ member }),

  clearAuth: () => {
    tokenUtils.clearTokens();
    set({ member: null, isAuthenticated: false });
  },

  setAuthReady: (ready) => set({ authReady: ready }),
}));
