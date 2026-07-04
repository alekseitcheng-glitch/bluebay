'use client';

import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────────────────────
   BLUEBAY AUTO CARE — Mobile Detailing SF
   Full-scale React SPA: Home · Services · Booking · Loyalty · Admin · Contact
   Email via Brevo SMTP · SQLite via Prisma
───────────────────────────────────────────────────────────── */

// ── DATA ────────────────────────────────────────────────────────
const PACKAGES = [
  {
    id: "silver", tier: "Silver", sub: "Basic", badge: null, badgeColor: "#8B95A5",
    accent: "#8B95A5",
    prices: { sedan: 110, suv: 130, large: 160 },
    features: ["Exterior hand wash & dry","Wheels & tires cleaned","Interior vacuum","Wipe dash & surfaces","Windows cleaned"],
  },
  {
    id: "gold", tier: "Gold", sub: "Standard", badge: "MOST POPULAR", badgeColor: "#C9A84C",
    accent: "#C9A84C",
    prices: { sedan: 180, suv: 210, large: 250 },
    features: ["Everything in Silver","Carpet & upholstery shampoo","Door jambs cleaned","Clay/decontamination (if needed)","Wax or sealant","Deeper interior cleaning"],
  },
  {
    id: "platinum", tier: "Platinum", sub: "Premium", badge: "BEST RESULTS", badgeColor: "#8A7EB8",
    accent: "#8A7EB8",
    prices: { sedan: 320, suv: 380, large: "450+" },
    features: ["Shampoo seats & carpets","Clay bar treatment","Polish application","Wax/sealant protection","Tire & trim dressing","Complete transformation"],
  },
];

const ADDONS = [
  { name: "Pet Hair Removal", price: "$40-50" },
  { name: "Headlight Restoration", price: "$60-80" },
  { name: "Clay Bar Treatment", price: "$50-100" },
  { name: "Engine Bay Cleaning", price: "$60-80" },
  { name: "Odor Elimination", price: "$50-75" },
  { name: "Ceramic Coating", price: "Call for quote" },
];

const VEHICLE_TYPES = [
  { id: "sedan", label: "Sedan / Coupe", abbr: "SD" },
  { id: "suv",   label: "SUV / Crossover", abbr: "SV" },
  { id: "large", label: "Large SUV / Van / Truck", abbr: "LG" },
];

const ALL_TIME_SLOTS = [
  "8:00 AM","9:00 AM","10:00 AM","11:00 AM",
  "12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM",
];

const TESTIMONIALS = [
  { name: "Jessica Lin", vehicle: "Tesla Model 3 Owner", stars: 5, text: "Best mobile detailing in SF. They came to my office and my Tesla looked brand new when they finished. Very professional and great attention to detail." },
  { name: "Marcus T.", vehicle: "BMW X5 Owner", stars: 5, text: "Gold package on my SUV -- absolutely worth every penny. They showed up on time, were super thorough, and the whole process was seamless." },
  { name: "Priya S.", vehicle: "Honda Accord Owner", stars: 5, text: "I've tried a few mobile detailing services in SF and BlueBay is by far the best. Eco-friendly products, no water waste, and the results speak for themselves." },
  { name: "Derek W.", vehicle: "Ford F-150 Owner", stars: 5, text: "They came to my driveway in the Marina, did the Platinum package on my truck. Looks better than the day I bought it." },
];

const LOYALTY_TIERS = [
  { name: "Wash & Go", min: 0,   max: 199,  perks: ["Earn 1 point per $1 spent","Birthday bonus points","Appointment reminders"] },
  { name: "Shine Club", min: 200, max: 499,  perks: ["Everything in Wash & Go","5% off every booking","Priority scheduling","Free add-on after 5 visits"] },
  { name: "Bay Elite",  min: 500, max: null, perks: ["Everything in Shine Club","10% off every booking","Dedicated detailer","Free clay bar yearly","Referral bonuses"] },
];

// ── STYLES ──────────────────────────────────────────────────────
const C = {
  bg:      "#090C14",
  card:    "#0F1219",
  card2:   "#141820",
  border:  "#1C2029",
  border2: "#252A35",
  blue:    "#4A8AF4",
  blueLt:  "#6BA3FF",
  blueDim: "#2A4A80",
  gold:    "#C9A84C",
  goldLt:  "#DDBE66",
  white:   "#E8ECF2",
  muted:   "#8B95A5",
  dim:     "#5A6374",
  subtle:  "#3E4758",
  green:   "#3DBB8A",
  purple:  "#8A7EB8",
  red:     "#E05A5A",
  amber:   "#D4A24E",
};

// ── SVG ICONS ────────────────────────────────────────────────────
function IconMobile() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
    </svg>
  );
}

function IconLeaf() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 019.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
    </svg>
  );
}

function IconChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6"/>
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6"/>
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  );
}

function IconAlert() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}

function IconStar({ filled }: { filled: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}

// ── MINI COMPONENTS ─────────────────────────────────────────────
function Stars({ n = 5 }: { n?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 2, color: C.gold }}>
      {Array.from({ length: 5 }, (_, i) => <IconStar key={i} filled={i < n} />)}
    </span>
  );
}

function Chip({ children, color = C.blue, style: sx = {} }: { children: React.ReactNode; color?: string; style?: React.CSSProperties }) {
  return (
    <span style={{
      display:"inline-flex",alignItems:"center",
      background: color + "14", color, border: `1px solid ${color}25`,
      borderRadius: 4, padding: "3px 10px",
      fontSize: 10, fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase" as const,
      ...sx
    }}>{children}</span>
  );
}

function Btn({ children, onClick, variant = "primary", size = "md", style: sx = {}, href, disabled, type }: { children: React.ReactNode; onClick?: () => void; variant?: string; size?: string; style?: React.CSSProperties; href?: string; disabled?: boolean; type?: "button" | "submit" }) {
  const sizes: Record<string, React.CSSProperties> = {
    xs: { padding: "4px 10px", fontSize: 10 },
    sm: { padding: "7px 16px", fontSize: 11 },
    md: { padding: "10px 22px", fontSize: 12 },
    lg: { padding: "13px 28px", fontSize: 13 },
  };
  const variants: Record<string, React.CSSProperties> = {
    primary:   { background: C.blue, color: "#fff", border: "none" },
    gold:      { background: C.gold, color: "#090C14", border: "none" },
    outline:   { background: "transparent", color: C.white, border: `1px solid ${C.border2}` },
    ghost:     { background: "transparent", color: C.muted, border: `1px solid ${C.border}` },
    danger:    { background: C.red + "18", color: C.red, border: `1px solid ${C.red}35` },
    success:   { background: C.green + "18", color: C.green, border: `1px solid ${C.green}35` },
  };
  const base: React.CSSProperties = {
    cursor: disabled ? "not-allowed" : "pointer",
    borderRadius: 4,
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" as const,
    textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.15s ease",
    opacity: disabled ? 0.35 : 1,
    ...sizes[size], ...variants[variant], ...sx,
  };
  if (href) return <a href={href} style={base}>{children}</a>;
  return <button type={type} onClick={disabled ? undefined : onClick} style={base}>{children}</button>;
}

function Input({ label, ...props }: { label?: string; [key: string]: any }) {
  return (
    <div>
      {label && <label style={{ fontSize: 10, fontWeight: 600, color: C.dim, letterSpacing: 0.8, textTransform: "uppercase" as const, display: "block", marginBottom: 5 }}>{label}</label>}
      <input {...props} style={{
        width: "100%", padding: "9px 12px", borderRadius: 4,
        background: C.bg, border: `1px solid ${C.border}`,
        color: C.white, fontSize: 13, fontFamily: "'Outfit',sans-serif",
        boxSizing: "border-box", outline: "none", transition: "border-color 0.15s",
        ...props.style
      }} />
    </div>
  );
}

function Textarea({ label, ...props }: { label?: string; [key: string]: any }) {
  return (
    <div>
      {label && <label style={{ fontSize: 10, fontWeight: 600, color: C.dim, letterSpacing: 0.8, textTransform: "uppercase" as const, display: "block", marginBottom: 5 }}>{label}</label>}
      <textarea {...props} style={{
        width: "100%", padding: "9px 12px", borderRadius: 4,
        background: C.bg, border: `1px solid ${C.border}`,
        color: C.white, fontSize: 13, fontFamily: "'Outfit',sans-serif",
        boxSizing: "border-box", resize: "vertical" as const, minHeight: 90, outline: "none", transition: "border-color 0.15s",
        ...props.style
      }} />
    </div>
  );
}

function Card({ children, style: sx = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 6,
      ...sx
    }}>{children}</div>
  );
}

function SectionTitle({ chip, title, sub, light = true, center = true }: { chip?: string; title: string; sub?: string; light?: boolean; center?: boolean }) {
  return (
    <div style={{ textAlign: center ? "center" : "left", marginBottom: 44 }}>
      {chip && <div style={{ marginBottom: 10 }}><Chip>{chip}</Chip></div>}
      <h2 style={{
        fontFamily: "'Outfit',sans-serif", fontWeight: 700,
        fontSize: "clamp(26px,3.5vw,40px)", lineHeight: 1.15,
        color: light ? C.white : C.bg, margin: "0 0 12px", letterSpacing: -0.3,
        whiteSpace: "pre-line",
      }}>{title}</h2>
      {sub && <p style={{ color: light ? C.muted : C.dim, fontSize: 14, lineHeight: 1.7, maxWidth: 480, margin: center ? "0 auto" : undefined }}>{sub}</p>}
    </div>
  );
}

function FeatureIcon({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: 34, height: 34, borderRadius: 6,
      background: C.blueDim + "30", border: `1px solid ${C.blue}20`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: C.blueLt, flexShrink: 0,
    }}>{children}</div>
  );
}

