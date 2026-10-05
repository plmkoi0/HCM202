// Đường dẫn và nội dung dùng chung cho các lệnh phát hành (mục 15.6, 17):
// npm run package:offline · npm run qr · npm run check:release
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
export const site = JSON.parse(readFileSync(join(root, 'src/data/site.json'), 'utf8'))

/** Gói offline (đổi tên theo tên game khi nhóm chốt tên chính thức) */
export const ZIP_NAME = 'HCM202-Con-duong-tu-tuong.zip'
export const ZIP_FILE = join(root, 'phat-hanh', ZIP_NAME)
export const QR_FILE = join(root, 'docs', 'phat-hanh', 'qr-game.png')

/** Ảnh QR: đủ to để chiếu lên slide, mức sửa lỗi M, lề 4 ô theo chuẩn */
export const QR_OPTIONS = { type: 'png', width: 1024, margin: 4, errorCorrectionLevel: 'M', color: { dark: '#000000', light: '#ffffff' } }

/**
 * PNG mã QR của một địa chỉ (gói qrcode, sinh trên máy — không gọi mạng)
 * @param {string} url
 * @returns {Promise<Buffer>}
 */
export async function qrPng(url) {
  const QRCode = (await import('qrcode')).default
  return QRCode.toBuffer(url, QR_OPTIONS)
}

/** HUONG-DAN.txt trong gói offline (CRLF + BOM để Notepad trên Windows hiện đúng tiếng Việt) */
export function guideText() {
  const lines = [
    `${site.title} — bản offline`,
    `${site.course} · "${site.message}"`,
    '',
    'CÁCH MỞ',
    '1. Giải nén gói zip (chuột phải → Extract All / Giải nén).',
    '2. Mở file index.html bằng trình duyệt (Chrome, Edge, Firefox, Safari): bấm đúp, hoặc kéo file vào cửa sổ trình duyệt.',
    '3. Không cần mạng, không cần cài đặt.',
    '',
    'BẢN NÀY CÓ GÌ',
    '- Chỉ có "Chơi trên một máy": 1–5 người thay phiên trên cùng thiết bị, có thể thêm máy chơi cùng.',
    '  1 người và 0 máy = thử thách cá nhân.',
    '- Có Luật chơi, Cài đặt. Ván đang chơi được lưu trong trình duyệt của máy này.',
    '- Không có "Chơi qua phòng" (tạo / vào phòng bằng mã, QR) — phần đó cần mạng.',
    '',
    'CHƠI QUA PHÒNG (CÓ MẠNG)',
    `- Mở ${site.siteUrl}`,
    '',
    'LƯU Ý',
    '- Nếu trình duyệt chặn file mở từ máy, thử trình duyệt khác hoặc mở bằng Chrome / Edge.',
    '- Mỗi máy lưu ván và cài đặt riêng; xóa dữ liệu trình duyệt thì mất ván đang lưu.',
  ]
  return '﻿' + lines.join('\r\n') + '\r\n'
}
