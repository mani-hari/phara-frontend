// Brand primitives for hi-fi: Logo, ornaments, header, ratings, etc.

// Recreated PariharaOnline logo: warm sun mandala mark + wordmark
const Logo = ({ size = 36, dark = false, showTagline = false }) => {
  const fg = dark ? '#faf6ee' : '#1a1410';
  const accent = '#b6442e';
  const gold = '#b88746';
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
        {/* outer mandala ring */}
        <circle cx="32" cy="32" r="29" fill="none" stroke={gold} strokeWidth="1.4"/>
        {/* sun rays */}
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i * 22.5) * Math.PI / 180;
          const x1 = 32 + Math.cos(a) * 22;
          const y1 = 32 + Math.sin(a) * 22;
          const x2 = 32 + Math.cos(a) * 28;
          const y2 = 32 + Math.sin(a) * 28;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={gold} strokeWidth="1.2" strokeLinecap="round"/>;
        })}
        {/* inner sun disk */}
        <circle cx="32" cy="32" r="18" fill={accent}/>
        {/* lotus petals around center */}
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i * 45) * Math.PI / 180;
          const cx = 32 + Math.cos(a) * 11;
          const cy = 32 + Math.sin(a) * 11;
          return <ellipse key={i} cx={cx} cy={cy} rx="3.2" ry="1.6" fill="#fae3b8" transform={`rotate(${i*45} ${cx} ${cy})`}/>;
        })}
        {/* center bindu */}
        <circle cx="32" cy="32" r="3.5" fill="#fae3b8"/>
        <circle cx="32" cy="32" r="1.5" fill={accent}/>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, fontSize: size * 0.55, color: fg, letterSpacing: '-0.01em' }}>
          Parihara<span style={{ color: accent }}>·</span>Online
        </span>
        {showTagline && (
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: gold, marginTop: 4 }}>
            Guided since 2009
          </span>
        )}
      </div>
    </div>
  );
};

// Decorative kolam corner motif
const KolamCorner = ({ size = 64, color = '#b88746', style }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" style={style} aria-hidden>
    <g fill="none" stroke={color} strokeWidth="1" strokeLinecap="round">
      <path d="M2 2 L62 2" opacity="0.4"/>
      <path d="M2 2 L2 62" opacity="0.4"/>
      <path d="M2 14 Q 14 14 14 2"/>
      <path d="M2 26 Q 26 26 26 2" opacity="0.6"/>
      <path d="M8 8 L8 8 M14 14 L14 14" />
      <circle cx="8" cy="8" r="1.2" fill={color} stroke="none"/>
      <circle cx="20" cy="8" r="0.8" fill={color} stroke="none" opacity="0.6"/>
      <circle cx="8" cy="20" r="0.8" fill={color} stroke="none" opacity="0.6"/>
      <path d="M20 20 Q 26 14 32 20 Q 26 26 20 20" opacity="0.7"/>
    </g>
  </svg>
);

// Center ornament — diamond / star sigil for section dividers
const CenterSigil = ({ size = 22, color = '#b88746' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
    <g fill="none" stroke={color} strokeWidth="1.1">
      <circle cx="12" cy="12" r="3.5"/>
      <path d="M12 2 L12 6 M12 18 L12 22 M2 12 L6 12 M18 12 L22 12"/>
      <path d="M5 5 L7.5 7.5 M16.5 7.5 L19 5 M5 19 L7.5 16.5 M16.5 16.5 L19 19" opacity="0.6"/>
    </g>
    <circle cx="12" cy="12" r="1.5" fill={color}/>
  </svg>
);

const GoldRule = ({ style }) => (
  <div className="gold-rule" style={style}>
    <span className="diamond" />
  </div>
);

const SectionHeader = ({ eyebrow, title, sub, align = 'left', children }) => (
  <div style={{ textAlign: align }}>
    {eyebrow && (
      <div className="row gap-8 items-center" style={{ justifyContent: align === 'center' ? 'center' : 'flex-start', marginBottom: 12 }}>
        <CenterSigil size={14} />
        <span className="eyebrow eyebrow-gold">{eyebrow}</span>
        <CenterSigil size={14} />
      </div>
    )}
    <div className="h2">{title}</div>
    {sub && <div className="body-lg mt-12" style={{ color: 'var(--ink-3)', maxWidth: 560, marginLeft: align === 'center' ? 'auto' : 0, marginRight: align === 'center' ? 'auto' : 0 }}>{sub}</div>}
    {children}
  </div>
);

// Top header — sticky-style horizontal nav
const SiteHeader = ({ active = 'Poojas', dark }) => (
  <div style={{
    background: dark ? '#1a1410' : 'rgba(250, 246, 238, 0.92)',
    backdropFilter: 'blur(8px)',
    borderBottom: '1px solid var(--ink-line)',
    padding: '14px 32px',
    display: 'flex',
    alignItems: 'center',
    gap: 32,
    position: 'sticky',
    top: 0,
    zIndex: 10,
  }}>
    <Logo size={32} dark={dark} />
    <div style={{ flex: 1, display: 'flex', gap: 26, justifyContent: 'center', fontSize: 14, fontWeight: 500 }}>
      {['Poojas', 'Homams', 'Astrology', 'Annadanam', 'Blog', 'About'].map(it => (
        <span key={it} style={{
          color: dark ? '#faf6ee' : 'var(--ink)',
          opacity: it === active ? 1 : 0.7,
          fontWeight: it === active ? 600 : 500,
          borderBottom: it === active ? '1.5px solid var(--sindoor)' : '1.5px solid transparent',
          paddingBottom: 3,
          cursor: 'pointer',
        }}>{it}</span>
      ))}
    </div>
    <div className="row gap-12 items-center">
      <span style={{ fontSize: 13, color: dark ? '#faf6ee' : 'var(--ink-3)' }}>EN · ₹ INR</span>
      <SearchIcon dark={dark}/>
      <CartIcon dark={dark} count={1}/>
      <button className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: 13, color: dark ? '#faf6ee' : undefined, borderColor: dark ? 'rgba(250,246,238,0.3)' : undefined }}>Sign in</button>
    </div>
  </div>
);

