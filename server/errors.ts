// Lỗi phòng chơi: mã → mã HTTP; lời báo tiếng Việt lấy từ site.json → errors (mục 9).

import type { ErrorCode } from '../src/engine/index.js'
import { siteErrors } from './data.js'

export type RoomErrorCode =
  | 'ROOM_NOT_FOUND'
  | 'ROOM_FULL'
  | 'ROOM_STARTED'
  | 'ROOM_EXPIRED'
  | 'ROOM_CLOSED'
  | 'COLOR_TAKEN'
  | 'BAD_NAME'
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'KICKED'
  | 'NOT_HOST'
  | 'NOT_IN_LOBBY'
  | 'NOT_STARTED'
  | 'CAPACITY_TOO_SMALL'
  | 'RATE_LIMITED'
  | 'BUSY'
  | 'SERVER_NOT_READY'

export type ApiErrorCode = RoomErrorCode | ErrorCode

const STATUS: Record<RoomErrorCode, number> = {
  ROOM_NOT_FOUND: 404,
  ROOM_FULL: 409,
  ROOM_STARTED: 409,
  ROOM_EXPIRED: 410,
  ROOM_CLOSED: 410,
  COLOR_TAKEN: 409,
  BAD_NAME: 400,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  KICKED: 403,
  NOT_HOST: 403,
  NOT_IN_LOBBY: 409,
  NOT_STARTED: 409,
  CAPACITY_TOO_SMALL: 409,
  RATE_LIMITED: 429,
  BUSY: 503,
  SERVER_NOT_READY: 503,
}

export class RoomError extends Error {
  readonly code: ApiErrorCode
  readonly status: number
  constructor(code: ApiErrorCode) {
    super(errorMessage(code))
    this.code = code
    // lỗi luật chơi của engine (sai lượt, sai pha…) → 409
    this.status = (STATUS as Record<string, number>)[code] ?? 409
  }
}

export function errorMessage(code: string): string {
  return (siteErrors as Record<string, string>)[code] ?? code
}
