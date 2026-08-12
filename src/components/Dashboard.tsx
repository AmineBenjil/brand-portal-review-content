import { useState } from 'react'
import { dashboardData } from '../data'
import type { SideRowData } from '../data'
import type { Decision } from '../App'
import type { CollabMode } from '../mode'

const navItems = [
  { label: 'Campaigns', icon: 'nav-campaigns', active: true },
  { label: 'Push Alerts', icon: 'nav-push-alerts', soon: true },
  { label: 'Brand Intelligence', icon: 'nav-brand-intel', soon: true },
  { label: 'UGC Studio', icon: 'nav-ugc', soon: true },
]

type Props = {
  mode: CollabMode
  onOpenReview: (creatorId: string) => void
  decisions: Record<string, Decision>
}

export function Dashboard({ mode, onOpenReview, decisions }: Props) {
  const [reviewFilter, setReviewFilter] = useState(false)
  const data = dashboardData[mode]
  const rows = reviewFilter ? data.rows.filter((c) => c.reviewId) : data.rows

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src="/assets/brand/benable-logo.png" alt="Benable" />
        </div>
        <nav className="sidebar-nav">
          <p className="sidebar-nav-heading">Platform</p>
          <div className="sidebar-nav-items">
            {navItems.map((item) => (
              <a key={item.label} className={`sidebar-link${item.active ? ' is-active' : ''}`}>
                <span className="sidebar-link-icon">
                  <img src={`/assets/icons/${item.icon}.svg`} alt="" className={`nav-icon-${item.icon}`} />
                </span>
                <span className="sidebar-link-label">{item.label}</span>
                {item.soon && <span className="sidebar-soon">Soon</span>}
              </a>
            ))}
          </div>
        </nav>
        <div className="sidebar-divider" />
        <div className="sidebar-workspace">
          <span className="workspace-avatar">
            <span className="workspace-avatar-img" />
          </span>
          <span className="workspace-name">{data.workspace}</span>
        </div>
      </aside>

      {/* Page header */}
      <header className="page-header">
        <a className="back-link">
          <span className="chev chev-left">
            <img src="/assets/icons/chevron-shape.svg" alt="" />
          </span>
          Campaigns
        </a>
        <div className="header-title-row">
          <div className="header-title-group">
            <h1 className="header-title">{data.campaignTitle}</h1>
            <span className="status-badge">
              <span className="status-badge-dot" />
              Active
            </span>
          </div>
          <button className="brief-btn">
            <img src="/assets/icons/campaign-brief.svg" alt="" className="brief-btn-icon" />
            Campaign Brief
          </button>
        </div>
        <div className="header-tabs">
          <div className="tab is-active">Dashboard</div>
          <div className="tab">Content</div>
        </div>
      </header>

      {/* Scrollable content: progress + tables slide under the fixed header */}
      <div className="dashboard-scroll">
      {/* Campaign progress */}
      <section className="progress-section">
        <div className="progress-headline">
          <div className="progress-percent-group">
            <span className="progress-percent">78%</span>
            <span className="progress-percent-label">through your campaign</span>
          </div>
          <div className="progress-note">
            <span>🚀</span>
            <span>Campaign on schedule, up to 4 weeks faster than industry average</span>
          </div>
        </div>
        <div className="funnel">
          {data.funnelStages.map((stage, i) => (
            <div key={i} className={`funnel-stage${stage.fixed ? ' funnel-stage-fixed' : ''}`}>
              <button
                className={`funnel-bar${i === 0 ? ' funnel-bar-first' : ''}${
                  i === data.funnelStages.length - 1 ? ' funnel-bar-last' : ''
                }${stage.check ? ' funnel-bar-done' : stage.active ? ' funnel-bar-active' : ' funnel-bar-idle'}${
                  stage.review ? ' funnel-bar-review' : ''
                }`}
                onClick={stage.review ? () => setReviewFilter((f) => !f) : undefined}
                title={stage.review ? (reviewFilter ? 'Show all creators' : 'Show drafts waiting for review') : undefined}
              >
                {stage.check ? (
                  <img src="/assets/icons/check.svg" alt="" className="funnel-check" />
                ) : (
                  <span className={`funnel-count${stage.active ? ' funnel-count-active' : ''}`}>{stage.count}</span>
                )}
                {stage.badge !== undefined && <span className="funnel-badge">{stage.badge}</span>}
              </button>
              <div className="funnel-labels">
                <p className="funnel-label">{stage.label}</p>
                <p className="funnel-sub">{stage.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="dashboard-columns">
      {/* Creators card */}
      <section className="creators-card">
        <div className="creators-card-header">
          <div className="creators-card-heading">
            <p className="creators-card-title">Creators</p>
            <div className="creators-card-subrow">
              <span className="creators-card-dot creators-card-dot-amber" />
              <p className="creators-card-sub creators-card-sub-amber">{data.reviewSubline}</p>
            </div>
          </div>
        </div>
        <div className="creators-rows">
          {rows.map((c, i) => (
            <div
              key={c.name}
              className={`creator-row${i === rows.length - 1 ? ' creator-row-last' : ''}${
                c.reviewId ? ' creator-row-reviewable' : ''
              }`}
              onClick={() => c.reviewId && onOpenReview(c.reviewId)}
            >
              <span className="creator-id">
                {c.avatar ? (
                  <span className="creator-avatar">
                    <img src={c.avatar} alt="" />
                  </span>
                ) : (
                  <span className="creator-avatar creator-avatar-placeholder">?</span>
                )}
                <span className="creator-names">
                  <span className="creator-name-line">
                    <span className="creator-name">{c.name}</span>
                    {c.avatar && <img src="/assets/icons/verified.svg" alt="" className="creator-verified" />}
                  </span>
                  <span className={`creator-handle${c.avatar ? '' : ' creator-handle-wrap'}`}>{c.sub}</span>
                </span>
              </span>
              <span className={`creator-status${c.reviewId ? ' creator-status-waiting' : ''}`}>
                {c.reviewId && decisions[c.reviewId] ? decisionLabel(decisions[c.reviewId]) : c.status}
              </span>
              {c.reviewId ? (
                <button
                  className="review-cta"
                  onClick={(e) => {
                    e.stopPropagation()
                    onOpenReview(c.reviewId!)
                  }}
                >
                  <img src="/assets/icons/campaign-brief.svg" alt="" className="review-cta-icon" />
                  Review content
                </button>
              ) : (
                <span className="creator-order">
                  <span className={`creator-order-dot${c.orderTone === 'gray' ? ' creator-order-dot-gray' : ''}`} />
                  {c.order}
                </span>
              )}
              <span className="chev chev-down creator-chev">
                <img src="/assets/icons/chevron-shape.svg" alt="" />
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Right column cards */}
      <div className="side-cards">
        <section className="side-card side-card-away">
          <div className="side-card-header">
            <p className="side-card-title">While you were away</p>
            <p className="side-card-since">
              <span className="side-card-since-light">Since,</span>
              <span className="side-card-since-strong"> Friday 08</span>
            </p>
          </div>
          <div className="side-card-rows">
            {data.away.map((row, i) => (
              <SideRow key={i} row={row} borderless={i === data.away.length - 1} />
            ))}
          </div>
        </section>

        <section className="side-card side-card-next">
          <div className="side-card-header">
            <p className="side-card-title">Up next</p>
          </div>
          <div className="side-card-rows">
            {data.next.map((row, i) => (
              <SideRow key={i} row={row} borderless={i === data.next.length - 1} />
            ))}
          </div>
        </section>
      </div>
      </div>
      </div>
    </div>
  )
}

function SideRow({ row, borderless }: { row: SideRowData; borderless: boolean }) {
  return (
    <div className={`side-row${borderless ? ' side-row-borderless' : ''}`}>
      <span className="side-row-emoji">{row.emoji}</span>
      <p className={`side-row-text${row.away1 ? ' side-row-text-away1' : ''}`}>
        {row.parts.map((part, i) =>
          part.tone === 'strong' ? (
            <strong key={i}>{part.text}</strong>
          ) : part.tone ? (
            <span key={i} className={part.tone}>
              {part.text}
            </span>
          ) : (
            <span key={i}>{part.text}</span>
          ),
        )}
      </p>
    </div>
  )
}

function decisionLabel(decision: Decision) {
  if (decision === 'approved') return 'Content approved — scheduling the post'
  return 'Changes requested — we passed on your notes'
}
