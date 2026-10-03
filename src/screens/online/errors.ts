import { site } from '../../lib/gameData'
import { ApiError } from '../../net/api'

/** Lời báo lỗi tiếng Việt cho một lỗi API / mạng */
export function errorText(e: unknown): string {
  const code = e instanceof ApiError ? e.code : typeof e === 'string' ? e : 'NETWORK'
  const errs = site.errors as Record<string, string>
  return errs[code] ?? (e instanceof ApiError && e.message !== e.code ? e.message : errs.NETWORK!)
}