// ── NAVBAR ───────────────────────────────────────────────────────
function Navbar({ page, setPage }: { page: string; setPage: (p: string) => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const links = ["Home","Services","Booking","Loyalty","Contact"];
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? C.bg + "EE" : "transparent",
      borderBottom: scrolled ? `1px solid ${C.border}` : "none",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      transition: "all 0.2s ease",
    }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div onClick={() => setPage("Home")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 9 }}>
          <img src="/logo.png" alt="BlueBay Auto Care" style={{ width: 32, height: 32, borderRadius: 6 }} />
          <div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 14, color: C.white, lineHeight: 1, letterSpacing: 1 }}>BLUEBAY</div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 400, fontSize: 8, color: C.dim, letterSpacing: 2.5, textTransform: "uppercase" as const }}>AUTO CARE</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
          {links.map(l => (
            <button key={l} onClick={() => setPage(l)} style={{
              background: page === l ? C.blue + "12" : "none",
              border: "none", cursor: "pointer",
              fontFamily: "'Outfit',sans-serif", fontWeight: page === l ? 600 : 400,
              fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase" as const,
              color: page === l ? C.blueLt : C.muted,
              padding: "6px 12px", borderRadius: 4,
              transition: "all 0.15s",
            }}>{l}</button>
          ))}
          <Btn href="tel:+14157028468" variant="gold" size="sm" style={{ marginLeft: 12 }}>
            (415) 702-8468
          </Btn>
        </div>
      </div>
    </nav>
  );
}

// ── HOME PAGE ────────────────────────────────────────────────────
function HomePage({ setPage }: { setPage: (p: string) => void }) {
  return (
    <div>
      {/* HERO */}
      <div style={{
        minHeight: "100vh", position: "relative", overflow: "hidden",
        background: C.bg,
        display: "flex", alignItems: "center",
      }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "110px 24px 70px", position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: 48, alignItems: "center" }}>
          <div>
            <Chip color={C.dim} style={{ marginBottom: 20 }}>Mobile Service / San Francisco</Chip>
            <h1 style={{
              fontFamily: "'Outfit',sans-serif", fontWeight: 700,
              fontSize: "clamp(36px,5.5vw,64px)", color: C.white,
              lineHeight: 1, margin: "0 0 20px", letterSpacing: -1,
            }}>
              WE COME<br/>
              <span style={{ color: C.blueLt }}>TO YOU</span>
            </h1>
            <p style={{ color: C.muted, fontSize: 16, lineHeight: 1.7, marginBottom: 32, maxWidth: 420 }}>
              Professional mobile detailing at your doorstep. Eco-friendly products, premium tools -- we make your car shine like new, anywhere in SF.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 44 }}>
              <Btn onClick={() => setPage("Booking")} variant="gold" size="lg">Request Appointment</Btn>
              <Btn href="tel:+14157028468" variant="outline" size="lg">Call (415) 702-8468</Btn>
            </div>
            <div style={{ display: "flex", gap: 28 }}>
              {[
                { icon: <IconMobile />, t: "Mobile Service", s: "We Come to You" },
                { icon: <IconLeaf />, t: "Eco-Friendly", s: "Safe Products" },
                { icon: <IconShield />, t: "Satisfaction", s: "Guaranteed" },
              ].map(({ icon, t, s }) => (
                <div key={t} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                  <FeatureIcon>{icon}</FeatureIcon>
                  <div>
                    <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:600, color:C.white, fontSize:12 }}>{t}</div>
                    <div style={{ color:C.dim, fontSize:11 }}>{s}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Card style={{ padding: 24 }}>
            <div style={{ textAlign: "center", marginBottom: 18 }}>
              <Chip color={C.gold}>Starting from $110</Chip>
              <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:18, color:C.white, margin:"10px 0 3px" }}>Choose Your Package</h3>
              <p style={{ color:C.dim, fontSize:12, margin:0 }}>Silver / Gold / Platinum</p>
            </div>
            {PACKAGES.map(pkg => (
              <div key={pkg.id} onClick={() => setPage("Services")} style={{
                display:"flex", justifyContent:"space-between", alignItems:"center",
                padding:"10px 12px", borderRadius:5, marginBottom:6, cursor:"pointer",
                background: pkg.id === "gold" ? pkg.accent + "0C" : "transparent",
                border: `1px solid ${pkg.id === "gold" ? pkg.accent + "30" : C.border}`,
                transition:"all 0.15s",
              }}>
                <div>
                  <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:600, color: pkg.accent, fontSize:13 }}>
                    {pkg.tier} {pkg.badge && <span style={{ fontSize:8, background:pkg.accent+"18", padding:"2px 7px", borderRadius:3, marginLeft:5, fontWeight:600 }}>{pkg.badge}</span>}
                  </div>
                  <div style={{ color:C.dim, fontSize:11, marginTop:1 }}>{pkg.sub}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontWeight:700, color:C.white, fontSize:14 }}>from ${pkg.prices.sedan}</div>
                  <div style={{ color:C.dim, fontSize:10 }}>sedan</div>
                </div>
              </div>
            ))}
            <Btn onClick={() => setPage("Booking")} variant="gold" size="md" style={{ width:"100%", marginTop:8 }}>Request Appointment</Btn>
          </Card>
        </div>
      </div>

      {/* TRUST BAR */}
      <div style={{ background: C.card, borderTop:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}`, padding:"14px 24px" }}>
        <div style={{ maxWidth:1120, margin:"0 auto", display:"flex", justifyContent:"space-around", flexWrap:"wrap", gap:10 }}>
          {["Mobile Service","Eco-Friendly Products","Card / Cash / PayPal / Venmo","Satisfaction Guaranteed","All San Francisco"].map(t => (
            <span key={t} style={{ fontFamily:"'Outfit',sans-serif", fontWeight:500, fontSize:11, color:C.dim, letterSpacing:0.3 }}>{t}</span>
          ))}
        </div>
      </div>

      {/* PACKAGES SECTION */}
      <div style={{ background: C.bg, padding:"72px 24px" }}>
        <div style={{ maxWidth:1120, margin:"0 auto" }}>
          <SectionTitle chip="Packages" title="Detailing Packages" sub="Professional service packages for every vehicle and budget." />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
            {PACKAGES.map(pkg => (
              <Card key={pkg.id} style={{
                padding:0, overflow:"hidden", position:"relative",
                border: pkg.id === "gold" ? `1px solid ${pkg.accent}40` : undefined,
              }}>
                {pkg.badge && (
                  <div style={{
                    position:"absolute", top:12, right:-24,
                    background: pkg.accent, color: pkg.id === "gold" ? C.bg : C.white,
                    fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:8, letterSpacing:1,
                    padding:"3px 32px", transform:"rotate(45deg)", transformOrigin:"center",
                  }}>{pkg.badge}</div>
                )}
                <div style={{ padding:"22px 22px 0", borderBottom:`1px solid ${C.border}` }}>
                  <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:22, color: pkg.accent, letterSpacing:-0.3 }}>{pkg.tier}</div>
                  <div style={{ color:C.dim, fontSize:12, marginBottom:16 }}>{pkg.sub}</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:7, marginBottom:18 }}>
                    {VEHICLE_TYPES.map(v => (
                      <div key={v.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <span style={{ color:C.muted, fontSize:12 }}>{v.label}</span>
                        <span style={{ fontWeight:700, color:C.white, fontSize:14 }}>${pkg.prices[v.id]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ padding:"16px 22px 22px" }}>
                  <ul style={{ margin:0, padding:0, listStyle:"none", display:"flex", flexDirection:"column", gap:7 }}>
                    {pkg.features.map(f => (
                      <li key={f} style={{ display:"flex", gap:8, alignItems:"flex-start", color:C.muted, fontSize:12, lineHeight:1.4 }}>
                        <span style={{ color:pkg.accent, flexShrink:0, marginTop:2, display:"flex" }}><IconCheck /></span>{f}
                      </li>
                    ))}
                  </ul>
                  <Btn onClick={() => setPage("Booking")} variant={pkg.id === "gold" ? "gold" : "ghost"} size="md" style={{ width:"100%", marginTop:18 }}>Book Now</Btn>
                </div>
              </Card>
            ))}
          </div>

          {/* Add-ons */}
          <div style={{ marginTop:36 }}>
            <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:600, fontSize:16, color:C.white, textAlign:"center", marginBottom:16 }}>Add-On Services</h3>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center" }}>
              {ADDONS.map(a => (
                <Card key={a.name} style={{ padding:"9px 16px", display:"flex", alignItems:"center", gap:10 }}>
                  <div>
                    <div style={{ fontWeight:600, color:C.white, fontSize:12 }}>{a.name}</div>
                    <div style={{ color:C.gold, fontSize:11, fontWeight:600 }}>{a.price}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* WHY CHOOSE SECTION */}
      <div style={{ background: C.card, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding:"72px 24px" }}>
        <div style={{ maxWidth:1120, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:56, alignItems:"center" }}>
          <div>
            <SectionTitle chip="Why BlueBay" title={"Professional Care\nAt Your Doorstep"} sub="We bring premium auto detailing directly to your location in San Francisco." center={false} />
            <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginBottom:28 }}>
              {["Premium Products","Mobile Service","Eco-Friendly","Pay After Service"].map(t => (
                <Chip key={t} color={C.blue}>{t}</Chip>
              ))}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
              {[
                { icon: <IconShield />, t: "Professional & Reliable", d: "Mobile detailing service at your doorstep. We treat every vehicle with care." },
                { icon: <IconLeaf />, t: "Eco-Friendly Products", d: "We use eco-friendly cleaning products and premium detailing tools for outstanding results." },
                { icon: <IconClock />, t: "Flexible Scheduling", d: "We come to your home or office at your convenience. Book online or call us." },
                { icon: <IconStar filled />, t: "Satisfaction Guaranteed", d: "We make your car shine like new. Your complete satisfaction is our priority." },
              ].map(({ icon, t, d }) => (
                <div key={t} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                  <FeatureIcon>{icon}</FeatureIcon>
                  <div>
                    <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:600, color:C.white, fontSize:13, marginBottom:2 }}>{t}</div>
                    <div style={{ color:C.dim, fontSize:12, lineHeight:1.6 }}>{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {TESTIMONIALS.slice(0,2).map(t => (
              <Card key={t.name} style={{ padding:22 }}>
                <Stars n={t.stars} />
                <p style={{ color:C.muted, fontSize:13, lineHeight:1.7, margin:"8px 0" }}>&ldquo;{t.text}&rdquo;</p>
                <div style={{ fontWeight:600, color:C.blueLt, fontSize:12 }}>{t.name}</div>
                <div style={{ color:C.dim, fontSize:11 }}>{t.vehicle}</div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA BANNER */}
      <div style={{ background: C.bg, borderTop:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}`, padding:"56px 24px", textAlign:"center" }}>
        <div style={{ maxWidth:600, margin:"0 auto" }}>
          <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:"clamp(22px,3.5vw,36px)", color:C.white, margin:"0 0 10px", letterSpacing:-0.3 }}>Ready for a Spotless Ride?</h2>
          <p style={{ color:C.muted, fontSize:14, marginBottom:28 }}>Request an appointment today and we will confirm your time. Payment collected after your appointment -- card, cash, PayPal, or Venmo.</p>
          <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
            <Btn onClick={() => setPage("Booking")} variant="gold" size="lg">Request Appointment</Btn>
            <Btn href="tel:+14157028468" variant="outline" size="lg">Call (415) 702-8468</Btn>
          </div>
        </div>
      </div>

      <Footer setPage={setPage} />
    </div>
  );
}

