// Hi-fi: Chat-forward Home Landing (evolved from Home C wireframe)

const HomeHiFi = () =>
<div className="page" style={{ minHeight: 1700 }}>
    <SiteHeader active="Poojas" />

    {/* HERO — chat as front door */}
    <div style={{ position: 'relative', padding: '64px 32px 56px', background: 'var(--paper)', overflow: 'hidden' }}>
      <KolamCorner size={80} style={{ position: 'absolute', top: 18, left: 18, opacity: 0.5 }} />
      <KolamCorner size={80} style={{ position: 'absolute', top: 18, right: 18, transform: 'scaleX(-1)', opacity: 0.5 }} />
      <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
        <div className="row gap-8 center mb-16">
          <CenterSigil size={14} />
          <span className="eyebrow eyebrow-gold">Welcome · Guided since 2009</span>
          <CenterSigil size={14} />
        </div>
        <h1 className="h1-display" style={{ marginBottom: 18, width: "800px", textAlign: "center" }}>
          What would you like a <em style={{ fontStyle: 'italic', color: 'var(--sindoor)' }}>pooja</em> for?
        </h1>
        <div className="body-lg" style={{ color: 'var(--ink-3)', maxWidth: 540, margin: '0 auto 28px', width: "700px" }}>
          Tell us what's on your mind — a worry, a wish, a moment in the family. We'll suggest the right ritual, performed at the temple in your name.
        </div>

        {/* Chat input — refined */}
        <div className="card" style={{ padding: 18, textAlign: 'left', boxShadow: 'var(--shadow-md)' }}>
          <div className="row gap-12 items-center mb-12">
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--sindoor)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✦</div>
            <span className="body" style={{ color: 'var(--ink-4)' }}>Ask Parihara anything — what pooja, why, where...</span>
            <span className="caret" />
          </div>
          <div className="row between items-center" style={{ paddingTop: 12, borderTop: '1px solid var(--ink-line)' }}>
            <span className="label mono" style={{ fontSize: 11 }}></span>
            <button className="btn btn-sindoor">Ask  →</button>
          </div>
        </div>
        {/* Suggestion chips */}
        <div className="row gap-8 wrap center mt-20" style={{ justifyContent: 'center', maxWidth: 700, margin: '20px auto 0' }}>
          {[
        'For my father\'s recovery from a stroke',
        'We\'ve been trying to conceive',
        'Saturn return remedies',
        'My daughter\'s marriage is delayed'].
        map((s) =>
        <span key={s} className="chip lift" style={{ cursor: 'pointer' }}>"{s}"</span>
        )}
        </div>
      </div>
    </div>

    {/* Best-sellers strip — driven by analytics (Ghee, Oil, Rahu Ketu lead) */}
    <div style={{ padding: '64px 40px', background: 'var(--paper-2)' }}>
      <div className="row between items-end mb-32">
        <SectionHeader eyebrow="Most-loved this season" title="Begin where most devotees do." />
        <a className="body-sm" style={{ color: 'var(--ink)', borderBottom: '1px solid var(--ink-line-2)', paddingBottom: 2 }}>Browse all 60 rituals  →</a>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        {[
      { tag: 'For Conceiving', title: 'Garbarakshambigai Ghee', sub: 'Temple-blessed prasadham · sealed glass jar', price: '₹2,499', img: 'GHEE · LAMP IN COPPER VESSEL', deity: 'Garbarakshambigai · Tirukkarukavur', stars: 4.9, reviews: 281 },
      { tag: 'For Safe Delivery', title: 'Garbarakshambigai Oil', sub: 'For 3rd-trimester abhyangam', price: '₹2,320', img: 'OIL · BRONZE LAMP', deity: 'Garbarakshambigai · Tirukkarukavur', stars: 4.9, reviews: 333 },
      { tag: 'For Sarpa Dosha', title: 'Rahu Ketu Parihara Pooja', sub: 'Performed at Sri Kalahasti · 11 priests', price: '₹1,450', img: 'KALAHASTI TEMPLE GOPURAM', deity: 'Sri Kalahasti · Andhra Pradesh', stars: 4.8, reviews: 126 }].
      map((p) =>
      <div key={p.title} className="card lift" style={{ cursor: 'pointer' }}>
            <Img style={{ height: 220 }} deep>{p.img}</Img>
            <div style={{ padding: 22 }}>
              <div className="row between items-center mb-8">
                <span className="chip chip-sindoor">{p.tag}</span>
                <Stars value={p.stars} size={12} />
              </div>
              <h3 className="h3" style={{ marginBottom: 6 }}>{p.title}</h3>
              <div className="body-sm">{p.sub}</div>
              <div className="label mt-12" style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: 14, color: 'var(--ink-4)' }}>{p.deity}</div>
              <div className="row between items-center mt-16">
                <span className="num h4" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>{p.price}</span>
                <span className="body-sm" style={{ color: 'var(--sindoor)', fontWeight: 600 }}>View details  →</span>
              </div>
            </div>
          </div>
      )}
      </div>
    </div>

    {/* Browse by intent — six tiles */}
    <div style={{ padding: '64px 40px', background: 'var(--paper)' }}>
      <SectionHeader align="center" eyebrow="Find a ritual that fits" title="Browse by what you're seeking" sub="Every prayer has a tradition. Tell us the question — we'll show you the answer." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 40 }}>
        {[
      ['Health & healing', 'Mrityunjaya · Dhanvantri · Ayushya', '32 rituals'],
      ['Family & children', 'Garbarakshambigai · Putra Kameshti · Annaprasana', '24 rituals'],
      ['Career & wealth', 'Sudarshana · Lakshmi · Kubera', '18 rituals'],
      ['Marriage', 'Swayamvara Parvathi · Kanchi Kamakshi', '12 rituals'],
      ['Astrology remedies', 'Rahu Ketu · Navagraha · Sani Peyarchi', '40 rituals'],
      ['For ancestors', 'Tila Homam · Tarpanam · Pitru Paksha', '9 rituals']].
      map(([t, sub, c]) =>
      <div key={t} className="card-flat lift" style={{ padding: 24, cursor: 'pointer', position: 'relative' }}>
            <div className="h4" style={{ marginBottom: 6 }}>{t}</div>
            <div className="body-sm" style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', color: 'var(--ink-3)' }}>{sub}</div>
            <div className="row between items-center mt-16">
              <span className="label num">{c}</span>
              <span style={{ color: 'var(--sindoor)' }}>→</span>
            </div>
          </div>
      )}
      </div>
    </div>

    {/* Recent homam videos */}
    <div style={{ padding: '64px 40px', background: 'var(--paper-3)' }}>
      <div className="row between items-end mb-32">
        <SectionHeader eyebrow="From our yagasala" title="Live recordings, sent to every devotee." sub="Every homam is performed by our priests in our own yagasala. The HD video is sent within 24 hours — proof, blessing and keepsake." />
        <button className="btn btn-ghost">All recordings  →</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16 }}>
        <div className="card relative" style={{ position: 'relative' }}>
          <Img style={{ height: 280 }} deep>SUDARSHANA HOMAM · APRIL 28</Img>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: 'var(--sindoor)', paddingLeft: 5 }}>▶</div>
          </div>
          <div style={{ position: 'absolute', bottom: 16, left: 18, right: 18, color: '#faf6ee' }}>
            <div className="eyebrow" style={{ color: 'var(--gold)' }}>Featured · 14 min</div>
            <div className="h3" style={{ color: '#faf6ee', marginTop: 4 }}>Sudarshana Homam for the Iyer family</div>
          </div>
        </div>
        {[
      ['Ganapati Homam', 'April 24 · 11 min'],
      ['Mrityunjaya Homam', 'April 20 · 22 min']].
      map(([t, m]) =>
      <div key={t} className="card relative">
            <Img style={{ height: 280 }} deep>{t.toUpperCase()}</Img>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--sindoor)', paddingLeft: 3 }}>▶</div>
            </div>
            <div style={{ position: 'absolute', bottom: 14, left: 14, right: 14, color: '#faf6ee' }}>
              <div className="eyebrow" style={{ color: 'var(--gold)', fontSize: 9 }}>{m}</div>
              <div className="h4" style={{ color: '#faf6ee', marginTop: 3 }}>{t}</div>
            </div>
          </div>
      )}
      </div>
    </div>

    {/* Astrology + Testimonial split */}
    <div style={{ padding: '64px 40px', background: 'var(--paper)', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 32 }}>
      <div className="card" style={{ padding: 40, position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #1a1410 0%, #2c1f15 100%)', color: '#faf6ee' }}>
        <KolamCorner color="#b88746" size={80} style={{ position: 'absolute', top: 18, right: 18, opacity: 0.4 }} />
        <span className="eyebrow" style={{ color: 'var(--gold)' }}>Practical Astrology</span>
        <h2 className="h1" style={{ color: '#faf6ee', marginTop: 14, maxWidth: 360 }}>Real readings.<br />No fortune-telling.</h2>
        <div className="body" style={{ color: 'rgba(250,246,238,0.75)', maxWidth: 380, marginTop: 16 }}>
          Live consultation with Sanskrit-trained jyotishas. Birth-chart based, honest answers — and a remedy if needed. Not a script.
        </div>
        <div className="row gap-12 mt-32 items-center">
          <button className="btn btn-sindoor btn-lg">Book a 30-min reading</button>
          <span className="num body-sm" style={{ color: 'rgba(250,246,238,0.55)' }}>From ₹2,650 · in 6 languages</span>
        </div>
      </div>
      <div className="card" style={{ padding: 36, background: 'var(--paper-2)' }}>
        <span className="eyebrow eyebrow-sindoor">Devotees say</span>
        <div className="h3 italic-script mt-14" style={{ color: 'var(--ink)', lineHeight: 1.3 }}>
          "After the Mrityunjaya Homam, my father came home from the hospital. We watched the video together — he cried. So did I."
        </div>
        <div className="row gap-12 items-center mt-24">
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--gold-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cormorant Garamond', fontSize: 16, color: 'var(--gold-2)', fontWeight: 600 }}>LR</div>
          <div>
            <div className="body" style={{ fontWeight: 600 }}>Lakshmi R.</div>
            <div className="label num">Edison · New Jersey</div>
          </div>
          <div style={{ flex: 1 }} />
          <Stars value={5} size={14} />
        </div>
        <div className="row gap-6 mt-24">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i === 1 ? 'var(--ink)' : 'var(--ink-line-2)' }} />)}
        </div>
      </div>
    </div>

    {/* WhatsApp / FAQ teaser */}
    <div style={{ padding: '48px 40px', background: 'var(--paper-2)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div className="card" style={{ padding: 28 }}>
        <div className="row gap-14 items-center">
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--sage-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: 'var(--sage)' }}>♉</div>
          <div style={{ flex: 1 }}>
            <div className="h4">Muhurat reminders on WhatsApp</div>
            <div className="body-sm">Auspicious dates · ekadasi · pradosha · your nakshatra</div>
          </div>
          <button className="btn btn-primary">Subscribe</button>
        </div>
      </div>
      <div className="card" style={{ padding: 28 }}>
        <div className="row gap-14 items-center">
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--gold-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'var(--gold-2)' }}>?</div>
          <div style={{ flex: 1 }}>
            <div className="h4">63 questions, answered.</div>
            <div className="body-sm">How poojas work · payments · refunds · prasadam</div>
          </div>
          <button className="btn btn-ghost">Read FAQ</button>
        </div>
      </div>
    </div>

    <Footer />
    <PillButton />
  </div>;


Object.assign(window, { HomeHiFi });