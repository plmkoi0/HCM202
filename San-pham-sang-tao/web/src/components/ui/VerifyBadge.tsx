import { site } from '../../lib/site'

export default function VerifyBadge() {
  return (
    <span
      className="inline-block rounded-sm border border-son-text px-1.5 py-0.5 font-mono text-[0.7rem] leading-none text-son-text"
      title={site.museum.verifyTitle}
    >
      {site.museum.verifyBadge}
    </span>
  )
}
