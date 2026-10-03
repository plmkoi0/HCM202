// localStorage bọc try/catch (mục 15.4): chế độ riêng tư, trình duyệt nhúng hoặc bộ nhớ đầy
// thì đọc/ghi thất bại im lặng — game vẫn chạy, chỉ không nhớ được.

const PREFIX = 'cdtt.'

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = globalThis.localStorage?.getItem(PREFIX + key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function save(key: string, value: unknown): boolean {
  try {
    globalThis.localStorage?.setItem(PREFIX + key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function remove(key: string): void {
  try {
    globalThis.localStorage?.removeItem(PREFIX + key)
  } catch {
    // bỏ qua
  }
}
