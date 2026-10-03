import { Component, type ReactNode } from 'react'
import { site } from '../lib/gameData'

/** Lỗi hiển thị (vd. ván lưu hỏng) → báo lỗi tiếng Việt và cho về trang chủ, không để trang trắng */
export class ErrorBoundary extends Component<{ children: ReactNode; onReset: () => void }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children
    const t = site.common
    return (
      <main className="mx-auto flex max-w-md flex-col gap-4 px-4 py-12 text-center" role="alert">
        <h1 className="font-serif text-2xl font-bold">{t.errorTitle}</h1>
        <p>{t.errorBody}</p>
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            this.props.onReset()
            this.setState({ failed: false })
          }}
        >
          {t.errorHome}
        </button>
      </main>
    )
  }
}
