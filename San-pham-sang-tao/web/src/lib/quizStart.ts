import { useEffect } from 'react'

const EVENT = 'hcm202:start-quiz'

/** Nút ngoài mục Quiz (hero, cầu nối) gọi để vào thẳng câu 1, không dừng ở màn hình mở đầu. */
export function requestQuizStart() {
  window.dispatchEvent(new Event(EVENT))
}

/** Quiz đăng ký xử lý yêu cầu bắt đầu từ các nút bên ngoài. */
export function useQuizStartRequest(handler: () => void) {
  useEffect(() => {
    window.addEventListener(EVENT, handler)
    return () => window.removeEventListener(EVENT, handler)
  }, [handler])
}
