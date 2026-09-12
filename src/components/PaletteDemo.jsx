import { useState } from 'react';
import { SHADES } from '../data/colorDefs.js';
import { swatchColor } from '../lib/paletteLogic.js';
import { usePaletteStore } from '../store/PaletteContext.jsx';

const THEMES = {
  light: {
    label: 'Prism',
    tokens: { primary: 'indigo', accent: 'fuchsia', success: 'emerald', warning: 'amber', danger: 'rose', neutral: 'mist', gray: 'zinc' },
  },
  dark: {
    label: 'Neon Night',
    invertShades: true,
    tokens: { primary: 'cyan', accent: 'fuchsia', success: 'lime', warning: 'amber', danger: 'rose', neutral: 'slate', gray: 'zinc' },
  },
  aurora: {
    label: 'Aurora',
    tokens: { primary: 'violet', accent: 'emerald', success: 'cyan', warning: 'amber', danger: 'pink', neutral: 'mauve', gray: 'mist' },
  },
  ocean: {
    label: 'Tidal',
    tokens: { primary: 'sky', accent: 'teal', success: 'emerald', warning: 'amber', danger: 'orange', neutral: 'mist', gray: 'slate' },
  },
  sunset: {
    label: 'Sunset',
    tokens: { primary: 'orange', accent: 'pink', success: 'emerald', warning: 'yellow', danger: 'red', neutral: 'stone', gray: 'taupe' },
  },
  forest: {
    label: 'Botanical',
    tokens: { primary: 'emerald', accent: 'lime', success: 'green', warning: 'yellow', danger: 'orange', neutral: 'olive', gray: 'stone' },
  },
  candy: {
    label: 'Candy',
    tokens: { primary: 'pink', accent: 'violet', success: 'cyan', warning: 'yellow', danger: 'fuchsia', neutral: 'mauve', gray: 'zinc' },
  },
  arcade: {
    label: 'Arcade',
    tokens: { primary: 'indigo', accent: 'pink', success: 'lime', warning: 'yellow', danger: 'red', neutral: 'slate', gray: 'zinc' },
  },
  paper: {
    label: 'Paper',
    tokens: { primary: 'stone', accent: 'taupe', success: 'olive', warning: 'amber', danger: 'rose', neutral: 'stone', gray: 'neutral' },
  },
  studio: {
    label: 'Studio',
    tokens: { primary: 'slate', accent: 'mauve', success: 'olive', warning: 'taupe', danger: 'mauve', neutral: 'gray', gray: 'mist' },
  },
  ember: {
    label: 'Ember Dark',
    invertShades: true,
    tokens: { primary: 'orange', accent: 'rose', success: 'lime', warning: 'amber', danger: 'red', neutral: 'taupe', gray: 'stone' },
  },
  abyss: {
    label: 'Deep Sea',
    invertShades: true,
    tokens: { primary: 'sky', accent: 'violet', success: 'teal', warning: 'amber', danger: 'pink', neutral: 'mist', gray: 'slate' },
  },
};

const INVERSE_SHADE = { 50: 950, 100: 900, 200: 800, 300: 700, 400: 600, 500: 500, 600: 400, 700: 300, 800: 200, 900: 100, 950: 50 };
const RAINBOW_CARDS = [
  ['red', 'Incidents', '3 unresolved', '↗'],
  ['orange', 'Experiments', '12 running', '⚗'],
  ['amber', 'Reviews', '8 awaiting', '◆'],
  ['green', 'Deployments', 'All healthy', '✓'],
  ['cyan', 'Automations', '248 completed', '⚡'],
  ['blue', 'Analytics', '18.4k events', '⌁'],
  ['violet', 'Integrations', '24 connected', '◇'],
  ['pink', 'Campaigns', '6 scheduled', '✦'],
];
const CALENDAR_DAYS = Array.from({ length: 35 }, (_, index) => (index < 1 || index > 30 ? null : index));
const TAGS = [
  ['Design', 'violet', 3], ['Research', 'cyan', 2], ['Product', 'blue', 4], ['Marketing', 'pink', 2],
  ['Engineering', 'emerald', 5], ['Analytics', 'indigo', 3], ['Growth', 'lime', 2], ['Support', 'orange', 1],
  ['Strategy', 'fuchsia', 3], ['Finance', 'amber', 2], ['Security', 'red', 1], ['Community', 'teal', 2],
];