const SearchIcon = ({ dark }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={dark ? '#faf6ee' : '#1a1410'} strokeWidth="1.6">
    <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
  </svg>
);
const CartIcon = ({ dark, count }) => (
  <div style={{ position: 'relative', display: 'inline-flex' }}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={dark ? '#faf6ee' : '#1a1410'} strokeWidth="1.6">
      <path d="M3 4h2.5l2.6 12.5a2 2 0 0 0 2 1.5h7.5a2 2 0 0 0 2-1.5L21 8H6"/>
      <circle cx="10" cy="21" r="1"/><circle cx="18" cy="21" r="1"/>
    </svg>
    {count > 0 && (
      <span style={{ position: 'absolute', top: -6, right: -8, background: 'var(--sindoor)', color: '#fff', fontSize: 10, fontWeight: 600, borderRadius: 999, padding: '1px 5px', minWidth: 16, textAlign: 'center' }}>{count}</span>
    )}
  </div>
);

const Footer = () => (
  <div style={{ background: '#1a1410', color: 'rgba(250,246,238,0.75)', padding: '48px 40px 32px' }}>
    <div className="row gap-40">
      <div style={{ flex: 1.4 }}>
        <Logo size={32} dark showTagline/>
        <div className="body-sm mt-16" style={{ color: 'rgba(250,246,238,0.6)', maxWidth: 320 }}>
          Sacred rituals, performed in your name. Trusted by 4,200+ devotees across 18 countries.
        </div>
      </div>
      {[
        ['Services', ['Temple Poojas', 'Homams', 'Astrology', 'Prasadam', 'Annadanam']],
        ['Discover', ['Blog', 'Ask Parihara', 'About', 'Founder', 'Press']],
        ['Help', ['FAQ', 'Shipping', 'Refunds', 'Contact', 'WhatsApp']],
      ].map(([t, items]) => (
        <div key={t} style={{ flex: 1 }}>
          <div className="eyebrow eyebrow-gold mb-12">{t}</div>
          {items.map(i => <div key={i} style={{ marginBottom: 6, fontSize: 13 }}>{i}</div>)}
        </div>
      ))}
    </div>
    <div className="row between mt-32" style={{ borderTop: '1px solid rgba(250,246,238,0.1)', paddingTop: 16, fontSize: 11, color: 'rgba(250,246,238,0.4)' }}>
      <span>© 2026 PariharaOnline · Chennai · Made with देवोत्त</span>
      <span>Privacy · Terms · Cookies</span>
    </div>
  </div>
);

// Star rating
const Stars = ({ value = 5, count, size = 13 }) => (
  <div className="row gap-8 items-center">
    <div style={{ color: 'var(--gold)', letterSpacing: 1, fontSize: size }}>
      {'★'.repeat(Math.floor(value))}{value % 1 ? '⯨' : ''}{'☆'.repeat(5 - Math.ceil(value))}
    </div>
    {count != null && <span className="body-sm num">{value.toFixed(1)} · {count.toLocaleString()} reviews</span>}
  </div>
);

// Img placeholder w/ optional glyph
const Img = ({ children, deep, style, label }) => (
  <div className={`imgph ${deep ? 'imgph-deep' : ''}`} style={style}>
    {children}
    {label && <span style={{ position: 'absolute', bottom: 8, left: 10, fontSize: 9 }}>{label}</span>}
  </div>
);

// Floating chat bubble
const ChatBubble = ({ style }) => (
  <div style={{ position: 'absolute', bottom: 24, right: 24, ...style }}>
    <div style={{
      background: '#1a1410',
      color: '#faf6ee',
      borderRadius: 999,
      padding: '12px 20px 12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      boxShadow: '0 12px 32px rgba(26,20,16,0.3)',
      cursor: 'pointer',
    }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--sindoor)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✦</div>
      <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontWeight: 500 }}>Ask Parihara</span>
    </div>
  </div>
);

// Trust badge row
const TrustRow = () => (
  <div className="row gap-24 items-center" style={{ flexWrap: 'wrap' }}>
    {[
      ['Performed by certified priests', '✓'],
      ['HD video sent within 24 hours', '▶'],
      ['Prasadam shipped worldwide', '✈'],
      ['4,200+ devotees · 18 countries', '⌘'],
    ].map(([t, ic]) => (
      <div key={t} className="row gap-8 items-center">
        <span style={{ color: 'var(--sindoor)', fontSize: 14 }}>{ic}</span>
        <span className="body-sm" style={{ color: 'var(--ink-3)' }}>{t}</span>
      </div>
    ))}
  </div>
);

// Numeric counter ('127 booked this month')
const Pulse = ({ children }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--sage)', fontWeight: 500 }}>
    <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--sage)', boxShadow: '0 0 0 3px rgba(111,122,90,0.25)' }}/>
    {children}
  </span>
);

Object.assign(window, {
  Logo, KolamCorner, CenterSigil, GoldRule, SectionHeader, SiteHeader, Footer,
  Stars, Img, ChatBubble, TrustRow, Pulse,
});
