#!/usr/bin/env node
// Ảnh QR của siteUrl để đặt lên slide (mục 19): docs/phat-hanh/qr-game.png.
// Dùng gói qrcode có sẵn, sinh trên máy — không gọi mạng. Chạy lại khi đổi siteUrl.
//
// Dùng: npm run qr
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, relative } from 'node:path'
import { qrPng, QR_FILE, root, site } from './lib/release.mjs'

if (!/^https:\/\/\S+$/.test(site.siteUrl ?? '')) {
  console.error('site.json → siteUrl trống hoặc không phải https://… — chưa tạo QR.')
  process.exit(1)
}
mkdirSync(dirname(QR_FILE), { recursive: true })
writeFileSync(QR_FILE, await qrPng(site.siteUrl))
console.log(`Đã tạo ${relative(root, QR_FILE)} cho ${site.siteUrl}`)