function DemoIcon({ children }) {
  return <span className="demo-icon" aria-hidden="true">{children}</span>;
}

export default function PaletteDemo() {
  const { store } = usePaletteStore();
  const [dialogOpen, setDialogOpen] = useState(true);
  const [theme, setTheme] = useState('light');
  const activeTheme = THEMES[theme];

  function color(name, shade) {
    const band = store.bands.find((item) => item.name === name);
    const index = SHADES.indexOf(shade);
    if (!band || index < 0) return 'transparent';
    const { rgb } = swatchColor(store, band, index);
    return `rgb(${rgb.join(' ')})`;
  }

  const themeColor = (name, shade) => color(name, activeTheme.invertShades ? INVERSE_SHADE[shade] : shade);

  const variables = Object.fromEntries(
    Object.entries(activeTheme.tokens).flatMap(([role, name]) =>
      SHADES.map((shade) => [`--demo-${role}-${shade}`, color(name, activeTheme.invertShades ? INVERSE_SHADE[shade] : shade)]),
    ),
  );

  return (
    <section className="demo-section" style={variables} aria-labelledby="demo-title">
      <div className="demo-heading">
        <div>
          <span className="demo-eyebrow">Live palette preview</span>
          <h2 id="demo-title">Interface components</h2>
          <p>Common product UI composed from the rainbow and neutral ramps above.</p>
        </div>
        <div className="demo-heading-tools">
          <div className="demo-theme-switcher" aria-label="Demo theme">
            {Object.entries(THEMES).map(([id, option]) => (
              <button
                className={theme === id ? 'active' : ''}
                aria-pressed={theme === id}
                key={id}
                onClick={() => setTheme(id)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="demo-token-key" aria-label="Semantic color mapping">
            {Object.entries(activeTheme.tokens).map(([role, name]) => (
              <span key={role}><i style={{ background: color(name, 500) }} />{role}: {name}</span>
            ))}
          </div>
        </div>
      </div>

      <div className={`demo-app theme-${theme}`}>
        <header className="demo-topbar">
          <a className="demo-brand" href="#demo-title" aria-label="Prism home">
            <span className="demo-brand-mark">P</span>Prism
          </a>
          <nav aria-label="Demo navigation">
            <a className="active" href="#demo-title">Overview</a>
            <a href="#demo-components">Customers</a>
            <a href="#demo-components">Reports</a>
          </nav>
          <div className="demo-top-actions">
            <button className="demo-icon-button" aria-label="Notifications">●</button>
            <span className="demo-avatar">AM</span>
          </div>
        </header>

        <main className="demo-content" id="demo-components">
          <div className="demo-page-title">
            <div><span>Workspace / Overview</span><h3>Good morning, Alex</h3></div>
            <div className="demo-actions">
              <button className="demo-button secondary">Export</button>
              <button className="demo-button primary"><DemoIcon>＋</DemoIcon>New project</button>
            </div>
          </div>

          <div className="demo-stats">
            <article><span>Monthly revenue</span><strong>$48,290</strong><small className="positive">↑ 12.5% this month</small></article>
            <article><span>Active customers</span><strong>2,420</strong><small className="positive">↑ 8.2% this month</small></article>
            <article><span>Open issues</span><strong>17</strong><small className="warning">5 need attention</small></article>
            <article><span>Conversion</span><strong>6.8%</strong><small>Across 12,840 visits</small></article>
          </div>

          <div className="demo-widget-grid">
            <article className="demo-card demo-activity">
              <div className="demo-card-heading"><div><h4>Recent activity</h4><p>Updates across your workspace</p></div><button className="demo-more">•••</button></div>
              <ul>
                <li><span className="demo-event success">✓</span><div><b>Payment received</b><p>Acme Inc. paid invoice #1048</p></div><time>2m</time></li>
                <li><span className="demo-event primary">↗</span><div><b>Report published</b><p>Q3 performance is ready to share</p></div><time>1h</time></li>
                <li><span className="demo-event accent">★</span><div><b>New team member</b><p>Maya joined Product Design</p></div><time>3h</time></li>
              </ul>
              <button className="demo-text-button">View all activity →</button>
            </article>

            <article className="demo-card demo-form-card">
              <div className="demo-card-heading"><div><h4>Create customer</h4><p>Add a contact to your workspace</p></div></div>
              <label>Name<input defaultValue="Ada Lovelace" /></label>
              <label>Email<input type="email" defaultValue="ada@example.com" /></label>
              <label>Role<select defaultValue="admin"><option value="admin">Administrator</option><option>Member</option></select></label>
              <label className="demo-check"><input type="checkbox" defaultChecked /><span>Send a welcome email</span></label>
              <div className="demo-form-actions"><button className="demo-button ghost">Cancel</button><button className="demo-button primary">Create customer</button></div>
            </article>
          </div>

          <div className="demo-alerts">
            <div className="demo-alert success"><b>Payment successful</b><span>Your subscription has been renewed.</span><button aria-label="Dismiss">×</button></div>
            <div className="demo-alert warning"><b>Usage approaching limit</b><span>You have used 82% of this month’s allowance.</span><button aria-label="Dismiss">×</button></div>
            <div className="demo-alert danger"><b>Connection failed</b><span>Check your API credentials and try again.</span><button aria-label="Dismiss">×</button></div>
          </div>

          <section className="demo-rainbow-section" aria-labelledby="rainbow-cards-title">
            <div className="demo-card-heading">
              <div><h4 id="rainbow-cards-title">Rainbow overview</h4><p>Feature cards using individual color rows</p></div>
              <button className="demo-text-button">Customize cards →</button>
            </div>
            <div className="demo-rainbow-grid">
              {RAINBOW_CARDS.map(([name, title, detail, icon]) => (
                <article
                  className="demo-rainbow-card"
                  key={name}
                  style={{
                    '--rainbow-soft': themeColor(name, 50),
                    '--rainbow-border': themeColor(name, 200),
                    '--rainbow-icon': themeColor(name, 600),
                    '--rainbow-text': themeColor(name, 800),
                  }}
                >
                  <span>{icon}</span>
                  <div><b>{title}</b><small>{detail}</small></div>
                  <button aria-label={`Open ${title}`}>→</button>
                </article>
              ))}
            </div>
          </section>

          <div className="demo-data-widgets">
            <article className="demo-card demo-calendar">
              <div className="demo-card-heading">
                <div><h4>September 2026</h4><p>Team calendar</p></div>
                <div className="demo-calendar-nav"><button aria-label="Previous month">‹</button><button aria-label="Next month">›</button></div>
              </div>
              <div className="demo-calendar-weekdays">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => <span key={`${day}-${i}`}>{day}</span>)}</div>
              <div className="demo-calendar-days">
                {CALENDAR_DAYS.map((day, i) => (
                  <button className={day === 12 ? 'selected' : day === 18 ? 'range' : ''} disabled={!day} key={i}>
                    {day}
                    {[7, 12, 18, 24].includes(day) && <i className={`event-${day % 3}`} />}
                  </button>
                ))}
              </div>
            </article>

            <article className="demo-card demo-metrics">
              <div className="demo-card-heading"><div><h4>Weekly traffic</h4><p>Visits by day</p></div><span className="demo-badge success">+18.2%</span></div>
              <div className="demo-bar-chart" aria-label="Weekly traffic bar chart">
                {[42, 66, 51, 82, 63, 94, 72].map((height, i) => (
                  <div key={i}><span style={{ height: `${height}%` }} /><small>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</small></div>
                ))}
              </div>
              <div className="demo-progress-list">
                <label><span>Direct <b>72%</b></span><progress max="100" value="72" /></label>
                <label><span>Organic <b>54%</b></span><progress max="100" value="54" /></label>
                <label><span>Referral <b>31%</b></span><progress max="100" value="31" /></label>
              </div>
            </article>

            <article className="demo-card demo-controls-card">
              <div className="demo-card-heading"><div><h4>Playback controls</h4><p>Sliders and value states</p></div><span className="demo-control-value">68%</span></div>
              <label><span>Volume</span><input type="range" min="0" max="100" defaultValue="68" /></label>
              <label><span>Brightness</span><input className="accent-slider" type="range" min="0" max="100" defaultValue="42" /></label>
              <label><span>Balance</span><input className="success-slider" type="range" min="0" max="100" defaultValue="76" /></label>
              <div className="demo-toggle-row"><span>Auto-enhance</span><button className="demo-switch active" aria-label="Toggle auto-enhance"><i /></button></div>
              <div className="demo-toggle-row"><span>Normalize audio</span><button className="demo-switch" aria-label="Toggle normalize audio"><i /></button></div>
            </article>

            <article className="demo-card demo-tags-card">
              <div className="demo-card-heading"><div><h4>Popular tags</h4><p>Topics across the workspace</p></div><button className="demo-more">•••</button></div>
              <div className="demo-tag-cloud">
                {TAGS.map(([label, name, weight]) => (
                  <button
                    key={label}
                    style={{
                      '--tag-bg': themeColor(name, 100),
                      '--tag-border': themeColor(name, 200),
                      '--tag-text': themeColor(name, 700),
                      '--tag-size': `${8 + weight}px`,
                    }}
                  >
                    {label}<small>{weight * 4}</small>
                  </button>
                ))}
              </div>
            </article>
          </div>

          <section
            className="demo-dark-controls"
            aria-labelledby="dark-controls-title"
            style={{
              '--dark-950': color(activeTheme.tokens.neutral, 950),
              '--dark-900': color(activeTheme.tokens.gray, 900),
              '--dark-800': color(activeTheme.tokens.neutral, 800),
              '--dark-700': color(activeTheme.tokens.gray, 700),
              '--dark-primary-950': color(activeTheme.tokens.primary, 950),
              '--dark-primary-900': color(activeTheme.tokens.primary, 900),
              '--dark-primary-800': color(activeTheme.tokens.primary, 800),
              '--dark-primary-700': color(activeTheme.tokens.primary, 700),
              '--dark-accent-800': color(activeTheme.tokens.accent, 800),
              '--dark-success-700': color(activeTheme.tokens.success, 700),
              '--dark-text': color(activeTheme.tokens.neutral, 100),
              '--dark-muted': color(activeTheme.tokens.neutral, 400),
            }}
          >
            <div className="demo-dark-heading">
              <div><span>Dark control surface</span><h4 id="dark-controls-title">Command center</h4></div>
              <span className="demo-dark-range">Shades 700–950</span>
            </div>
            <div className="demo-command-bar">
              <span>⌕</span><input aria-label="Search commands" placeholder="Search commands, projects, or people…" />
              <kbd>⌘ K</kbd>
              <button aria-label="Command filters">⌘</button>
            </div>
            <div className="demo-dark-grid">
              <div className="demo-dark-group">
                <span className="demo-dark-label">Actions</span>
                <div className="demo-dark-actions">
                  <button className="solid">Run workflow</button><button>Save draft</button><button className="icon" aria-label="More actions">•••</button>
                </div>
                <span className="demo-dark-label">View</span>
                <div className="demo-dark-segmented"><button className="active">Board</button><button>List</button><button>Timeline</button></div>
              </div>
              <div className="demo-dark-group">
                <label className="demo-dark-select">Environment<select defaultValue="production"><option value="production">Production</option><option>Staging</option><option>Development</option></select></label>
                <label className="demo-dark-field">Branch<input defaultValue="main" /></label>
              </div>
              <div className="demo-dark-group">
                <div className="demo-dark-toggle"><span><b>Auto deploy</b><small>Deploy after checks pass</small></span><button className="active" aria-label="Toggle auto deploy"><i /></button></div>
                <div className="demo-dark-toggle"><span><b>Preview builds</b><small>Build every pull request</small></span><button aria-label="Toggle preview builds"><i /></button></div>
              </div>
              <div className="demo-dark-group demo-dark-usage">
                <div><span>Build minutes</span><b>7,420 / 10,000</b></div>
                <progress max="100" value="74" />
                <input aria-label="Build minute alert threshold" type="range" min="0" max="100" defaultValue="82" />
                <small>Alert threshold: 82%</small>
              </div>
            </div>
          </section>

          <section
            className="demo-dark-controls demo-light-controls"
            aria-labelledby="light-controls-title"
            style={{
              '--dark-950': color(activeTheme.tokens.neutral, 50),
              '--dark-900': color(activeTheme.tokens.gray, 100),
              '--dark-800': color(activeTheme.tokens.neutral, 200),
              '--dark-700': color(activeTheme.tokens.gray, 300),
              '--dark-primary-950': color(activeTheme.tokens.primary, 50),
              '--dark-primary-900': color(activeTheme.tokens.primary, 100),
              '--dark-primary-800': color(activeTheme.tokens.primary, 200),
              '--dark-primary-700': color(activeTheme.tokens.primary, 600),
              '--dark-accent-800': color(activeTheme.tokens.accent, 600),
              '--dark-success-700': color(activeTheme.tokens.success, 600),
              '--dark-text': color(activeTheme.tokens.neutral, 900),
              '--dark-muted': color(activeTheme.tokens.neutral, 500),
            }}
          >
            <div className="demo-dark-heading">
              <div><span>Light control surface</span><h4 id="light-controls-title">Publishing center</h4></div>
              <span className="demo-dark-range">Light UI controls</span>
            </div>
            <div className="demo-command-bar">
              <span>⌕</span><input aria-label="Search content" placeholder="Search pages, assets, or collections…" />
              <kbd>⌘ P</kbd>
              <button aria-label="Search filters">☷</button>
            </div>
            <div className="demo-dark-grid">
              <div className="demo-dark-group">
                <span className="demo-dark-label">Publish</span>
                <div className="demo-dark-actions">
                  <button className="solid">Publish changes</button><button>Preview</button><button className="icon" aria-label="More publishing actions">•••</button>
                </div>
                <span className="demo-dark-label">Content view</span>
                <div className="demo-dark-segmented"><button className="active">Pages</button><button>Assets</button><button>Forms</button></div>
              </div>
              <div className="demo-dark-group">
                <label className="demo-dark-select">Collection<select defaultValue="website"><option value="website">Marketing site</option><option>Documentation</option><option>Help center</option></select></label>
                <label className="demo-dark-field">Slug<input defaultValue="/new-release" /></label>
              </div>
              <div className="demo-dark-group">
                <div className="demo-dark-toggle"><span><b>Search indexing</b><small>Allow this page in results</small></span><button className="active" aria-label="Toggle search indexing"><i /></button></div>
                <div className="demo-dark-toggle"><span><b>Password access</b><small>Restrict this collection</small></span><button aria-label="Toggle password access"><i /></button></div>
              </div>
              <div className="demo-dark-group demo-dark-usage">
                <div><span>Storage used</span><b>4.8 / 10 GB</b></div>
                <progress max="100" value="48" />
                <input aria-label="Image quality" type="range" min="0" max="100" defaultValue="72" />
                <small>Image quality: 72%</small>
              </div>
            </div>
          </section>

          <article className="demo-card demo-table-card">
            <div className="demo-card-heading"><div><h4>Team members</h4><p>Manage access and permissions</p></div><div className="demo-segmented"><button className="active">All</button><button>Active</button><button>Invited</button></div></div>
            <div className="demo-table-wrap">
              <table>
                <thead><tr><th>Member</th><th>Role</th><th>Status</th><th>Last active</th><th /></tr></thead>
                <tbody>
                  <tr><td><span className="demo-person violet">AL</span><b>Ada Lovelace<small>ada@example.com</small></b></td><td>Administrator</td><td><span className="demo-badge success">Active</span></td><td>Just now</td><td>•••</td></tr>
                  <tr><td><span className="demo-person blue">GH</span><b>Grace Hopper<small>grace@example.com</small></b></td><td>Developer</td><td><span className="demo-badge success">Active</span></td><td>12 min ago</td><td>•••</td></tr>
                  <tr><td><span className="demo-person amber">AT</span><b>Alan Turing<small>alan@example.com</small></b></td><td>Analyst</td><td><span className="demo-badge neutral">Invited</span></td><td>—</td><td>•••</td></tr>
                </tbody>
              </table>
            </div>
          </article>

          <div className="demo-dialog-stage">
            <div className="demo-dialog-context">
              <div><span>Dialog preview</span><strong>Test overlay and action contrast</strong></div>
              {!dialogOpen && <button className="demo-button primary" onClick={() => setDialogOpen(true)}>Open dialog</button>}
            </div>
            {dialogOpen && (
              <div className="demo-dialog-backdrop">
                <div className="demo-dialog" role="dialog" aria-modal="true" aria-labelledby="demo-dialog-title">
                  <button className="demo-dialog-close" aria-label="Close dialog" onClick={() => setDialogOpen(false)}>×</button>
                  <span className="demo-dialog-icon">!</span>
                  <h4 id="demo-dialog-title">Delete this project?</h4>
                  <p>This permanently removes the project and its data. This action cannot be undone.</p>
                  <div><button className="demo-button secondary" onClick={() => setDialogOpen(false)}>Cancel</button><button className="demo-button danger">Delete project</button></div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </section>
  );
}
