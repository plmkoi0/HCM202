// Phiên chơi online lưu trên máy (mục 15.4): playerId + token để tải lại trang vẫn về đúng phòng;
// biệt danh + màu lần trước. localStorage bọc try/catch (lib/storage).
import { load, remove, save } from '../lib/storage'
import type { Session } from '../net/api'

const SESSION_KEY = 'online.session.v1'
const PROFILE_KEY = 'online.profile.v1'

export function loadSession(): Session | null {
  const s = load<Session | null>(SESSION_KEY, null)
  return s && typeof s.code === 'string' && typeof s.playerId === 'string' && typeof s.token === 'string' ? s : null
}

export function storeSession(s: Session): void {
  save(SESSION_KEY, s)
}

export function clearSession(): void {
  remove(SESSION_KEY)
}

export interface Profile {
  name: string
  color: number
}

export function loadProfile(): Profile | null {
  const p = load<Profile | null>(PROFILE_KEY, null)
  return p && typeof p.name === 'string' && Number.isInteger(p.color) ? p : null
}

export function storeProfile(p: Profile): void {
  save(PROFILE_KEY, p)
}

/** /p/ABCDE → "ABCDE" */
export function codeFromPath(path: string): string | null {
  const m = /^\/p\/([A-Za-z0-9]{5})\/?$/.exec(path)
  return m ? m[1]!.toUpperCase() : null
}

export function inviteLink(code: string): string {
  return `${location.origin}/p/${code}`
}
