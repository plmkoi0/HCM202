// Phát hành (mục 15.6, 17): gói zip, kiểm bản offline, hướng dẫn trong gói, ảnh QR.
import { existsSync, readFileSync } from 'node:fs'
import { inflateRawSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { networkCodeIn } from '../scripts/check-offline.mjs'
import { guideText, qrPng, QR_FILE, site, ZIP_FILE } from '../scripts/lib/release.mjs'
import { makeZip, readZip } from '../scripts/lib/zip.mjs'

describe('phát hành', () => {
  it('zip: đọc lại đúng nội dung, tên UTF-8, cùng nội dung → cùng file (thời gian cố định)', () => {
    const files = [
      { name: 'index.html', data: Buffer.from('<!doctype html><title>Thử</title>'.repeat(50)) },
      { name: 'HƯỚNG-DẪN.txt', data: Buffer.from('Đúng / Sai', 'utf8') },
    ]
    const a = makeZip(files)
    expect(makeZip(files).equals(a)).toBe(true)
    const back = readZip(a)
    expect(back.map((e) => e.name)).toEqual(['index.html', 'HƯỚNG-DẪN.txt'])
    back.forEach((e, i) => expect(inflateRawSync(e.packed).equals(files[i].data)).toBe(true))
  })

  it('kiểm bản offline bắt được mã mạng', () => {
    expect(networkCodeIn('<script>let a = 1</script>')).toEqual([])
    expect(networkCodeIn('fetch("/api/rooms")')).toEqual(['đường dẫn API', 'fetch'])
    expect(networkCodeIn('new WebSocket(u)')).toEqual(['WebSocket'])
  })

  it('HUONG-DAN.txt: tiếng Việt có BOM, xuống dòng CRLF, có địa chỉ chơi online, nói rõ chỉ có Chơi trên một máy', () => {
    const t = guideText()
    expect(t.startsWith('﻿')).toBe(true)
    expect(t).toContain('\r\n')
    expect(t).not.toMatch(/[^\r]\n/)
    expect(t).toContain(site.siteUrl)
    expect(t).toContain('Chơi trên một máy')
  })

  it('ảnh QR và gói zip đã có trong repo; QR khớp siteUrl', async () => {
    expect(existsSync(ZIP_FILE)).toBe(true)
    expect(readFileSync(QR_FILE).equals(await qrPng(site.siteUrl))).toBe(true)
  })
})