// ── SERVICES PAGE ────────────────────────────────────────────────
function ServicesPage({ setPage }: { setPage: (p: string) => void }) {
  const [selectedPkg, setSelectedPkg] = useState("gold");
  const [vehicleType, setVehicleType] = useState("sedan");

  return (
    <div style={{ paddingTop:60, background:C.bg, minHeight:"100vh" }}>
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding:"48px 24px 64px" }}>
        <div style={{ maxWidth:1120, margin:"0 auto" }}>
          <SectionTitle chip="Our Services" title="Everything Your Car Needs" sub="Choose a package and vehicle type to see your price." />
          <div style={{ display:"flex", justifyContent:"center", gap:6, marginBottom:36 }}>
            {VEHICLE_TYPES.map(v => (
              <button key={v.id} onClick={() => setVehicleType(v.id)} style={{
                padding:"9px 20px", borderRadius:4, cursor:"pointer",
                fontFamily:"'Outfit',sans-serif", fontWeight:600, fontSize:12,
                background: vehicleType === v.id ? C.blue : "transparent",
                color: vehicleType === v.id ? "#fff" : C.muted, border: vehicleType === v.id ? "1px solid transparent" : `1px solid ${C.border}`,
                transition:"all 0.15s",
              }}>{v.label}</button>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:48 }}>
            {PACKAGES.map(pkg => (
              <Card key={pkg.id} style={{
                padding:0, overflow:"hidden", cursor:"pointer",
                border: selectedPkg === pkg.id ? `1px solid ${pkg.accent}` : `1px solid ${C.border}`,
                transition:"all 0.15s",
              }}
                onClick={() => setSelectedPkg(pkg.id)}>
                <div style={{ padding:"20px 20px 12px", background: selectedPkg === pkg.id ? pkg.accent + "08" : "transparent" }}>
                  {pkg.badge && <Chip color={pkg.accent} style={{ marginBottom:7, fontSize:8 }}>{pkg.badge}</Chip>}
                  <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:22, color:pkg.accent }}>{pkg.tier}</div>
                  <div style={{ color:C.dim, fontSize:12, marginBottom:12 }}>{pkg.sub}</div>
                  <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:34, color:C.white, lineHeight:1 }}>
                    ${pkg.prices[vehicleType as keyof typeof pkg.prices]}
                    <span style={{ fontSize:13, color:C.dim, fontWeight:400 }}> / visit</span>
                  </div>
                </div>
                <div style={{ padding:"12px 20px 20px", borderTop:`1px solid ${C.border}` }}>
                  <ul style={{ margin:0, padding:0, listStyle:"none", display:"flex", flexDirection:"column", gap:7 }}>
                    {pkg.features.map(f => (
                      <li key={f} style={{ display:"flex", gap:8, color:C.muted, fontSize:12, lineHeight:1.4 }}>
                        <span style={{ color:pkg.accent, display:"flex", marginTop:1 }}><IconCheck /></span>{f}
                      </li>
                    ))}
                  </ul>
                  <Btn onClick={() => setPage("Booking")} variant={selectedPkg===pkg.id ? (pkg.id==="gold"?"gold":"primary") : "ghost"} size="sm" style={{ width:"100%", marginTop:16 }}>
                    Book {pkg.tier}
                  </Btn>
                </div>
              </Card>
            ))}
          </div>
          <SectionTitle chip="Add-Ons" title="Enhance Your Detail" sub="Add any of these services to any package." />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px,1fr))", gap:10 }}>
            {ADDONS.map(a => (
              <Card key={a.name} style={{ padding:"14px 18px", display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, color:C.white, fontSize:13 }}>{a.name}</div>
                  <div style={{ color:C.gold, fontWeight:600, fontSize:12, marginTop:1 }}>{a.price}</div>
                </div>
                <Btn onClick={() => setPage("Booking")} variant="ghost" size="sm">Add</Btn>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── BOOKING PAGE ─────────────────────────────────────────────────
function BookingPage() {
  const today = new Date();
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selDate, setSelDate] = useState<Date | null>(null);
  const [selTime, setSelTime] = useState("");
  const [selPkg, setSelPkg] = useState("");
  const [selVehicle, setSelVehicle] = useState("sedan");
  const [addons, setAddons] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name:"", email:"", phone:"", vehicle:"", address:"", notes:"" });
  const [loading, setLoading] = useState(false);
  const [ref, setRef] = useState("");
  const [waiverChecked, setWaiverChecked] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promoResult, setPromoResult] = useState<{ valid: boolean; label?: string; discountCents?: number; error?: string } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>(ALL_TIME_SLOTS);

  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];
  const dim = new Date(month.getFullYear(), month.getMonth()+1, 0).getDate();
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();

  const isDisabled = (d: number) => {
    const dt = new Date(month.getFullYear(), month.getMonth(), d);
    return dt < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  // Fetch available slots when date changes
  useEffect(() => {
    if (!selDate) return;
    const iso = selDate.toISOString().split("T")[0];
    fetch(`/api/available-slots?date=${iso}`)
      .then(r => r.json())
      .then(data => {
        if (data.slots) setAvailableSlots(data.slots);
      })
      .catch(() => setAvailableSlots(ALL_TIME_SLOTS));
  }, [selDate]);

  const toggleAddon = (name: string) => setAddons(a => a.includes(name) ? a.filter(x => x!==name) : [...a, name]);

  const pkg = PACKAGES.find(p => p.id === selPkg);
  const basePrice = typeof pkg?.prices[selVehicle as keyof typeof pkg.prices] === "number" ? (pkg.prices[selVehicle as keyof typeof pkg.prices] as number) : 0;
  const addonPrices: Record<string, number> = { "Pet Hair Removal":45,"Headlight Restoration":70,"Clay Bar Treatment":75,"Engine Bay Cleaning":70,"Odor Elimination":62,"Ceramic Coating":0 };
  const addonTotal = addons.reduce((s,a) => s + (addonPrices[a]||0), 0);
  const subtotalCents = (basePrice + addonTotal) * 100;
  const discountCents = promoResult?.valid ? (promoResult.discountCents || 0) : 0;
  const totalCents = Math.max(0, subtotalCents - discountCents);
  const totalEst = basePrice ? `$${(totalCents / 100).toFixed(0)}` : "--";

  // Validate promo code
  const handlePromoApply = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    try {
      const res = await fetch("/api/promo-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoInput, estimatedCents: subtotalCents }),
      });
      const data = await res.json();
      setPromoResult(data);
    } catch {
      setPromoResult({ valid: false, error: "Failed to validate code" });
    }
    setPromoLoading(false);
  };

  async function handleConfirm() {
    setLoading(true);
    const dateStr = selDate?.toLocaleDateString("en-US",{ weekday:"long", month:"long", day:"numeric" });
    const dateIso = selDate ? selDate.toISOString().split("T")[0] : "";
    const bookRef = "BB" + Date.now().toString(36).toUpperCase();
    setRef(bookRef);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
          vehicleType: selVehicle,
          vehicleDesc: form.vehicle,
          address: form.address,
          packageId: selPkg,
          packageName: pkg ? `${pkg.tier} / ${pkg.sub}` : selPkg,
          addons,
          dateIso,
          timeSlot: selTime,
          notes: form.notes,
          promoCode: promoResult?.valid ? promoInput : null,
          discount: discountCents,
          estimatedCents: subtotalCents,
          finalCents: totalCents,
        }),
      });
      const bookingData = await res.json();

      if (!bookingData.ok) {
        console.error("[Booking save error]", bookingData.error);
      }

      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const bookingId = bookingData.booking?.id || "unknown";

      // Send PENDING email to customer
      const customerHtml = `
        <div style="font-family: 'Outfit', Arial, sans-serif; max-width:600px; margin:0 auto; background:#0B0F1A; color:#E8ECF2; border-radius:8px; overflow:hidden;">
          <div style="background:#4A8AF4; padding:22px 26px; text-align:center;">
            <h1 style="margin:0; font-size:20px; font-weight:700; color:#fff;">BlueBay Auto Care</h1>
            <p style="margin:3px 0 0; font-size:12px; color:rgba(255,255,255,0.85);">Appointment Request Received</p>
          </div>
          <div style="padding:22px 26px;">
            <p style="font-size:15px; margin:0 0 16px;">Hi ${form.name},</p>
            <p style="font-size:13px; line-height:1.7; margin:0 0 14px;">We've received your appointment request. Your booking is currently <strong style="color:#D4A24E; background:#D4A24E18; padding:2px 7px; border-radius:3px;">PENDING</strong> -- we will confirm or suggest a new time shortly.</p>
            <div style="background:rgba(212,162,78,0.06); border:1px solid rgba(212,162,78,0.2); border-radius:6px; padding:12px; margin-bottom:18px;">
              <p style="margin:0; font-size:11px; color:#D4A24E; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">Important</p>
              <p style="margin:3px 0 0; font-size:12px; color:rgba(232,236,242,0.7); line-height:1.6;">The date and time you selected is a <strong style="color:#E8ECF2;">request</strong>, not a guarantee. We will email you once your appointment is confirmed or if we need to adjust the time.</p>
            </div>
            <table style="width:100%; border-collapse:collapse; margin-bottom:18px;">
              <tr><td style="padding:7px 0; border-bottom:1px solid #1C2029; color:#5A6374; font-size:11px; width:105px;">Service</td><td style="padding:7px 0; border-bottom:1px solid #1C2029; font-weight:700;">${pkg?.tier} / ${pkg?.sub}</td></tr>
              <tr><td style="padding:7px 0; border-bottom:1px solid #1C2029; color:#5A6374; font-size:11px;">Vehicle</td><td style="padding:7px 0; border-bottom:1px solid #1C2029;">${form.vehicle} (${VEHICLE_TYPES.find(v=>v.id===selVehicle)?.label})</td></tr>
              <tr><td style="padding:7px 0; border-bottom:1px solid #1C2029; color:#5A6374; font-size:11px;">Requested</td><td style="padding:7px 0; border-bottom:1px solid #1C2029; font-weight:700; color:#6BA3FF;">${dateStr} at ${selTime}</td></tr>
              <tr><td style="padding:7px 0; border-bottom:1px solid #1C2029; color:#5A6374; font-size:11px;">Address</td><td style="padding:7px 0; border-bottom:1px solid #1C2029;">${form.address}</td></tr>
              ${addons.length ? `<tr><td style="padding:7px 0; border-bottom:1px solid #1C2029; color:#5A6374; font-size:11px;">Add-ons</td><td style="padding:7px 0; border-bottom:1px solid #1C2029;">${addons.join(", ")}</td></tr>` : ""}
              ${promoResult?.valid ? `<tr><td style="padding:7px 0; border-bottom:1px solid #1C2029; color:#5A6374; font-size:11px;">Promo</td><td style="padding:7px 0; border-bottom:1px solid #1C2029; color:#3DBB8A;">${promoResult.label}</td></tr>` : ""}
              <tr><td style="padding:7px 0; border-bottom:1px solid #1C2029; color:#5A6374; font-size:11px;">Estimated Total</td><td style="padding:7px 0; border-bottom:1px solid #1C2029; font-weight:800; font-size:15px;">${totalEst}</td></tr>
              <tr><td style="padding:7px 0; border-bottom:1px solid #1C2029; color:#5A6374; font-size:11px;">Ref</td><td style="padding:7px 0; border-bottom:1px solid #1C2029;">${bookRef}</td></tr>
              <tr><td style="padding:7px 0; color:#5A6374; font-size:11px;">Payment</td><td style="padding:7px 0;">Card, cash, PayPal, or Venmo -- collected after your appointment.</td></tr>
            </table>
            <p style="font-size:11px; color:#5A6374; line-height:1.6; margin:0;">Questions? Call or text <strong style="color:#E8ECF2;">(415) 702-8468</strong></p>
          </div>
          <div style="background:#0F1219; padding:12px 26px; text-align:center; font-size:10px; color:#3E4758; border-top:1px solid #1C2029;">
            BlueBay Auto Care / San Francisco, CA
          </div>
        </div>
      `;
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toEmail: form.email, toName: form.name, subject: `Appointment Request Received -- ${dateStr}`, html: customerHtml }),
      });

      // Send NEW BOOKING email to admin with confirm/change buttons
      const adminHtml = `
        <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto; padding:0;">
          <div style="background:#4A8AF4; padding:16px 22px; border-radius:8px 8px 0 0;">
            <h1 style="margin:0; font-size:18px; color:#fff; font-weight:700;">New Booking Request</h1>
            <p style="margin:2px 0 0; font-size:12px; color:rgba(255,255,255,0.8);">Ref: ${bookRef}</p>
          </div>
          <div style="padding:18px 22px; background:#f8f9fa; border:1px solid #e2e8f0; border-top:none; border-radius:0 0 8px 8px;">
            <table style="width:100%; border-collapse:collapse; margin-bottom:16px;">
              <tr><td style="padding:5px 0; color:#5A6374; font-size:11px; width:105px;">Customer</td><td style="padding:5px 0; font-weight:700;">${form.name}</td></tr>
              <tr><td style="padding:5px 0; color:#5A6374; font-size:11px;">Email</td><td style="padding:5px 0;"><a href="mailto:${form.email}" style="color:#4A8AF4;">${form.email}</a></td></tr>
              <tr><td style="padding:5px 0; color:#5A6374; font-size:11px;">Phone</td><td style="padding:5px 0;"><a href="tel:${form.phone}" style="color:#4A8AF4;">${form.phone}</a></td></tr>
              <tr><td style="padding:5px 0; color:#5A6374; font-size:11px;">Service</td><td style="padding:5px 0;">${pkg?.tier} / ${pkg?.sub}</td></tr>
              <tr><td style="padding:5px 0; color:#5A6374; font-size:11px;">Vehicle</td><td style="padding:5px 0;">${form.vehicle} (${VEHICLE_TYPES.find(v=>v.id===selVehicle)?.label})</td></tr>
              <tr><td style="padding:5px 0; color:#5A6374; font-size:11px;">Requested</td><td style="padding:5px 0; font-weight:700; color:#4A8AF4;">${dateStr} at ${selTime}</td></tr>
              <tr><td style="padding:5px 0; color:#5A6374; font-size:11px;">Address</td><td style="padding:5px 0;">${form.address}</td></tr>
              ${addons.length ? `<tr><td style="padding:5px 0; color:#5A6374; font-size:11px;">Add-ons</td><td style="padding:5px 0;">${addons.join(", ")}</td></tr>` : ""}
              ${promoResult?.valid ? `<tr><td style="padding:5px 0; color:#5A6374; font-size:11px;">Promo</td><td style="padding:5px 0; color:#3DBB8A;">${promoResult.label}</td></tr>` : ""}
              <tr><td style="padding:5px 0; color:#5A6374; font-size:11px;">Estimated Total</td><td style="padding:5px 0; font-weight:800; font-size:14px;">${totalEst}</td></tr>
              ${form.notes ? `<tr><td style="padding:5px 0; color:#5A6374; font-size:11px;">Notes</td><td style="padding:5px 0;">${form.notes}</td></tr>` : ""}
            </table>
            <div style="text-align:center; padding:14px 0 6px;">
              <p style="font-size:10px; color:#5A6374; margin:0 0 12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">Confirm or adjust the appointment time:</p>
              <a href="${baseUrl}/api/bookings/${bookingId}/confirm" onclick="event.preventDefault(); fetch('${baseUrl}/api/bookings/${bookingId}/confirm', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({action:'confirm'})}).then(r=>r.json()).then(d=>{if(d.ok) this.textContent='Confirmed!'; else alert('Error: '+d.error);}); this.style.opacity='0.6';" style="display:inline-block; background:#3DBB8A; color:#090C14; text-decoration:none; padding:10px 28px; border-radius:4px; font-weight:700; font-size:12px; margin:0 5px; cursor:pointer;">Confirm Time</a>
              <a href="${baseUrl}/?change=${bookingId}" style="display:inline-block; background:#C9A84C; color:#090C14; text-decoration:none; padding:10px 28px; border-radius:4px; font-weight:700; font-size:12px; margin:0 5px; cursor:pointer;">Change Time</a>
            </div>
            <p style="font-size:10px; color:#8B95A5; text-align:center; margin:12px 0 0;">Payment to collect on-site: card, cash, PayPal, or Venmo</p>
          </div>
        </div>
      `;
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toEmail: "alekseitcheng@icloud.com", toName: "BlueBay Team", subject: `New Booking Request: ${bookRef} -- ${form.name}`, html: adminHtml }),
      });

    } catch (err) {
      console.error("[Booking error]", err);
    }

    setLoading(false);
    setStep(5);
  }

  const can1 = selPkg;
  const can2 = selDate && selTime;
  const can3 = form.name && form.email && form.phone && form.vehicle && form.address;

  return (
    <div style={{ paddingTop:60, background:C.bg, minHeight:"100vh" }}>
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding:"48px 24px 64px" }}>
        <div style={{ maxWidth:780, margin:"0 auto" }}>
          <SectionTitle chip="Book Online" title="Request an Appointment" sub="Select your service and preferred time. We'll confirm with you shortly." />

          {/* Steps */}
          <div style={{ display:"flex", justifyContent:"center", marginBottom:36 }}>
            {[["1","Service"],["2","Date & Time"],["3","Your Info"],["4","Review"],["5","Done"]].map(([n,l],i) => (
              <div key={n} style={{ display:"flex", alignItems:"center" }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", minWidth:58 }}>
                  <div style={{
                    width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                    background: step > i+1 ? C.green : step===i+1 ? C.blue : "transparent",
                    color: step > i+1 ? "#090C14" : step===i+1 ? "#fff" : C.dim, fontWeight:700, fontSize:11, border: step===i+1 ? "none" : `1px solid ${C.border}`,
                  }}>{step>i+1 ? <IconCheck /> : n}</div>
                  <div style={{ fontSize:9, color: step===i+1?C.blueLt:C.dim, marginTop:3, fontWeight:step===i+1?600:400 }}>{l}</div>
                </div>
                {i<4 && <div style={{ width:36, height:1, background: step>i+1 ? C.green+"50" : C.border, marginBottom:16, flexShrink:0 }} />}
              </div>
            ))}
          </div>

          {/* STEP 1: Package + Vehicle + Addons */}
          {step===1 && (
            <Card style={{ padding:28 }}>
              <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:18, color:C.white, marginBottom:16 }}>Select Your Package</h3>
              <div style={{ display:"flex", gap:6, marginBottom:18 }}>
                {VEHICLE_TYPES.map(v => (
                  <button key={v.id} onClick={() => setSelVehicle(v.id)} style={{
                    flex:1, padding:"9px 0", borderRadius:4, cursor:"pointer",
                    background: selVehicle===v.id ? C.blue+"14" : "transparent",
                    border: selVehicle===v.id ? `1px solid ${C.blue}` : `1px solid ${C.border}`,
                    color: selVehicle===v.id ? C.white : C.muted,
                    fontFamily:"'Outfit',sans-serif", fontWeight:600, fontSize:11, transition:"all 0.15s",
                  }}>{v.label}</button>
                ))}
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:22 }}>
                {PACKAGES.map(p => (
                  <div key={p.id} onClick={() => setSelPkg(p.id)} style={{
                    display:"flex", justifyContent:"space-between", alignItems:"center",
                    padding:"14px 16px", borderRadius:5, cursor:"pointer",
                    background: selPkg===p.id ? p.accent+"0C" : "transparent",
                    border: selPkg===p.id ? `1px solid ${p.accent}` : `1px solid ${C.border}`,
                    transition:"all 0.15s",
                  }}>
                    <div>
                      <div style={{ fontWeight:700, color:p.accent, fontSize:15 }}>{p.tier} <span style={{ color:C.dim, fontWeight:400, fontSize:11 }}>/ {p.sub}</span></div>
                      <div style={{ color:C.dim, fontSize:11, marginTop:1 }}>{p.features.slice(0,2).join(" / ")}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontWeight:700, color:C.white, fontSize:18 }}>${p.prices[selVehicle as keyof typeof p.prices]}</div>
                      {selPkg===p.id && <div style={{ color:C.green, fontSize:10, fontWeight:600 }}>Selected</div>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add-ons */}
              <h4 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:600, fontSize:10, color:C.dim, marginBottom:10, letterSpacing:0.8, textTransform:"uppercase" as const }}>Add-Ons (Optional)</h4>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:22 }}>
                {ADDONS.map(a => (
                  <button key={a.name} onClick={() => toggleAddon(a.name)} style={{
                    display:"flex", alignItems:"center", gap:9, padding:"9px 12px", borderRadius:4, cursor:"pointer",
                    background: addons.includes(a.name) ? C.gold+"0C" : "transparent",
                    border: addons.includes(a.name) ? `1px solid ${C.gold}35` : `1px solid ${C.border}`,
                    color: C.white, textAlign:"left" as const, transition:"all 0.15s",
                  }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:600 }}>{a.name}</div>
                      <div style={{ fontSize:10, color:C.gold }}>{a.price}</div>
                    </div>
                    {addons.includes(a.name) && <span style={{ color:C.green, display:"flex" }}><IconCheck /></span>}
                  </button>
                ))}
              </div>

              <Btn onClick={() => setStep(2)} disabled={!can1} variant="gold" size="md" style={{ width:"100%" }}>Continue to Date & Time</Btn>
            </Card>
          )}

          {/* STEP 2: Date & Time with PROMINENT disclaimer */}
          {step===2 && (
            <Card style={{ padding:28 }}>
              {/* PROMINENT DISCLAIMER */}
              <div style={{
                background: C.amber + "0A",
                border: `1px solid ${C.amber}25`,
                borderRadius: 5,
                padding: "14px 16px",
                marginBottom: 24,
              }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                  <span style={{ color:C.amber, flexShrink:0, marginTop:1, display:"flex" }}><IconAlert /></span>
                  <div>
                    <h4 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, color:C.amber, fontSize:13, margin:"0 0 5px" }}>Time Is Not Guaranteed</h4>
                    <p style={{ color:C.muted, fontSize:12, lineHeight:1.7, margin:0 }}>
                      Selecting a date and time below is a <strong style={{ color:C.white }}>request only</strong>. Your appointment is <strong style={{ color:C.amber }}>not confirmed</strong> until we review availability and send you a confirmation. We may need to suggest an alternative time.
                    </p>
                  </div>
                </div>
              </div>

              <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:18, color:C.white, marginBottom:16 }}>Select Your Preferred Date & Time</h3>

              {/* Calendar */}
              <div style={{ marginBottom:22 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth()-1, 1))} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, borderRadius:4, padding:"5px 10px", cursor:"pointer", display:"flex", alignItems:"center" }}><IconChevronLeft /></button>
                  <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, color:C.white, fontSize:14 }}>{MONTHS[month.getMonth()]} {month.getFullYear()}</div>
                  <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth()+1, 1))} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, borderRadius:4, padding:"5px 10px", cursor:"pointer", display:"flex", alignItems:"center" }}><IconChevronRight /></button>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, textAlign:"center" }}>
                  {DAYS.map(d => <div key={d} style={{ fontSize:10, fontWeight:600, color:C.dim, padding:"5px 0" }}>{d}</div>)}
                  {Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`} />)}
                  {Array.from({ length: dim }, (_, i) => {
                    const d = i + 1;
                    const disabled = isDisabled(d);
                    const sel = selDate && selDate.getFullYear()===month.getFullYear() && selDate.getMonth()===month.getMonth() && selDate.getDate()===d;
                    return (
                      <button key={d} disabled={disabled} onClick={() => !disabled && setSelDate(new Date(month.getFullYear(), month.getMonth(), d))} style={{
                        padding:"7px 0", borderRadius:4, cursor: disabled ? "not-allowed" : "pointer",
                        background: sel ? C.blue : "transparent",
                        border: sel ? "none" : `1px solid ${C.border}`,
                        color: disabled ? C.border : sel ? "#fff" : C.muted,
                        fontWeight: sel ? 700 : 400, fontSize:12,
                        opacity: disabled ? 0.25 : 1,
                        transition:"all 0.1s",
                      }}>{d}</button>
                    );
                  })}
                </div>
              </div>

              {/* Time slots */}
              {selDate && (
                <div style={{ marginBottom:22 }}>
                  <h4 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:600, fontSize:10, color:C.dim, letterSpacing:0.8, textTransform:"uppercase" as const, marginBottom:8 }}>Preferred Time</h4>
                  {availableSlots.length === 0 ? (
                    <div style={{ background:C.red+"0A", border:`1px solid ${C.red}25`, borderRadius:4, padding:12, textAlign:"center" }}>
                      <p style={{ color:C.red, fontWeight:600, margin:"0 0 3px", fontSize:13 }}>No times available</p>
                      <p style={{ color:C.dim, fontSize:11, margin:0 }}>This date is fully booked. Please select another date.</p>
                    </div>
                  ) : (
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:5 }}>
                      {availableSlots.map(t => (
                        <button key={t} onClick={() => setSelTime(t)} style={{
                          padding:"9px 6px", borderRadius:4, cursor:"pointer",
                          background: selTime===t ? C.blue+"14" : "transparent",
                          border: selTime===t ? `1px solid ${C.blue}` : `1px solid ${C.border}`,
                          color: selTime===t ? C.white : C.muted,
                          fontFamily:"'Outfit',sans-serif", fontWeight: selTime===t ? 700 : 500,
                          fontSize:12, transition:"all 0.1s",
                        }}>{t}</button>
                      ))}
                    </div>
                  )}
                  <p style={{ fontSize:10, color:C.dim, marginTop:7 }}>Selecting a time does not guarantee availability. We will confirm with you.</p>
                </div>
              )}

              <div style={{ display:"flex", gap:8 }}>
                <Btn onClick={() => setStep(1)} variant="ghost" size="md" style={{ flex:1 }}>Back</Btn>
                <Btn onClick={() => setStep(3)} disabled={!can2} variant="gold" size="md" style={{ flex:2 }}>Continue to Your Info</Btn>
              </div>
            </Card>
          )}

          {/* STEP 3: Customer Info + Promo Code */}
          {step===3 && (
            <Card style={{ padding:28 }}>
              <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:18, color:C.white, marginBottom:16 }}>Your Information</h3>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                <Input label="Full Name" placeholder="John Smith" value={form.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, name:e.target.value})} />
                <Input label="Phone" placeholder="(415) 555-1234" value={form.phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, phone:e.target.value})} />
              </div>
              <div style={{ marginBottom:12 }}>
                <Input label="Email" type="email" placeholder="john@example.com" value={form.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, email:e.target.value})} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                <Input label="Vehicle" placeholder="2022 Tesla Model 3" value={form.vehicle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, vehicle:e.target.value})} />
                <Input label="Service Address" placeholder="123 Main St, SF" value={form.address} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, address:e.target.value})} />
              </div>
              <div style={{ marginBottom:18 }}>
                <Textarea label="Notes (optional)" placeholder="Any special requests or instructions..." value={form.notes} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({...form, notes:e.target.value})} />
              </div>

              {/* Promo Code */}
              <div style={{
                background: C.green + "06",
                border: `1px solid ${C.green}20`,
                borderRadius:5, padding:14, marginBottom:22,
              }}>
                <h4 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:600, fontSize:10, color:C.green, margin:"0 0 8px", letterSpacing:0.8, textTransform:"uppercase" as const }}>Promo Code</h4>
                <div style={{ display:"flex", gap:6 }}>
                  <input value={promoInput} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setPromoInput(e.target.value.toUpperCase()); setPromoResult(null); }} placeholder="Enter code" style={{
                    flex:1, padding:"9px 12px", borderRadius:4,
                    background:C.bg, border:`1px solid ${C.border}`,
                    color:C.white, fontSize:13, fontFamily:"'Outfit',sans-serif",
                    boxSizing:"border-box", outline:"none", textTransform:"uppercase" as const,
                  }} />
                  <Btn onClick={handlePromoApply} disabled={!promoInput.trim() || promoLoading} variant="success" size="md">
                    {promoLoading ? "..." : "Apply"}
                  </Btn>
                </div>
                {promoResult && promoResult.valid && (
                  <div style={{ marginTop:7, color:C.green, fontSize:11, fontWeight:600, display:"flex", alignItems:"center", gap:4 }}>
                    <span style={{ display:"flex" }}><IconCheck /></span> {promoResult.label} -- ${((promoResult.discountCents||0)/100).toFixed(0)} off
                  </div>
                )}
                {promoResult && !promoResult.valid && (
                  <div style={{ marginTop:7, color:C.red, fontSize:11, fontWeight:600 }}>
                    {promoResult.error || "Invalid code"}
                  </div>
                )}
              </div>

              <div style={{ display:"flex", gap:8 }}>
                <Btn onClick={() => setStep(2)} variant="ghost" size="md" style={{ flex:1 }}>Back</Btn>
                <Btn onClick={() => setStep(4)} disabled={!can3} variant="gold" size="md" style={{ flex:2 }}>Review Booking</Btn>
              </div>
            </Card>
          )}

          {/* STEP 4: Review */}
          {step===4 && (() => {
            const dateStr = selDate?.toLocaleDateString("en-US",{ weekday:"long", month:"long", day:"numeric" });
            return (
              <Card style={{ padding:28 }}>
                <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:18, color:C.white, marginBottom:16 }}>Review Your Request</h3>

                {/* PENDING DISCLAIMER */}
                <div style={{
                  background: C.amber + "0A",
                  border: `1px solid ${C.amber}25`,
                  borderRadius: 5,
                  padding: "12px 16px",
                  marginBottom: 18,
                }}>
                  <p style={{ color:C.amber, fontWeight:600, fontSize:12, margin:"0 0 3px" }}>This is a request, not a confirmed appointment</p>
                  <p style={{ color:C.dim, fontSize:11, margin:0 }}>We will review your request and email you a confirmation or suggest an alternative time.</p>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5, marginBottom:16 }}>
                  {[
                    ["Service", `${pkg?.tier} / ${pkg?.sub}`],
                    ["Vehicle", `${form.vehicle} (${VEHICLE_TYPES.find(v=>v.id===selVehicle)?.label})`],
                    ["Requested", `${dateStr} at ${selTime}`],
                    ["Address", form.address],
                    ["Name", form.name],
                    ["Phone", form.phone],
                    ["Email", form.email],
                    ...(addons.length ? [["Add-ons", addons.join(", ")]] : []),
                    ...(promoResult?.valid ? [["Promo", `${promoResult.label} (-$${((discountCents)/100).toFixed(0)})`]] : []),
                    ["Estimated Total", totalEst],
                    ["Payment", "After appointment (card/cash/PayPal/Venmo)"],
                  ].map(([k,v]) => (
                    <div key={k} style={{ padding:"5px 0", borderBottom:`1px solid ${C.border}` }}>
                      <div style={{ fontSize:9, fontWeight:600, color:C.dim, letterSpacing:0.8, textTransform:"uppercase" as const }}>{k}</div>
                      <div style={{ fontSize:13, color:C.white, fontWeight:600, marginTop:1 }}>{v}</div>
                    </div>
                  ))}
                </div>

                {/* Waiver */}
                <label style={{ display:"flex", alignItems:"flex-start", gap:9, marginBottom:22, cursor:"pointer" }}>
                  <input type="checkbox" checked={waiverChecked} onChange={(e) => setWaiverChecked(e.target.checked)} style={{ marginTop:2, width:14, height:14, accentColor:C.blue }} />
                  <span style={{ fontSize:11, color:C.dim, lineHeight:1.6 }}>
                    I understand that my selected date and time is a <strong style={{color:C.amber}}>request only</strong> and not a guaranteed appointment. I agree to the service terms and understand that payment is collected after the appointment.
                  </span>
                </label>

                <div style={{ display:"flex", gap:8 }}>
                  <Btn onClick={() => setStep(3)} variant="ghost" size="md" style={{ flex:1 }}>Back</Btn>
                  <Btn onClick={handleConfirm} disabled={!waiverChecked || loading} variant="gold" size="md" style={{ flex:2 }}>
                    {loading ? "Submitting..." : "Submit Request"}
                  </Btn>
                </div>
              </Card>
            );
          })()}

          {/* STEP 5: Done */}
          {step===5 && (
            <Card style={{ padding:40, textAlign:"center" }}>
              <div style={{ width:48, height:48, borderRadius:"50%", background:C.green+"14", border:`1px solid ${C.green}30`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", color:C.green }}>
                <IconCheck />
              </div>
              <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:22, color:C.green, marginBottom:8 }}>Request Submitted</h3>
              <p style={{ color:C.muted, fontSize:14, lineHeight:1.7, maxWidth:400, margin:"0 auto 18px" }}>
                Your appointment request has been sent. We'll review availability and <strong style={{color:C.white}}>email you a confirmation or an alternative time</strong> as soon as possible.
              </p>
              <div style={{
                background: C.amber + "08",
                border: `1px solid ${C.amber}20`,
                borderRadius:5, padding:"12px 18px", marginBottom:22,
                display:"inline-block",
              }}>
                <p style={{ fontSize:11, color:C.amber, fontWeight:600, margin:"0 0 2px" }}>Remember</p>
                <p style={{ fontSize:11, color:C.dim, margin:0 }}>Your requested time is <strong style={{color:C.amber}}>not guaranteed</strong> until you receive a confirmation email from us.</p>
              </div>
              <div style={{ fontSize:12, color:C.dim, marginBottom:22 }}>
                <span style={{ fontWeight:600, color:C.muted }}>Ref:</span> {ref}
              </div>
              <p style={{ fontSize:12, color:C.dim, margin:0 }}>Questions? Call or text <strong style={{color:C.white}}>(415) 702-8468</strong></p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ── LOYALTY PAGE ─────────────────────────────────────────────────
function LoyaltyPage({ setPage }: { setPage: (p: string) => void }) {
  return (
    <div style={{ paddingTop:60, background:C.bg, minHeight:"100vh" }}>
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding:"48px 24px 64px" }}>
        <div style={{ maxWidth:960, margin:"0 auto" }}>
          <SectionTitle chip="Loyalty" title="BlueBay Rewards" sub="Earn points on every detail and unlock exclusive perks." />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
            {LOYALTY_TIERS.map(tier => (
              <Card key={tier.name} style={{ padding:22, textAlign:"center" }}>
                <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:18, color:C.white, margin:"0 0 3px" }}>{tier.name}</h3>
                <p style={{ color:C.dim, fontSize:11, margin:"0 0 16px" }}>{tier.min}+ points{tier.max ? ` (up to ${tier.max})` : ""}</p>
                <ul style={{ margin:0, padding:0, listStyle:"none", textAlign:"left", display:"flex", flexDirection:"column", gap:7 }}>
                  {tier.perks.map(p => (
                    <li key={p} style={{ display:"flex", gap:7, color:C.muted, fontSize:12 }}>
                      <span style={{ color:C.blue, display:"flex", marginTop:1 }}><IconCheck /></span>{p}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ADMIN DASHBOARD ───────────────────────────────────────────────
function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState("");
  const [tab, setTab] = useState<"bookings"|"promos"|"blocked">("bookings");
  const [bookings, setBookings] = useState<any[]>([]);
  const [promos, setPromos] = useState<any[]>([]);
  const [blocked, setBlocked] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // New promo form
  const [newPromo, setNewPromo] = useState({ code:"", label:"", discount:"", type:"fixed", maxUses:"", expiresAt:"" });

  // New blocked time form
  const [newBlocked, setNewBlocked] = useState({ dateIso:"", timeSlot:"", reason:"" });

  // Change time modal
  const [changeBooking, setChangeBooking] = useState<any>(null);
  const [changeDate, setChangeDate] = useState("");
  const [changeTime, setChangeTime] = useState("");

  const ADMIN_PIN = "1234";

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [bRes, pRes, blRes] = await Promise.all([
        fetch("/api/bookings"),
        fetch("/api/promo-codes"),
        fetch("/api/blocked-times"),
      ]);
      const bData = await bRes.json();
      const pData = await pRes.json();
      const blData = await blRes.json();
      setBookings(bData.bookings || []);
      setPromos(pData.codes || []);
      setBlocked(blData.blocked || []);
    } catch (err) {
      console.error("[Admin load error]", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authed) loadData();
  }, [authed, loadData]);

  if (!authed) {
    return (
      <div style={{ paddingTop:60, background:C.bg, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Card style={{ padding:36, maxWidth:340, width:"100%", textAlign:"center" }}>
          <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:18, color:C.white, marginBottom:18 }}>Admin Dashboard</h3>
          <Input label="Enter PIN" type="password" placeholder="----" value={pin} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPin(e.target.value)}
            style={{ textAlign:"center", fontSize:18, letterSpacing:8 }} />
          <Btn onClick={() => { if (pin === ADMIN_PIN) setAuthed(true); else alert("Wrong PIN"); }} variant="gold" size="md" style={{ width:"100%", marginTop:12 }}>Unlock</Btn>
        </Card>
      </div>
    );
  }

  const statusColor = (s: string) => {
    if (s === "pending") return C.amber;
    if (s === "confirmed") return C.green;
    if (s === "completed") return C.blue;
    if (s === "cancelled") return C.red;
    return C.dim;
  };

  const handleConfirmBooking = async (id: string) => {
    await fetch(`/api/bookings/${id}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "confirm" }),
    });
    loadData();
  };

  const handleChangeTime = async () => {
    if (!changeBooking || !changeDate || !changeTime) return;
    await fetch(`/api/bookings/${changeBooking.id}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "change", newDate: changeDate, newTime: changeTime }),
    });
    setChangeBooking(null);
    setChangeDate("");
    setChangeTime("");
    loadData();
  };

  const handleStatusChange = async (id: string, status: string) => {
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadData();
  };

  const handleCreatePromo = async () => {
    if (!newPromo.code || !newPromo.label || !newPromo.discount) return;
    await fetch("/api/promo-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: newPromo.code,
        label: newPromo.label,
        discount: newPromo.type === "percent" ? parseInt(newPromo.discount) : Math.round(parseFloat(newPromo.discount) * 100),
        type: newPromo.type,
        maxUses: newPromo.maxUses ? parseInt(newPromo.maxUses) : null,
        expiresAt: newPromo.expiresAt || null,
      }),
    });
    setNewPromo({ code:"", label:"", discount:"", type:"fixed", maxUses:"", expiresAt:"" });
    loadData();
  };

  const handleDeletePromo = async (id: string) => {
    await fetch(`/api/promo-codes/${id}`, { method: "DELETE" });
    loadData();
  };

  const handleCreateBlocked = async () => {
    if (!newBlocked.dateIso) return;
    await fetch("/api/blocked-times", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBlocked),
    });
    setNewBlocked({ dateIso:"", timeSlot:"", reason:"" });
    loadData();
  };

  const handleDeleteBlocked = async (id: string) => {
    await fetch(`/api/blocked-times/${id}`, { method: "DELETE" });
    loadData();
  };

  const pendingCount = bookings.filter(b => b.status === "pending").length;
  const confirmedCount = bookings.filter(b => b.status === "confirmed").length;
  const totalRevenue = bookings.filter(b => b.status !== "cancelled").reduce((s, b) => s + (b.finalCents || 0), 0) / 100;

  return (
    <div style={{ paddingTop:60, background:C.bg, minHeight:"100vh" }}>
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding:"36px 24px 64px" }}>
        <div style={{ maxWidth:1120, margin:"0 auto" }}>
          <SectionTitle chip="Admin" title="Dashboard" sub="Manage bookings, promo codes, and availability." />

          {/* Stats */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:32 }}>
            {[
              { label:"Pending", value:pendingCount, color:C.amber },
              { label:"Confirmed", value:confirmedCount, color:C.green },
              { label:"Total Bookings", value:bookings.length, color:C.blue },
              { label:"Revenue", value:`$${totalRevenue.toFixed(0)}`, color:C.gold },
            ].map(s => (
              <Card key={s.label} style={{ padding:18, textAlign:"center" }}>
                <div style={{ fontSize:24, fontWeight:700, color:s.color, fontFamily:"'Outfit',sans-serif" }}>{s.value}</div>
                <div style={{ fontSize:10, color:C.dim, fontWeight:600, letterSpacing:0.8, textTransform:"uppercase" as const, marginTop:3 }}>{s.label}</div>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display:"flex", gap:3, marginBottom:24 }}>
            {([["bookings","Bookings"],["promos","Promo Codes"],["blocked","Blocked Times"]] as const).map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} style={{
                padding:"9px 20px", borderRadius:4, cursor:"pointer",
                fontFamily:"'Outfit',sans-serif", fontWeight:600, fontSize:12,
                background: tab===id ? C.blue : "transparent",
                color: tab===id ? "#fff" : C.muted, border: tab===id ? "1px solid transparent" : `1px solid ${C.border}`,
                transition:"all 0.15s",
              }}>{label}</button>
            ))}
            <div style={{ flex:1 }} />
            <Btn onClick={loadData} variant="ghost" size="sm">Refresh</Btn>
          </div>

          {/* BOOKINGS TAB */}
          {tab==="bookings" && (
            <div>
              {bookings.length === 0 ? (
                <Card style={{ padding:36, textAlign:"center" }}>
                  <p style={{ color:C.dim, fontSize:14 }}>No bookings yet.</p>
                </Card>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {bookings.map((b) => (
                    <Card key={b.id} style={{ padding:14 }}>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr auto", gap:8, alignItems:"center" }}>
                        <div>
                          <div style={{ fontSize:9, color:C.dim, fontWeight:600, letterSpacing:0.8, textTransform:"uppercase" as const }}>Customer</div>
                          <div style={{ fontSize:12, color:C.white, fontWeight:600, marginTop:1 }}>{b.customerName}</div>
                          <div style={{ fontSize:10, color:C.dim }}>{b.customerEmail}</div>
                        </div>
                        <div>
                          <div style={{ fontSize:9, color:C.dim, fontWeight:600, letterSpacing:0.8, textTransform:"uppercase" as const }}>Service</div>
                          <div style={{ fontSize:12, color:C.white, fontWeight:600, marginTop:1 }}>{b.packageName}</div>
                          <div style={{ fontSize:10, color:C.dim }}>{b.vehicleDesc}</div>
                        </div>
                        <div>
                          <div style={{ fontSize:9, color:C.dim, fontWeight:600, letterSpacing:0.8, textTransform:"uppercase" as const }}>Requested</div>
                          <div style={{ fontSize:12, color:C.blueLt, fontWeight:600, marginTop:1 }}>
                            {new Date(b.dateIso + "T12:00:00").toLocaleDateString("en-US",{ month:"short", day:"numeric" })} at {b.timeSlot}
                          </div>
                          <div style={{ fontSize:10, color:C.dim }}>{b.address}</div>
                        </div>
                        <div>
                          <div style={{ fontSize:9, color:C.dim, fontWeight:600, letterSpacing:0.8, textTransform:"uppercase" as const }}>Total</div>
                          <div style={{ fontSize:14, color:C.white, fontWeight:700, marginTop:1 }}>${((b.finalCents||0)/100).toFixed(0)}</div>
                          {b.promoCode && <div style={{ fontSize:9, color:C.green, fontWeight:600 }}>Code: {b.promoCode}</div>}
                        </div>
                        <div style={{ display:"flex", flexDirection:"column", gap:3, alignItems:"flex-end" }}>
                          <Chip color={statusColor(b.status)}>{b.status.toUpperCase()}</Chip>
                          {b.status === "pending" && (
                            <div style={{ display:"flex", gap:3 }}>
                              <Btn onClick={() => handleConfirmBooking(b.id)} variant="success" size="xs">Confirm</Btn>
                              <Btn onClick={() => { setChangeBooking(b); setChangeDate(b.dateIso); setChangeTime(b.timeSlot); }} variant="gold" size="xs">Change</Btn>
                              <Btn onClick={() => handleStatusChange(b.id, "cancelled")} variant="danger" size="xs">Cancel</Btn>
                            </div>
                          )}
                          {b.status === "confirmed" && (
                            <div style={{ display:"flex", gap:3 }}>
                              <Btn onClick={() => handleStatusChange(b.id, "completed")} variant="primary" size="xs">Complete</Btn>
                              <Btn onClick={() => handleStatusChange(b.id, "cancelled")} variant="danger" size="xs">Cancel</Btn>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PROMO CODES TAB */}
          {tab==="promos" && (
            <div>
              {/* Create promo */}
              <Card style={{ padding:18, marginBottom:16 }}>
                <h4 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:14, color:C.white, marginBottom:12 }}>Create Promo Code</h4>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr auto", gap:8, alignItems:"end" }}>
                  <Input label="Code" placeholder="SAVE20" value={newPromo.code} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPromo({...newPromo, code:e.target.value.toUpperCase()})} />
                  <Input label="Label" placeholder="20% Off Summer" value={newPromo.label} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPromo({...newPromo, label:e.target.value})} />
                  <div>
                    <label style={{ fontSize:10, fontWeight:600, color:C.dim, letterSpacing:0.8, textTransform:"uppercase" as const, display:"block", marginBottom:5 }}>Discount</label>
                    <div style={{ display:"flex", gap:3 }}>
                      <select value={newPromo.type} onChange={(e) => setNewPromo({...newPromo, type:e.target.value})} style={{
                        padding:"9px 8px", borderRadius:4,
                        background:C.bg, border:`1px solid ${C.border}`,
                        color:C.white, fontSize:12, fontFamily:"'Outfit',sans-serif",
                        outline:"none",
                      }}>
                        <option value="fixed">$</option>
                        <option value="percent">%</option>
                      </select>
                      <input value={newPromo.discount} onChange={(e) => setNewPromo({...newPromo, discount:e.target.value})} placeholder="20" style={{
                        flex:1, padding:"9px 12px", borderRadius:4,
                        background:C.bg, border:`1px solid ${C.border}`,
                        color:C.white, fontSize:13, fontFamily:"'Outfit',sans-serif",
                        boxSizing:"border-box", outline:"none",
                      }} />
                    </div>
                  </div>
                  <Input label="Max Uses" placeholder="Unlimited" value={newPromo.maxUses} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPromo({...newPromo, maxUses:e.target.value})} />
                  <Btn onClick={handleCreatePromo} variant="success" size="md">Create</Btn>
                </div>
              </Card>

              {/* List promos */}
              {promos.length === 0 ? (
                <Card style={{ padding:36, textAlign:"center" }}>
                  <p style={{ color:C.dim, fontSize:14 }}>No promo codes yet.</p>
                </Card>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                  {promos.map(p => (
                    <Card key={p.id} style={{ padding:12 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div>
                          <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, color:C.green, fontSize:14, marginRight:8 }}>{p.code}</span>
                          <span style={{ color:C.dim, fontSize:11 }}>{p.label}</span>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <span style={{ color:C.white, fontWeight:600, fontSize:12 }}>
                            {p.type === "percent" ? `${p.discount}%` : `$${(p.discount/100).toFixed(0)}`}
                          </span>
                          <span style={{ color:C.dim, fontSize:10 }}>{p.usedCount}/{p.maxUses || "inf"} used</span>
                          {!p.active && <Chip color={C.red}>INACTIVE</Chip>}
                          <Btn onClick={() => handleDeletePromo(p.id)} variant="danger" size="xs">Delete</Btn>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* BLOCKED TIMES TAB */}
          {tab==="blocked" && (
            <div>
              {/* Create blocked time */}
              <Card style={{ padding:18, marginBottom:16 }}>
                <h4 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:14, color:C.white, marginBottom:12 }}>Block Off Time</h4>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr auto", gap:8, alignItems:"end" }}>
                  <Input label="Date" type="date" value={newBlocked.dateIso} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBlocked({...newBlocked, dateIso:e.target.value})} />
                  <div>
                    <label style={{ fontSize:10, fontWeight:600, color:C.dim, letterSpacing:0.8, textTransform:"uppercase" as const, display:"block", marginBottom:5 }}>Time Slot</label>
                    <select value={newBlocked.timeSlot} onChange={(e) => setNewBlocked({...newBlocked, timeSlot:e.target.value})} style={{
                      width:"100%", padding:"9px 12px", borderRadius:4,
                      background:C.bg, border:`1px solid ${C.border}`,
                      color:C.white, fontSize:13, fontFamily:"'Outfit',sans-serif",
                      boxSizing:"border-box", outline:"none",
                    }}>
                      <option value="">All Day</option>
                      {ALL_TIME_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <Input label="Reason" placeholder="Day off" value={newBlocked.reason} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBlocked({...newBlocked, reason:e.target.value})} />
                  <Btn onClick={handleCreateBlocked} variant="danger" size="md">Block</Btn>
                </div>
              </Card>

              {/* List blocked times */}
              {blocked.length === 0 ? (
                <Card style={{ padding:36, textAlign:"center" }}>
                  <p style={{ color:C.dim, fontSize:14 }}>No blocked times. All slots are available.</p>
                </Card>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                  {blocked.map(bl => (
                    <Card key={bl.id} style={{ padding:12 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div>
                          <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, color:C.white, fontSize:13, marginRight:8 }}>
                            {new Date(bl.dateIso + "T12:00:00").toLocaleDateString("en-US",{ weekday:"short", month:"short", day:"numeric" })}
                          </span>
                          <span style={{ color:bl.timeSlot ? C.amber : C.red, fontWeight:600, fontSize:11 }}>
                            {bl.timeSlot || "ALL DAY"}
                          </span>
                          {bl.reason && <span style={{ color:C.dim, fontSize:10, marginLeft:8 }}>/ {bl.reason}</span>}
                        </div>
                        <Btn onClick={() => handleDeleteBlocked(bl.id)} variant="danger" size="xs">Remove</Btn>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Change Time Modal */}
          {changeBooking && (
            <div style={{
              position:"fixed", top:0, left:0, right:0, bottom:0,
              background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"center", justifyContent:"center",
              zIndex:9999,
            }}>
              <Card style={{ padding:28, maxWidth:440, width:"90%" }}>
                <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:16, color:C.white, marginBottom:16 }}>
                  Change Time -- {changeBooking.customerName}
                </h3>
                <p style={{ color:C.dim, fontSize:11, marginBottom:16 }}>
                  Originally requested: {new Date(changeBooking.dateIso + "T12:00:00").toLocaleDateString("en-US",{ month:"short", day:"numeric" })} at {changeBooking.timeSlot}
                </p>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:18 }}>
                  <Input label="New Date" type="date" value={changeDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChangeDate(e.target.value)} />
                  <div>
                    <label style={{ fontSize:10, fontWeight:600, color:C.dim, letterSpacing:0.8, textTransform:"uppercase" as const, display:"block", marginBottom:5 }}>New Time</label>
                    <select value={changeTime} onChange={(e) => setChangeTime(e.target.value)} style={{
                      width:"100%", padding:"9px 12px", borderRadius:4,
                      background:C.bg, border:`1px solid ${C.border}`,
                      color:C.white, fontSize:13, fontFamily:"'Outfit',sans-serif",
                      boxSizing:"border-box", outline:"none",
                    }}>
                      <option value="">Select time</option>
                      {ALL_TIME_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <Btn onClick={() => setChangeBooking(null)} variant="ghost" size="md" style={{ flex:1 }}>Cancel</Btn>
                  <Btn onClick={handleChangeTime} disabled={!changeDate || !changeTime} variant="gold" size="md" style={{ flex:2 }}>Confirm New Time</Btn>
                </div>
              </Card>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ── CONTACT PAGE ─────────────────────────────────────────────────
function ContactPage() {
  const [form, setForm] = useState({ name:"", email:"", message:"" });
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    const html = `<h2>Contact Form from ${form.name}</h2><p><strong>Email:</strong> ${form.email}</p><p><strong>Message:</strong></p><p>${form.message}</p>`;
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toEmail: "alekseitcheng@icloud.com", toName: "BlueBay Team", subject: `Contact: ${form.name}`, html }),
    });
    setSent(true);
  };

  return (
    <div style={{ paddingTop:60, background:C.bg, minHeight:"100vh" }}>
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding:"48px 24px 64px" }}>
        <div style={{ maxWidth:580, margin:"0 auto" }}>
          <SectionTitle chip="Contact" title="Get in Touch" sub="Questions? Reach out anytime." />
          <Card style={{ padding:28 }}>
            {sent ? (
              <div style={{ textAlign:"center", padding:18 }}>
                <div style={{ width:42, height:42, borderRadius:"50%", background:C.green+"14", border:`1px solid ${C.green}30`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px", color:C.green }}>
                  <IconCheck />
                </div>
                <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, color:C.green, fontSize:16 }}>Message Sent</h3>
                <p style={{ color:C.dim, fontSize:13 }}>We'll get back to you soon.</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <Input label="Name" value={form.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, name:e.target.value})} />
                <Input label="Email" type="email" value={form.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, email:e.target.value})} />
                <Textarea label="Message" value={form.message} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({...form, message:e.target.value})} />
                <Btn onClick={handleSubmit} variant="gold" size="md" style={{ width:"100%" }}>Send Message</Btn>
                <div style={{ textAlign:"center", marginTop:5 }}>
                  <p style={{ color:C.dim, fontSize:11, margin:"0 0 3px" }}>Or call/text us directly:</p>
                  <a href="tel:+14157028468" style={{ color:C.blueLt, fontWeight:700, fontSize:16, fontFamily:"'Outfit',sans-serif" }}>(415) 702-8468</a>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── FOOTER ───────────────────────────────────────────────────────
function Footer({ setPage }: { setPage: (p: string) => void }) {
  return (
    <div style={{ background: C.card, borderTop:`1px solid ${C.border}`, padding:"44px 24px 24px" }}>
      <div style={{ maxWidth:1120, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:36 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <img src="/logo.png" alt="BlueBay" style={{ width:28, height:28, borderRadius:5 }} />
            <div>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:13, color:C.white }}>BLUEBAY</div>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:400, fontSize:7, color:C.dim, letterSpacing:2 }}>AUTO CARE</div>
            </div>
          </div>
          <p style={{ color:C.dim, fontSize:11, lineHeight:1.7 }}>Professional mobile auto detailing serving San Francisco. Eco-friendly products, premium tools, at your doorstep.</p>
        </div>
        <div>
          <h4 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, color:C.white, fontSize:12, marginBottom:12, letterSpacing:0.5, textTransform:"uppercase" as const }}>Quick Links</h4>
          {[...["Home","Services","Booking","Loyalty","Contact"], "Admin"].map(l => (
            <button key={l} onClick={() => { setPage(l); window.scrollTo(0,0); }} style={{ display:"block", background:"none", border:"none", cursor:"pointer", color: l === "Admin" ? C.subtle : C.dim, fontSize:l === "Admin" ? 10 : 12, fontFamily:"'Outfit',sans-serif", fontWeight:400, padding:"2px 0", transition:"color 0.15s" }}>{l}</button>
          ))}
        </div>
        <div>
          <h4 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, color:C.white, fontSize:12, marginBottom:12, letterSpacing:0.5, textTransform:"uppercase" as const }}>Contact</h4>
          <a href="tel:+14157028468" style={{ display:"block", color:C.blueLt, fontSize:14, fontWeight:700, fontFamily:"'Outfit',sans-serif", marginBottom:5 }}>(415) 702-8468</a>
          <span style={{ color:C.dim, fontSize:11 }}>San Francisco, CA</span>
        </div>
      </div>
      <div style={{ maxWidth:1120, margin:"24px auto 0", paddingTop:14, borderTop:`1px solid ${C.border}`, textAlign:"center", fontSize:10, color:C.dim }}>
        &copy; {new Date().getFullYear()} BlueBay Auto Care. All rights reserved.
      </div>
    </div>
  );
}

// ── APP ROOT ─────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("Home");
  const go = (p: string) => { setPage(p); window.scrollTo(0,0); };

  // Check for admin/change URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("change") || params.get("admin")) {
      setPage("Admin");
    }
  }, []);

  return (
    <div>
      <Navbar page={page} setPage={go} />
      {page === "Home"     && <HomePage    setPage={go} />}
      {page === "Services" && <ServicesPage setPage={go} />}
      {page === "Booking"  && <BookingPage />}
      {page === "Loyalty"  && <LoyaltyPage  setPage={go} />}
      {page === "Admin"    && <AdminPage />}
      {page === "Contact"  && <ContactPage />}
      {page !== "Home" && <Footer setPage={go} />}
    </div>
  );
}
