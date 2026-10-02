// Đóng gói bản offline: dist-offline/HCM202-San-pham-sang-tao.zip
// gồm index.html và HUONG-DAN-CHAY.txt. Không cần công cụ zip bên ngoài.
import { readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import zlib from 'node:zlib'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'dist-offline')
const zipPath = join(outDir, 'HCM202-San-pham-sang-tao.zip')

const guide = readFileSync(join(root, 'scripts/HUONG-DAN-CHAY.txt'), 'utf8')
  .trimEnd()
  .replace(/\r?\n/g, '\r\n') // xuống dòng kiểu Windows cho Notepad
const guideBytes = Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(guide + '\r\n', 'utf8')])
writeFileSync(join(outDir, 'HUONG-DAN-CHAY.txt'), guideBytes)

const files = [
  { name: 'index.html', data: readFileSync(join(outDir, 'index.html')) },
  { name: 'HUONG-DAN-CHAY.txt', data: guideBytes },
]

// CRC-32 (dùng zlib.crc32 nếu Node có sẵn)
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
const crc32 = (buf) => {
  if (typeof zlib.crc32 === 'function') return zlib.crc32(buf) >>> 0
  let c = 0xffffffff
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

const now = new Date()
const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2)
const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()

const locals = []
const centrals = []
let offset = 0
for (const f of files) {
  const name = Buffer.from(f.name, 'utf8')
  const comp = zlib.deflateRawSync(f.data, { level: 9 })
  const crc = crc32(f.data)

  const local = Buffer.alloc(30)
  local.writeUInt32LE(0x04034b50, 0)
  local.writeUInt16LE(20, 4) // version needed
  local.writeUInt16LE(0x0800, 6) // tên file UTF-8
  local.writeUInt16LE(8, 8) // deflate
  local.writeUInt16LE(dosTime, 10)
  local.writeUInt16LE(dosDate, 12)
  local.writeUInt32LE(crc, 14)
  local.writeUInt32LE(comp.length, 18)
  local.writeUInt32LE(f.data.length, 22)
  local.writeUInt16LE(name.length, 26)
  local.writeUInt16LE(0, 28)
  locals.push(local, name, comp)

  const central = Buffer.alloc(46)
  central.writeUInt32LE(0x02014b50, 0)
  central.writeUInt16LE(20, 4) // version made by
  central.writeUInt16LE(20, 6)
  central.writeUInt16LE(0x0800, 8)
  central.writeUInt16LE(8, 10)
  central.writeUInt16LE(dosTime, 12)
  central.writeUInt16LE(dosDate, 14)
  central.writeUInt32LE(crc, 16)
  central.writeUInt32LE(comp.length, 20)
  central.writeUInt32LE(f.data.length, 24)
  central.writeUInt16LE(name.length, 28)
  central.writeUInt32LE(offset, 42)
  centrals.push(central, name)

  offset += local.length + name.length + comp.length
}

const centralBuf = Buffer.concat(centrals)
const end = Buffer.alloc(22)
end.writeUInt32LE(0x06054b50, 0)
end.writeUInt16LE(files.length, 8)
end.writeUInt16LE(files.length, 10)
end.writeUInt32LE(centralBuf.length, 12)
end.writeUInt32LE(offset, 16)

writeFileSync(zipPath, Buffer.concat([...locals, centralBuf, end]))

const mb = (n) => (n / 1024 / 1024).toFixed(2) + ' MB'
console.log(`index.html: ${mb(files[0].data.length)}`)
console.log(`${zipPath.slice(root.length + 1)}: ${mb(statSync(zipPath).size)}`)
