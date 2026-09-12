import { useState } from 'react';
import { SHADES } from '../data/colorDefs.js';
import { swatchColor } from '../lib/paletteLogic.js';
import { usePaletteStore } from '../store/PaletteContext.jsx';

const POSTS = [
  { category: 'Design', title: 'A slower, more considered approach to digital products', date: 'September 10, 2026', color: 'violet' },
  { category: 'Culture', title: 'The independent studios reshaping our cities', date: 'September 6, 2026', color: 'orange' },
  { category: 'Field Notes', title: 'Finding clarity in the wild Atlantic landscape', date: 'August 28, 2026', color: 'cyan' },
];

const WP_THEMES = {
  light: { label: 'Editorial Light' },
  dark: { label: 'Midnight Reader', dark: true },
  colorful: { label: 'Color Journal' },
  botanical: { label: 'Botanical Review' },
  newsprint: { label: 'Newsprint' },
  nocturne: { label: 'Nocturne', dark: true },
};

export default function WordPressDemo() {
  const { store } = usePaletteStore();
  const [theme, setTheme] = useState('light');

  function color(name, shade) {
    const band = store.bands.find((item) => item.name === name);
    const index = SHADES.indexOf(shade);
    if (!band || index < 0) return 'transparent';
    return `rgb(${swatchColor(store, band, index).rgb.join(' ')})`;
  }

  const themeTokens = {
    light: {
      ink: ['stone', 950], body: ['stone', 700], muted: ['stone', 500], line: ['stone', 200], paper: ['stone', 50], surface: ['neutral', 50],
      primary: ['indigo', 700], primarySoft: ['indigo', 100], accent: ['amber', 500], accentSoft: ['amber', 100], success: ['emerald', 700],
      footer: ['stone', 950], footerText: ['stone', 50],
    },
    dark: {
      ink: ['slate', 50], body: ['slate', 300], muted: ['slate', 400], line: ['slate', 700], paper: ['slate', 900], surface: ['slate', 950],
      primary: ['cyan', 400], primarySoft: ['cyan', 950], accent: ['fuchsia', 400], accentSoft: ['fuchsia', 950], success: ['emerald', 400],
      footer: ['slate', 950], footerText: ['slate', 100],
    },
    colorful: {
      ink: ['purple', 950], body: ['indigo', 800], muted: ['violet', 500], line: ['fuchsia', 200], paper: ['amber', 50], surface: ['rose', 50],
      primary: ['fuchsia', 700], primarySoft: ['fuchsia', 100], accent: ['orange', 500], accentSoft: ['amber', 100], success: ['teal', 700],
      footer: ['purple', 950], footerText: ['amber', 50],
    },
    botanical: {
      ink: ['olive', 950], body: ['olive', 700], muted: ['stone', 500], line: ['green', 200], paper: ['lime', 50], surface: ['olive', 50],
      primary: ['green', 700], primarySoft: ['green', 100], accent: ['yellow', 500], accentSoft: ['yellow', 100], success: ['emerald', 700],
      footer: ['olive', 950], footerText: ['lime', 50],
    },
    newsprint: {
      ink: ['neutral', 950], body: ['gray', 700], muted: ['gray', 500], line: ['neutral', 300], paper: ['neutral', 50], surface: ['gray', 50],
      primary: ['red', 700], primarySoft: ['red', 100], accent: ['blue', 600], accentSoft: ['blue', 100], success: ['emerald', 700],
      footer: ['neutral', 950], footerText: ['neutral', 50],
    },
    nocturne: {
      ink: ['zinc', 50], body: ['mauve', 300], muted: ['mauve', 400], line: ['purple', 800], paper: ['purple', 950], surface: ['zinc', 950],
      primary: ['violet', 400], primarySoft: ['violet', 950], accent: ['pink', 400], accentSoft: ['pink', 950], success: ['cyan', 400],
      footer: ['zinc', 950], footerText: ['zinc', 100],
    },
  }[theme];
  const variables = Object.fromEntries(
    Object.entries(themeTokens).map(([token, [name, shade]]) => [`--wp-${token.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`, color(name, shade)]),
  );

  return (
    <section className="wp-demo-section" style={variables} aria-labelledby="wp-demo-title">
      <div className="demo-heading wp-demo-heading">
        <div>
          <span className="demo-eyebrow">Live editorial preview</span>
          <h2 id="wp-demo-title">WordPress content theme</h2>
          <p>A traditional publication layout with posts and sidebar widgets.</p>
        </div>
        <div className="wp-heading-tools">
          <div className="wp-theme-switcher" aria-label="WordPress preview theme">
            {Object.entries(WP_THEMES).map(([id, option]) => (
              <button className={theme === id ? 'active' : ''} aria-pressed={theme === id} onClick={() => setTheme(id)} key={id}>{option.label}</button>
            ))}
          </div>
          <div className="wp-palette-key">
            {Object.entries(themeTokens).slice(0, 4).map(([role, [name, shade]]) => (
              <span key={role}><i style={{ background: color(name, shade) }} />{role}: {name}</span>
            ))}
          </div>
        </div>
      </div>

      <div className={`wp-site wp-theme-${theme}${WP_THEMES[theme].dark ? ' wp-theme-is-dark' : ''}`}>
        <div className="wp-utility"><span>Saturday, September 12, 2026</span><div><a href="#wp-demo-title">About</a><a href="#wp-demo-title">Contact</a><a href="#wp-demo-title">Newsletter</a></div></div>
        <header className="wp-header">
          <div className="wp-logo"><i>F</i><div><strong>Fieldnotes</strong><span>Ideas for considered living</span></div></div>
          <button className="wp-subscribe">Subscribe</button>
        </header>
        <nav className="wp-nav" aria-label="WordPress demo navigation">
          <a className="active" href="#wp-demo-title">Home</a><a href="#wp-demo-title">Journal</a><a href="#wp-demo-title">Design</a><a href="#wp-demo-title">Culture</a><a href="#wp-demo-title">Travel</a><a href="#wp-demo-title">About</a>
          <button aria-label="Open search">⌕</button>
        </nav>

        <div className="wp-featured">
          <div className="wp-feature-image"><span>Issue No. 24</span><div className="wp-sun" /><div className="wp-horizon" /></div>
          <article>
            <span className="wp-kicker">Featured essay</span>
            <h3>The quiet spaces where better ideas begin</h3>
            <p>What happens when we make room for reflection, curiosity, and the kind of work that cannot be rushed?</p>
            <div className="wp-byline"><span className="wp-author-avatar">ER</span><div><b>Elena Rossi</b><small>8 min read · 24 comments</small></div></div>
            <a className="wp-read-more" href="#wp-demo-title">Read the story <span>→</span></a>
          </article>
        </div>

        <div className="wp-layout">
          <main className="wp-content">
            <div className="wp-section-heading"><h3>Latest stories</h3><span>Thoughts, interviews and field notes</span></div>
            <div className="wp-post-grid">
              {POSTS.map((post, index) => (
                <article className="wp-post-card" key={post.title}>
                  <div className={`wp-post-image image-${index}`} style={{ '--post-a': color(post.color, 200), '--post-b': color(post.color, 700) }}><span>{post.category}</span></div>
                  <div><span className="wp-post-meta">{post.date} · {5 + index * 2} min read</span><h4>{post.title}</h4><p>A short introduction to the story gives readers context and invites them to continue.</p><a href="#wp-demo-title">Continue reading →</a></div>
                </article>
              ))}
            </div>

            <article className="wp-longform">
              <span className="wp-kicker">From the editor</span><h3>Why independent publishing still matters</h3>
              <p className="wp-dropcap">Publishing on the open web gives ideas a durable home. It encourages thoughtful archives, direct relationships with readers, and an internet made from many distinct voices.</p>
              <blockquote>“A publication becomes meaningful when its design serves the words and the people reading them.”</blockquote>
              <p>Our theme pairs generous typography with a familiar content hierarchy. Every surface, link, rule, button, and callout is generated from the color system above.</p>
            </article>

            <div className="wp-comments">
              <div className="wp-section-heading"><h3>Discussion</h3><span>2 responses</span></div>
              <article><span className="wp-comment-avatar one">JM</span><div><b>Jordan Miles <small>· 2 hours ago</small></b><p>This balance of editorial structure and restrained color feels particularly readable.</p><button>Reply</button></div></article>
              <article><span className="wp-comment-avatar two">SK</span><div><b>Samira Khan <small>· 48 minutes ago</small></b><p>The sidebar widgets are a useful way to evaluate subtle borders and secondary text.</p><button>Reply</button></div></article>
              <form><textarea aria-label="Comment" placeholder="Join the discussion…" /><button type="button">Post comment</button></form>
            </div>
          </main>

          <aside className="wp-sidebar" aria-label="Content widgets">
            <section className="wp-widget wp-search-widget"><h4>Search</h4><div><input aria-label="Search articles" placeholder="Search articles…" /><button>⌕</button></div></section>
            <section className="wp-widget wp-about-widget"><div className="wp-editor-photo">AM</div><h4>About the editor</h4><p>Fieldnotes is an independent journal about design, culture, and living with intention.</p><a href="#wp-demo-title">More about us</a></section>
            <section className="wp-widget"><h4>Categories</h4><ul className="wp-category-list"><li><a href="#wp-demo-title">Design</a><span>18</span></li><li><a href="#wp-demo-title">Culture</a><span>12</span></li><li><a href="#wp-demo-title">Field Notes</a><span>24</span></li><li><a href="#wp-demo-title">Interviews</a><span>9</span></li><li><a href="#wp-demo-title">Travel</a><span>15</span></li></ul></section>
            <section className="wp-widget"><h4>Recent posts</h4><div className="wp-recent-posts">{POSTS.map((post, index) => <a href="#wp-demo-title" key={post.title}><i style={{ background: `linear-gradient(135deg,${color(post.color, 200)},${color(post.color, 600)})` }}>{index + 1}</i><span>{post.title}<small>{post.date}</small></span></a>)}</div></section>
            <section className="wp-widget wp-newsletter"><span>Weekly letter</span><h4>Ideas worth keeping</h4><p>A thoughtful story delivered every Sunday. No noise, no tracking.</p><input type="email" aria-label="Newsletter email" placeholder="you@example.com" /><button>Join 4,200 readers</button><small>Unsubscribe whenever you like.</small></section>
            <section className="wp-widget"><h4>Browse by month</h4><select aria-label="Archive month" defaultValue="september"><option value="september">September 2026</option><option>August 2026</option><option>July 2026</option></select></section>
            <section className="wp-widget"><h4>Popular tags</h4><div className="wp-tags">{['Architecture', 'Books', 'Craft', 'Essays', 'Interiors', 'Nature', 'Photography', 'Typography'].map((tag) => <a href="#wp-demo-title" key={tag}>{tag}</a>)}</div></section>
          </aside>
        </div>

        <footer className="wp-footer">
          <div><div className="wp-logo inverse"><i>F</i><div><strong>Fieldnotes</strong><span>Ideas for considered living</span></div></div><p>An independent publication built for the open web.</p></div>
          <div><h4>Explore</h4><a href="#wp-demo-title">Latest stories</a><a href="#wp-demo-title">The archive</a><a href="#wp-demo-title">Contributors</a></div>
          <div><h4>Follow</h4><a href="#wp-demo-title">Instagram</a><a href="#wp-demo-title">Mastodon</a><a href="#wp-demo-title">RSS feed</a></div>
          <div><h4>Newsletter</h4><p>One good story, every Sunday.</p><button>Subscribe →</button></div>
        </footer>
        <div className="wp-copyright"><span>© 2026 Fieldnotes</span><span>Proudly powered by WordPress</span></div>
      </div>
    </section>
  );
}
