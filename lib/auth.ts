// lib/auth.ts
const TOKEN_KEY = 'auth_token';
const MEMBER_ID_KEY = 'member_id';
const ROLE_KEY = "auth_role";
const EMAIL_KEY = "auth_email";
const NICKNAME_KEY = "auth_nickname"; // ✅ 추가
const PUBLIC_Id_KEY = "public_id"

export function getTokenExp(token: string): number | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload).exp || null;
  } catch {
    return null;
  }
}

export const auth = {
  // 토큰 저장
  setToken(token: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
  },

  // 토큰 가져오기
  async getToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  // 토큰 삭제
  removeToken() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
  },

  // 토큰 존재 여부 확인
  async hasToken(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  },

  // ✅ Role 저장 및 조회
  setRole(role: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ROLE_KEY, role);
  },

  async getRole(): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ROLE_KEY);
  },

  removeRole() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ROLE_KEY);
  },

  // ✅ 이메일 저장 및 조회
  setEmail(email: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(EMAIL_KEY, email);
  },

  getEmail(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(EMAIL_KEY);
  },

  removeEmail() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(EMAIL_KEY);
  },

  // ✅ memberId 저장 및 조회 (선택사항)
  setMemberId(id: number) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(MEMBER_ID_KEY, String(id));
  },

  getMemberId(): number | null {
    if (typeof window === 'undefined') return null;
    const id = localStorage.getItem(MEMBER_ID_KEY);
    return id ? parseInt(id, 10) : null;
  },

  removeMemberId() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(MEMBER_ID_KEY);
  },

  // ✅ 닉네임 저장/조회/삭제 (새로 추가)
  setNickname(nickname: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(NICKNAME_KEY, nickname);
  },

  getNickname(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(NICKNAME_KEY);
  },

  removeNickname() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(NICKNAME_KEY);
  },

  setPublicId(id: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PUBLIC_Id_KEY, id);
  },

  getPublicId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(PUBLIC_Id_KEY);
  },

  removePublicId() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(PUBLIC_Id_KEY);
  },
};
