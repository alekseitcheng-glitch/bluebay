'use client';

import { useState, useEffect, useRef, useCallback } from "react";
import { Reveal, StaggerGroup, StaggerItem, Counter, TiltCard, ScrollProgress, Parallax } from "@/lib/motion";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { EASE } from "@/lib/motion";

/* ─────────────────────────────────────────────────────────────
   BLUEBAY AUTO CARE — Mobile Detailing SF
   Full-scale React SPA: Home · Services · Booking · Loyalty · Admin · Contact
   Email via Resend SMTP · Postgres (Neon) via Prisma
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
  // ── premium depth + glow (new) ──
  shadow:    "var(--shadow-card)",
  shadowLift:"var(--shadow-lift)",
  glowBlue:  "var(--glow-blue)",
  glowGold:  "var(--glow-gold)",
  display:   "var(--font-display)",
  radiusLg:  14,
  radiusXl:  20,
  glassBg:   "linear-gradient(180deg, rgba(20,24,32,0.72), rgba(15,18,25,0.72))",
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

function CarSilhouette({ style }: { style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 1024 384" style={{ width: "100%", height: "100%", ...style }} preserveAspectRatio="xMidYMid meet">
      <path
        d="M239.5,229.5c0,27.6-22.4,50-50,50s-50-22.4-50-50s22.4-50,50-50S239.5,201.9,239.5,229.5z M834.5,229.5
        c0,27.6-22.4,50-50,50s-50-22.4-50-50s22.4-50,50-50S834.5,201.9,834.5,229.5z M961.5,190.5v19h-52.6
        c-10.4-33.8-41.9-58.5-79.4-58.5s-69,24.7-79.4,58.5H273.9c-10.4-33.8-41.9-58.5-79.4-58.5c-37.5,0-69,24.7-79.4,58.5H62.5v-27
        c0-11,9-20,20-20h64.7l46.2-74h538.7l54.8,74h154.6C952.5,162.5,961.5,171.5,961.5,190.5z M320.5,115.5l-33.7,54h450.4l-40-54
        H320.5z"
        fill="currentColor"
        opacity={0.03}
      />
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
    sm: { padding: "8px 16px", fontSize: 11 },
    md: { padding: "11px 24px", fontSize: 13 },
    lg: { padding: "15px 32px", fontSize: 14 },
  };
  const variants: Record<string, React.CSSProperties> = {
    primary:   { background: `linear-gradient(180deg, ${C.blueLt}, ${C.blue})`, color: "#fff", border: "none", boxShadow: "0 10px 28px -12px rgba(74,138,244,0.7)" },
    gold:      { background: `linear-gradient(180deg, ${C.goldLt}, ${C.gold})`, color: "#090C14", border: "none", boxShadow: "0 10px 30px -12px rgba(201,168,76,0.65)" },
    outline:   { background: "rgba(232,236,242,0.02)", color: C.white, border: `1px solid ${C.border2}`, backdropFilter: "blur(6px)" },
    ghost:     { background: "transparent", color: C.muted, border: `1px solid ${C.border}` },
    danger:    { background: C.red + "18", color: C.red, border: `1px solid ${C.red}35` },
    success:   { background: C.green + "18", color: C.green, border: `1px solid ${C.green}35` },
  };
  const base: React.CSSProperties = {
    cursor: disabled ? "not-allowed" : "pointer",
    borderRadius: 999,
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 600, letterSpacing: 0.2,
    textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center",
    transition: "transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s ease, background 0.25s ease",
    opacity: disabled ? 0.35 : 1,
    transform: disabled ? "none" : undefined,
    ...sizes[size], ...variants[variant], ...sx,
  };
  // Hover lift via onMouseEnter/Leave (inline styles can't target :hover).
  const hoverOn = () => { if (!disabled) document.body.style.cursor = "pointer"; };
  const hoverOff = () => { document.body.style.cursor = "default"; };
  if (href) return <a href={href} style={base} onMouseEnter={hoverOn} onMouseLeave={hoverOff} className="bb-btn-lift">{children}</a>;
  return <button type={type} onClick={disabled ? undefined : onClick} style={base} onMouseEnter={hoverOn} onMouseLeave={hoverOff} className="bb-btn-lift">{children}</button>;
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

function Card({ children, style: sx = {}, glass = false }: { children: React.ReactNode; style?: React.CSSProperties; glass?: boolean }) {
  return (
    <div style={{
      background: glass ? C.glassBg : C.card,
      border: `1px solid ${glass ? "rgba(255,255,255,0.06)" : C.border}`,
      borderRadius: C.radiusLg,
      boxShadow: C.shadow,
      position: "relative",
      ...sx
    }}>{children}</div>
  );
}

function SectionTitle({ chip, title, sub, light = true, center = true, display = true }: { chip?: string; title: string; sub?: string; light?: boolean; center?: boolean; display?: boolean }) {
  return (
    <div style={{ textAlign: center ? "center" : "left", marginBottom: 48 }}>
      {chip && <div style={{ marginBottom: 12 }}><Chip>{chip}</Chip></div>}
      <h2 style={{
        fontFamily: display ? C.display : "'Outfit',sans-serif", fontWeight: 600,
        fontSize: "clamp(28px,4vw,46px)", lineHeight: 1.1,
        color: light ? C.white : C.bg, margin: "0 0 14px", letterSpacing: -0.5,
        whiteSpace: "pre-line",
      }}>{title}</h2>
      <div style={{ width: center ? 56 : 40, height: 3, borderRadius: 2, background: `linear-gradient(90deg, ${C.gold}, ${C.blue})`, margin: center ? "0 auto 16px" : "0 0 16px" }} />
      {sub && <p style={{ color: light ? C.muted : C.dim, fontSize: 15, lineHeight: 1.7, maxWidth: 520, margin: center ? "0 auto" : undefined }}>{sub}</p>}
    </div>
  );
}

function FeatureIcon({ children, color }: { children: React.ReactNode; color?: string }) {
  const c = color || C.blue;
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 10,
      background: `linear-gradient(180deg, ${c}26, ${c}0D)`, border: `1px solid ${c}30`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: c, flexShrink: 0,
      boxShadow: `0 8px 20px -10px ${c}66`,
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

  const links = ["Home","Services","Booking","GiftCards","Loyalty","Contact"];
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? "rgba(9,12,20,0.72)" : "transparent",
      borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent",
      backdropFilter: scrolled ? "blur(16px) saturate(140%)" : "none",
      transition: "background 0.3s ease, border-color 0.3s ease",
    }}>
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <motion.div
          initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: EASE }}
          onClick={() => setPage("Home")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
        >
          <img src="/logo.png" alt="BlueBay Auto Care" style={{ width: 34, height: 34, borderRadius: 8, filter: "drop-shadow(0 4px 12px rgba(74,138,244,0.35))" }} />
          <div>
            <div style={{ fontFamily: C.display, fontWeight: 700, fontSize: 17, color: C.white, lineHeight: 1, letterSpacing: 0 }}>BlueBay</div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 500, fontSize: 8, color: C.dim, letterSpacing: 3, textTransform: "uppercase" as const }}>AUTO CARE</div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
          style={{ display: "flex", alignItems: "center", gap: 2 }}
        >
          {links.map(l => {
            const active = page === l;
            const label = l === "GiftCards" ? "Gift Cards" : l;
            return (
              <button key={l} onClick={() => setPage(l)} style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "'Outfit',sans-serif", fontWeight: active ? 600 : 400,
                fontSize: 13, letterSpacing: 0.1,
                color: active ? C.white : C.muted,
                padding: "8px 14px", borderRadius: 8,
                position: "relative",
                transition: "color 0.2s ease",
              }} className="bb-navlink">
                {label}
                {active && (
                  <motion.div layoutId="nav-underline" style={{ position: "absolute", bottom: 2, left: "25%", right: "25%", height: 2, borderRadius: 2, background: `linear-gradient(90deg, ${C.gold}, ${C.blueLt})` }} />
                )}
              </button>
            );
          })}
          <Btn href="tel:+14157028468" variant="gold" size="sm" style={{ marginLeft: 14 }}>
            (415) 702-8468
          </Btn>
        </motion.div>
      </div>
    </nav>
  );
}

// ── HOME PAGE ────────────────────────────────────────────────────
function HomePage({ setPage }: { setPage: (p: string) => void }) {
  const { scrollY } = useScroll();
  const carX = useTransform(scrollY, [0, 1000], [0, 300]);

  return (
    <div>
      {/* HERO */}
      <div className="bb-grain" style={{
        minHeight: "100vh", position: "relative", overflow: "hidden",
        background: `radial-gradient(1100px 600px at 78% 12%, rgba(74,138,244,0.16), transparent 60%), radial-gradient(900px 500px at 12% 80%, rgba(201,168,76,0.10), transparent 55%), ${C.bg}`,
        display: "flex", alignItems: "center",
      }}>
        {/* Floating decorative orbs (parallax) */}
        <Parallax speed={0.25}>
          <div className="bb-float" style={{ position: "absolute", top: "16%", right: "8%", width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(74,138,244,0.22), transparent 70%)", filter: "blur(20px)" }} />
        </Parallax>
        <Parallax speed={0.4}>
          <div className="bb-float" style={{ position: "absolute", bottom: "12%", left: "6%", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.14), transparent 70%)", filter: "blur(28px)", animationDelay: "-3s" }} />
        </Parallax>

        {/* Animated Background Car Silhouette */}
        <motion.div style={{ position: "absolute", bottom: "5%", left: "-10%", width: "80%", maxWidth: 800, color: C.white, zIndex: 0, x: carX, opacity: 0.8, pointerEvents: "none" }}>
          <CarSilhouette />
        </motion.div>

        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "120px 24px 80px", position: "relative", zIndex: 1, width: "100%" }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
            <Chip color={C.blue} style={{ marginBottom: 24 }}>San Francisco · Mobile Detailing</Chip>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.08 }}
            style={{
              fontFamily: C.display, fontWeight: 600,
              fontSize: "clamp(42px,7vw,84px)", color: C.white,
              lineHeight: 1.02, margin: "0 0 24px", letterSpacing: -1.5, maxWidth: 820,
            }}
          >
            Detailing that meets you{" "}
            <span style={{ fontStyle: "italic", fontWeight: 500 }} className="bb-gradient-text">where you park.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
            style={{ color: C.muted, fontSize: 18, lineHeight: 1.65, marginBottom: 36, maxWidth: 540 }}
          >
            Premium hand detailing brought to your home, office, or curbside across San Francisco. Eco-friendly products, zero water waste, and results you can see in the reflection.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.32 }}
            style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 56 }}
          >
            <Btn onClick={() => setPage("Booking")} variant="gold" size="lg">Book your detail</Btn>
            <Btn href="tel:+14157028468" variant="outline" size="lg">(415) 702-8468</Btn>
          </motion.div>

          {/* Animated stats row */}
          <StaggerGroup stagger={0.12} style={{ display: "flex", gap: 0, flexWrap: "wrap" }}>
            {[
              { stat: <Counter to={4.9} decimals={1} suffix="★" />, label: "Average rating" },
              { stat: <Counter to={100} suffix="%" />, label: "Mobile service" },
              { stat: <Counter to={0} suffix="gal" />, label: "Water wasted" },
            ].map(({ stat, label }, i) => (
              <StaggerItem key={label} style={{ flex: "1 1 140px", minWidth: 140, padding: "20px 0", borderTop: `1px solid ${C.border}`, borderRight: i < 2 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ fontFamily: C.display, fontWeight: 600, fontSize: "clamp(26px,3.5vw,40px)", color: C.white, lineHeight: 1, marginBottom: 6, letterSpacing: -0.5 }}>{stat}</div>
                <div style={{ color: C.dim, fontSize: 12, letterSpacing: 0.3, textTransform: "uppercase" as const }}>{label}</div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </div>

      {/* TRUST BAR */}
      <div style={{ background: C.card, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "18px 24px" }}>
        <Reveal style={{ maxWidth: 1140, margin: "0 auto", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 10 }}>
          {["Mobile Service", "Eco-Friendly Products", "Card · Cash · PayPal · Venmo", "Satisfaction Guaranteed", "All of San Francisco"].map(t => (
            <span key={t} style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 500, fontSize: 12, color: C.dim, letterSpacing: 0.4 }}>{t}</span>
          ))}
        </Reveal>
      </div>

      {/* PACKAGES SECTION */}
      <div style={{ background: C.bg, padding: "96px 24px" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <Reveal>
            <SectionTitle chip="Packages" title={"Three tiers of shine"} sub="From a refresh to a full transformation — pick the level of care your car deserves." />
          </Reveal>
          <StaggerGroup stagger={0.12} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
            {PACKAGES.map(pkg => (
              <StaggerItem key={pkg.id}>
                <TiltCard style={{ height: "100%" }} max={5}>
                  <Card style={{
                    padding: 0, overflow: "hidden", position: "relative", height: "100%",
                    border: pkg.id === "gold" ? `1px solid ${pkg.accent}50` : `1px solid ${C.border}`,
                    boxShadow: pkg.id === "gold" ? C.glowGold : C.shadow,
                  }} glass={false}>
                    {pkg.badge && (
                      <div style={{
                        position: "absolute", top: 16, right: 16,
                        background: pkg.accent + "22", color: pkg.accent,
                        fontWeight: 700, fontSize: 9, letterSpacing: 1,
                        padding: "5px 12px", borderRadius: 999, textTransform: "uppercase" as const,
                        border: `1px solid ${pkg.accent}40`,
                      }}>{pkg.badge}</div>
                    )}
                    <div style={{ padding: "28px 26px 0", borderBottom: `1px solid ${C.border}` }}>
                      <div style={{ fontFamily: C.display, fontWeight: 600, fontSize: 26, color: pkg.accent, letterSpacing: -0.5 }}>{pkg.tier}</div>
                      <div style={{ color: C.dim, fontSize: 13, marginBottom: 18 }}>{pkg.sub}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
                        {VEHICLE_TYPES.map(v => (
                          <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ color: C.muted, fontSize: 13 }}>{v.label}</span>
                            <span style={{ fontWeight: 700, color: C.white, fontSize: 15, fontFamily: C.display }}>${pkg.prices[v.id]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ padding: "20px 26px 26px" }}>
                      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 9 }}>
                        {pkg.features.map(f => (
                          <li key={f} style={{ display: "flex", gap: 9, alignItems: "flex-start", color: C.muted, fontSize: 13, lineHeight: 1.45 }}>
                            <span style={{ color: pkg.accent, flexShrink: 0, marginTop: 2, display: "flex" }}><IconCheck /></span>{f}
                          </li>
                        ))}
                      </ul>
                      <Btn onClick={() => setPage("Booking")} variant={pkg.id === "gold" ? "gold" : "outline"} size="md" style={{ width: "100%", marginTop: 22 }}>Book {pkg.tier}</Btn>
                    </div>
                  </Card>
                </TiltCard>
              </StaggerItem>
            ))}
          </StaggerGroup>

          {/* Add-ons */}
          <Reveal delay={0.1} style={{ marginTop: 40 }}>
            <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: 18, color: C.white, textAlign: "center", marginBottom: 18 }}>Add-on services</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
              {ADDONS.map(a => (
                <Card key={a.name} style={{ padding: "11px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600, color: C.white, fontSize: 13 }}>{a.name}</div>
                    <div style={{ color: C.gold, fontSize: 11, fontWeight: 600, marginTop: 1 }}>{a.price}</div>
                  </div>
                </Card>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {/* WHY CHOOSE SECTION */}
      <div style={{ background: C.card, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "96px 24px", position: "relative", overflow: "hidden" }}>
        <Parallax speed={0.3}>
          <div style={{ position: "absolute", top: "-10%", right: "-5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(74,138,244,0.08), transparent 70%)", filter: "blur(40px)" }} />
        </Parallax>
        <div style={{ margin: "0 auto", display: "grid", maxWidth: 700, gap: 64, alignItems: "center", position: "relative", zIndex: 1 }}>
          <div>
            <Reveal>
              <SectionTitle chip="Why BlueBay" title={"The detail your car\nremembers."} sub="We bring a full detailing studio to your block — no driving, no waiting rooms, no water running down the gutter." center={false} />
            </Reveal>
            <Reveal delay={0.1} style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
              {["Premium Products", "Mobile Service", "Eco-Friendly", "Pay After Service"].map(t => (
                <Chip key={t} color={C.blue}>{t}</Chip>
              ))}
            </Reveal>
            <StaggerGroup stagger={0.1} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              {[
                { icon: <IconShield />, t: "Trained, insured detailers", d: "Every vehicle is handled by someone who treats it like their own. Careful, thorough, on time." },
                { icon: <IconLeaf />, t: "Waterless & eco-friendly", d: "Our products lift grime without a hose. Better for your paint, better for the Bay." },
                { icon: <IconClock />, t: "Built around your day", d: "Home, office, or curbside — book a window that fits your schedule, not ours." },
                { icon: <IconStar filled />, t: "Results, guaranteed", d: "If it's not right, we'll make it right. Your satisfaction is the whole point." },
              ].map(({ icon, t, d }) => (
                <StaggerItem key={t}>
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <FeatureIcon>{icon}</FeatureIcon>
                    <div>
                      <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 600, color: C.white, fontSize: 14, marginBottom: 3 }}>{t}</div>
                      <div style={{ color: C.muted, fontSize: 13, lineHeight: 1.6 }}>{d}</div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </div>
      </div>

      {/* CTA BANNER */}
      <div className="bb-grain" style={{
        position: "relative", overflow: "hidden",
        background: `radial-gradient(800px 300px at 50% 120%, rgba(201,168,76,0.18), transparent 60%), ${C.bg}`,
        borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "80px 24px", textAlign: "center",
      }}>
        <Parallax speed={0.2}>
          <div style={{ position: "absolute", top: "-30%", left: "20%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(74,138,244,0.10), transparent 70%)", filter: "blur(30px)" }} />
        </Parallax>
        <div style={{ maxWidth: 640, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <Reveal>
            <h2 style={{ fontFamily: C.display, fontWeight: 600, fontSize: "clamp(30px,5vw,52px)", color: C.white, margin: "0 0 14px", letterSpacing: -0.8, lineHeight: 1.08 }}>
              Your car, <span style={{ fontStyle: "italic" }} className="bb-gradient-text">like the day you bought it.</span>
            </h2>
            <p style={{ color: C.muted, fontSize: 15, marginBottom: 32, lineHeight: 1.7 }}>Request a time and we'll confirm within the day. You pay after the job is done — card, cash, PayPal, or Venmo.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Btn onClick={() => setPage("Booking")} variant="gold" size="lg">Request appointment</Btn>
              <Btn href="tel:+14157028468" variant="outline" size="lg">Call us</Btn>
            </div>
          </Reveal>
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
    <div style={{ paddingTop:64, background:C.bg, minHeight:"100vh" }}>
      <div style={{ padding:"72px 24px 80px" }}>
        <div style={{ maxWidth:1140, margin:"0 auto" }}>
          <Reveal>
            <SectionTitle chip="Our Services" title={"The right care\nfor your ride."} sub="Pick a tier, pick your vehicle — see your price instantly." />
          </Reveal>
          <Reveal delay={0.1} style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:40 }}>
            {VEHICLE_TYPES.map(v => (
              <button key={v.id} onClick={() => setVehicleType(v.id)} style={{
                padding:"10px 22px", borderRadius:999, cursor:"pointer",
                fontFamily:"'Outfit',sans-serif", fontWeight:600, fontSize:13,
                background: vehicleType === v.id ? `linear-gradient(180deg, ${C.blueLt}, ${C.blue})` : "transparent",
                color: vehicleType === v.id ? "#fff" : C.muted, border: vehicleType === v.id ? "none" : `1px solid ${C.border}`,
                boxShadow: vehicleType === v.id ? "0 8px 24px -10px rgba(74,138,244,0.5)" : "none",
                transition:"all 0.3s cubic-bezier(0.22,1,0.36,1)",
              }}>{v.label}</button>
            ))}
          </Reveal>
          <StaggerGroup stagger={0.1} style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px,1fr))", gap:20, marginBottom:56 }}>
            {PACKAGES.map(pkg => (
              <StaggerItem key={pkg.id}>
                <Card style={{
                  padding:0, overflow:"hidden", cursor:"pointer",
                  border: selectedPkg === pkg.id ? `1px solid ${pkg.accent}60` : `1px solid ${C.border}`,
                  boxShadow: selectedPkg === pkg.id ? `0 0 0 1px ${pkg.accent}18, 0 20px 48px -18px ${pkg.accent}44` : C.shadow,
                  transition:"box-shadow 0.3s ease, border-color 0.3s ease",
                }}
                onClick={() => setSelectedPkg(pkg.id)}>
                  <div style={{ padding:"24px 24px 16px", background: selectedPkg === pkg.id ? pkg.accent + "0A" : "transparent" }}>
                    {pkg.badge && <Chip color={pkg.accent} style={{ marginBottom:8, fontSize:8 }}>{pkg.badge}</Chip>}
                    <div style={{ fontFamily:C.display, fontWeight:600, fontSize:24, color:pkg.accent, letterSpacing:-0.3 }}>{pkg.tier}</div>
                    <div style={{ color:C.dim, fontSize:13, marginBottom:14 }}>{pkg.sub}</div>
                    <div style={{ fontFamily:C.display, fontWeight:600, fontSize:38, color:C.white, lineHeight:1, letterSpacing:-1 }}>
                      ${pkg.prices[vehicleType as keyof typeof pkg.prices]}
                      <span style={{ fontSize:14, color:C.dim, fontWeight:400, fontFamily:"'Outfit',sans-serif", letterSpacing:0 }}> / visit</span>
                    </div>
                  </div>
                  <div style={{ padding:"16px 24px 24px", borderTop:`1px solid ${C.border}` }}>
                    <ul style={{ margin:0, padding:0, listStyle:"none", display:"flex", flexDirection:"column", gap:8 }}>
                      {pkg.features.map(f => (
                        <li key={f} style={{ display:"flex", gap:9, color:C.muted, fontSize:13, lineHeight:1.45 }}>
                          <span style={{ color:pkg.accent, display:"flex", marginTop:1 }}><IconCheck /></span>{f}
                        </li>
                      ))}
                    </ul>
                    <Btn onClick={() => setPage("Booking")} variant={selectedPkg===pkg.id ? (pkg.id==="gold"?"gold":"primary") : "outline"} size="md" style={{ width:"100%", marginTop:20 }}>
                      Book {pkg.tier}
                    </Btn>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </StaggerGroup>
          <Reveal>
            <SectionTitle chip="Add-Ons" title="Make it yours." sub="Add any of these to your package at checkout." />
          </Reveal>
          <Reveal delay={0.08} style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px,1fr))", gap:12 }}>
            {ADDONS.map(a => (
              <Card key={a.name} style={{ padding:"16px 20px", display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, color:C.white, fontSize:13 }}>{a.name}</div>
                  <div style={{ color:C.gold, fontWeight:600, fontSize:12, marginTop:2 }}>{a.price}</div>
                </div>
                <Btn onClick={() => setPage("Booking")} variant="ghost" size="sm">Add</Btn>
              </Card>
            ))}
          </Reveal>
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
  const [giftCardInput, setGiftCardInput] = useState("");
  const [giftCardResult, setGiftCardResult] = useState<{ valid: boolean; balanceCents?: number; error?: string } | null>(null);
  const [giftCardLoading, setGiftCardLoading] = useState(false);

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
  const giftCardCents = giftCardResult?.valid ? Math.min(giftCardResult.balanceCents || 0, Math.max(0, subtotalCents - discountCents)) : 0;
  const totalCents = Math.max(0, subtotalCents - discountCents - giftCardCents);
  const totalEst = basePrice ? `${(totalCents / 100).toFixed(0)}` : "--";

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

  // Validate gift card code (check balance, no redemption yet)
  const handleGiftCardApply = async () => {
    if (!giftCardInput.trim()) return;
    setGiftCardLoading(true);
    try {
      const res = await fetch("/api/gift-cards/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: giftCardInput }),
      });
      const data = await res.json();
      setGiftCardResult(data);
    } catch {
      setGiftCardResult({ valid: false, error: "Failed to validate gift card" });
    }
    setGiftCardLoading(false);
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

      // Redeem gift card after booking is saved
      if (giftCardResult?.valid && giftCardCents > 0) {
        try {
          await fetch("/api/gift-cards/validate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: giftCardInput, redeemCents: giftCardCents }),
          });
        } catch (err) {
          console.error("[Gift card redeem error]", err);
        }
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
              ${giftCardResult?.valid && giftCardCents > 0 ? `<tr><td style="padding:7px 0; border-bottom:1px solid #1C2029; color:#5A6374; font-size:11px;">Gift Card</td><td style="padding:7px 0; border-bottom:1px solid #1C2029; color:#DDBE66;">-${((giftCardCents)/100).toFixed(0)} (${giftCardInput})</td></tr>` : ""}
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
              ${giftCardResult?.valid && giftCardCents > 0 ? `<tr><td style="padding:5px 0; color:#5A6374; font-size:11px;">Gift Card</td><td style="padding:5px 0; color:#DDBE66;">-${((giftCardCents)/100).toFixed(0)} (${giftCardInput})</td></tr>` : ""}
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

              {/* Gift Card */}
              <div style={{
                background: C.gold + "06",
                border: `1px solid ${C.gold}20`,
                borderRadius:5, padding:14, marginBottom:22,
              }}>
                <h4 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:600, fontSize:10, color:C.gold, margin:"0 0 8px", letterSpacing:0.8, textTransform:"uppercase" as const }}>Gift Card</h4>
                <div style={{ display:"flex", gap:6 }}>
                  <input value={giftCardInput} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setGiftCardInput(e.target.value.toUpperCase()); setGiftCardResult(null); }} placeholder="BB-XXXX-XXXX" style={{
                    flex:1, padding:"9px 12px", borderRadius:4,
                    background:C.bg, border:`1px solid ${C.border}`,
                    color:C.white, fontSize:13, fontFamily:"'Outfit',sans-serif",
                    boxSizing:"border-box", outline:"none", textTransform:"uppercase" as const,
                  }} />
                  <Btn onClick={handleGiftCardApply} disabled={!giftCardInput.trim() || giftCardLoading} variant="gold" size="md">
                    {giftCardLoading ? "..." : "Check"}
                  </Btn>
                </div>
                {giftCardResult && giftCardResult.valid && (
                  <div style={{ marginTop:7, color:C.gold, fontSize:11, fontWeight:600, display:"flex", alignItems:"center", gap:4 }}>
                    <span style={{ display:"flex" }}><IconCheck /></span> Balance: ${((giftCardResult.balanceCents||0)/100).toFixed(0)} — will apply ${(giftCardCents/100).toFixed(0)} to this booking
                  </div>
                )}
                {giftCardResult && !giftCardResult.valid && (
                  <div style={{ marginTop:7, color:C.red, fontSize:11, fontWeight:600 }}>
                    {giftCardResult.error || "Invalid gift card"}
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
                    ...(promoResult?.valid ? [["Promo", `${promoResult.label} (-${((discountCents)/100).toFixed(0)})`]] : []),
                    ...(giftCardResult?.valid && giftCardCents > 0 ? [["Gift Card", `-${(giftCardCents/100).toFixed(0)} (${giftCardInput})`]] : []),
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

// ── GIFT CARDS PAGE ──────────────────────────────────────────────
function GiftCardPage({ setPage }: { setPage: (p: string) => void }) {
  const [amount, setAmount] = useState(50);
  const [purchaserName, setPurchaserName] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [purchased, setPurchased] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const presets = [25, 50, 100, 150, 200, 250];

  const handlePurchase = async () => {
    if (amount < 5) return;
    setLoading(true);
    try {
      const res = await fetch("/api/gift-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountCents: amount * 100, purchaserName, recipientName, recipientEmail, message }),
      });
      const data = await res.json();
      if (data.ok) {
        setPurchased(data.card);
        if (recipientEmail) {
          const html = `
            <div style="font-family:'Outfit',sans-serif; max-width:480px; margin:0 auto; background:#11151E; padding:32px; border-radius:12px; border:1px solid #1C2029;">
              <h2 style="color:#D4A24E; font-weight:700; font-size:22px;">Your BlueBay Gift Card</h2>
              <p style="color:#8B92A0; font-size:14px;">Hi ${recipientName || "there"},</p>
              <p style="color:#8B92A0; font-size:14px;">${purchaserName ? purchaserName : "Someone"} has sent you a <strong style="color:#fff">${amount}</strong> gift card for BlueBay Auto Care.</p>
              <div style="background:#0B0E14; border:1px solid #D4A24E30; border-radius:8px; padding:20px; text-align:center; margin:20px 0;">
                <div style="color:#D4A24E; font-size:11px; font-weight:600; letter-spacing:1px; text-transform:uppercase; margin-bottom:6px;">Your Code</div>
                <div style="color:#fff; font-size:24px; font-weight:700; letter-spacing:3px; font-family:monospace;">${data.card.code}</div>
                <div style="color:#8B92A0; font-size:12px; margin-top:8px;">Value: ${amount}</div>
              </div>
              ${message ? `<p style="color:#8B92A0; font-size:13px; font-style:italic; border-left:3px solid #D4A24E30; padding-left:12px;">"${message}"</p>` : ""}
              <p style="color:#8B92A0; font-size:13px; margin-top:20px;">Use this code at checkout when booking your next detail.</p>
              <a href="https://bluebayautocare.com" style="display:inline-block; background:#D4A24E; color:#0B0E14; font-weight:700; font-size:14px; padding:12px 28px; border-radius:6px; text-decoration:none; margin-top:16px;">Book Now</a>
            </div>`;
          await fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ toEmail: recipientEmail, toName: recipientName || "Valued Customer", subject: `Your BlueBay Gift Card - ${amount}`, html }),
          });
        }
      }
    } catch (err) {
      console.error("[Gift card purchase error]", err);
    }
    setLoading(false);
  };

  if (purchased) {
    return (
      <div style={{ paddingTop:64, background:C.bg, minHeight:"100vh" }}>
        <div style={{ padding:"72px 24px 80px" }}>
          <div style={{ maxWidth:520, margin:"0 auto" }}>
            <motion.div initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.5, ease:EASE }}>
              <Card glass style={{ padding:40, textAlign:"center" }}>
                <div style={{ width:56, height:56, borderRadius:"50%", background:C.gold+"14", border:`1px solid ${C.gold}30`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", color:C.gold, boxShadow:"0 12px 30px -12px rgba(212,162,78,0.5)" }}>
                  <IconCheck />
                </div>
                <h3 style={{ fontFamily:C.display, fontWeight:600, color:C.gold, fontSize:22, marginBottom:6 }}>Gift Card Purchased</h3>
                <p style={{ color:C.dim, fontSize:13, marginBottom:24 }}>Your gift card code is ready{recipientEmail ? " and has been emailed to the recipient" : ""}.</p>
                <div style={{ background:C.bg, border:`1px solid ${C.gold}30`, borderRadius:8, padding:24, margin:"0 0 24px" }}>
                  <div style={{ color:C.gold, fontSize:10, fontWeight:600, letterSpacing:1, textTransform:"uppercase" as const, marginBottom:8 }}>Code</div>
                  <div style={{ color:C.white, fontSize:28, fontWeight:700, letterSpacing:3, fontFamily:"monospace" }}>{purchased.code}</div>
                  <div style={{ color:C.dim, fontSize:13, marginTop:8 }}>Value: ${((purchased.amountCents)/100).toFixed(0)}</div>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <Btn onClick={() => { setPurchased(null); setAmount(50); setPurchaserName(""); setRecipientName(""); setRecipientEmail(""); setMessage(""); }} variant="ghost" size="md" style={{ flex:1 }}>Buy Another</Btn>
                  <Btn onClick={() => setPage("Booking")} variant="gold" size="md" style={{ flex:1 }}>Book a Detail</Btn>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop:64, background:C.bg, minHeight:"100vh" }}>
      <div style={{ padding:"72px 24px 80px" }}>
        <div style={{ maxWidth:560, margin:"0 auto" }}>
          <Reveal>
            <SectionTitle chip="Gift Cards" title={"Give the gift\nof a clean car."} sub="Perfect for birthdays, holidays, or just because. Recipients can apply the code at checkout." />
          </Reveal>
          <Reveal delay={0.1}>
            <Card glass style={{ padding:32 }}>
              <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
                <div>
                  <label style={{ fontSize:10, fontWeight:600, color:C.dim, letterSpacing:0.8, textTransform:"uppercase" as const, display:"block", marginBottom:10 }}>Amount</label>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                    {presets.map(preset => (
                      <button key={preset} onClick={() => setAmount(preset)} style={{
                        padding:"12px 0", borderRadius:6, cursor:"pointer",
                        fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:16,
                        background: amount === preset ? C.gold : C.bg,
                        color: amount === preset ? "#0B0E14" : C.muted,
                        border: amount === preset ? `1px solid ${C.gold}` : `1px solid ${C.border}`,
                        transition:"all 0.15s",
                      }}>${preset}</button>
                    ))}
                  </div>
                  <div style={{ marginTop:8, display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:11, color:C.dim, fontWeight:600, letterSpacing:0.8, textTransform:"uppercase" as const }}>Custom:</span>
                    <div style={{ display:"flex", alignItems:"center", gap:2 }}>
                      <span style={{ color:C.gold, fontWeight:700, fontSize:15 }}>$</span>
                      <input type="number" min={5} value={amount} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(Math.max(5, parseInt(e.target.value) || 5))} style={{
                        width:70, padding:"6px 8px", borderRadius:4,
                        background:C.bg, border:`1px solid ${C.border}`,
                        color:C.white, fontSize:14, fontFamily:"'Outfit',sans-serif",
                        outline:"none",
                      }} />
                    </div>
                  </div>
                </div>
                <Input label="Your Name" placeholder="John Smith" value={purchaserName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPurchaserName(e.target.value)} />
                <Input label="Recipient Name" placeholder="Jane Smith" value={recipientName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRecipientName(e.target.value)} />
                <Input label="Recipient Email" type="email" placeholder="jane@email.com" value={recipientEmail} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRecipientEmail(e.target.value)} />
                <Textarea label="Personal Message (optional)" value={message} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)} />
                <Btn onClick={handlePurchase} disabled={loading || amount < 5} variant="gold" size="lg" style={{ width:"100%" }}>
                  {loading ? "Processing..." : `Purchase ${amount} Gift Card`}
                </Btn>
                <p style={{ textAlign:"center", color:C.dim, fontSize:11, margin:0 }}>
                  The recipient will receive an email with the code and your message.
                </p>
              </div>
            </Card>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

// ── LOYALTY PAGE ─────────────────────────────────────────────────
function LoyaltyPage({ setPage }: { setPage: (p: string) => void }) {
  const tierColors = [C.muted, C.gold, C.blueLt];
  return (
    <div style={{ paddingTop:64, background:C.bg, minHeight:"100vh" }}>
      <div style={{ padding:"72px 24px 80px" }}>
        <div style={{ maxWidth:960, margin:"0 auto" }}>
          <Reveal>
            <SectionTitle chip="Loyalty" title={"Earn while\nyou shine."} sub="Every detail earns points. Unlock better perks the more you come back." />
          </Reveal>
          <StaggerGroup stagger={0.12} style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(260px,1fr))", gap:20 }}>
            {LOYALTY_TIERS.map((tier, idx) => (
              <StaggerItem key={tier.name}>
                <Card glass style={{ padding:28, textAlign:"center", border: `1px solid ${tierColors[idx]}30`, boxShadow: idx === 2 ? `0 0 0 1px ${tierColors[idx]}20, 0 20px 48px -16px ${tierColors[idx]}44` : C.shadow }}>
                  <h3 style={{ fontFamily:C.display, fontWeight:600, fontSize:20, color:tierColors[idx], margin:"0 0 4px" }}>{tier.name}</h3>
                  <p style={{ color:C.dim, fontSize:12, margin:"0 0 20px" }}>{tier.min}+ points{tier.max ? ` (up to ${tier.max})` : ""}</p>
                  <ul style={{ margin:0, padding:0, listStyle:"none", textAlign:"left", display:"flex", flexDirection:"column", gap:10 }}>
                    {tier.perks.map(p => (
                      <li key={p} style={{ display:"flex", gap:9, color:C.muted, fontSize:13, lineHeight:1.45 }}>
                        <span style={{ color:tierColors[idx], display:"flex", marginTop:1 }}><IconCheck /></span>{p}
                      </li>
                    ))}
                  </ul>
                </Card>
              </StaggerItem>
            ))}
          </StaggerGroup>
          <Reveal delay={0.2} style={{ textAlign:"center", marginTop:40 }}>
            <Btn onClick={() => setPage("Booking")} variant="gold" size="lg">Start earning points</Btn>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

// ── ADMIN DASHBOARD ───────────────────────────────────────────────
function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState("");
  const [tab, setTab] = useState<"bookings"|"promos"|"blocked"|"giftcards">("bookings");
  const [bookings, setBookings] = useState<any[]>([]);
  const [promos, setPromos] = useState<any[]>([]);
  const [blocked, setBlocked] = useState<any[]>([]);
  const [giftCards, setGiftCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // New promo form
  const [newPromo, setNewPromo] = useState({ code:"", label:"", discount:"", type:"fixed", maxUses:"", expiresAt:"" });

  // New gift card form
  const [newGiftCard, setNewGiftCard] = useState({ amountCents:"", purchaserName:"", recipientName:"", recipientEmail:"" });

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
      const [bRes, pRes, blRes, gcRes] = await Promise.all([
        fetch("/api/bookings"),
        fetch("/api/promo-codes"),
        fetch("/api/blocked-times"),
        fetch("/api/gift-cards"),
      ]);
      const bData = await bRes.json();
      const pData = await pRes.json();
      const blData = await blRes.json();
      const gcData = await gcRes.json();
      setBookings(bData.bookings || []);
      setPromos(pData.codes || []);
      setBlocked(blData.blocked || []);
      setGiftCards(gcData.cards || []);
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

  const handleCreateGiftCard = async () => {
    const amt = parseInt(newGiftCard.amountCents);
    if (!amt || amt < 5) return;
    await fetch("/api/gift-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amountCents: amt * 100,
        purchaserName: newGiftCard.purchaserName,
        recipientName: newGiftCard.recipientName,
        recipientEmail: newGiftCard.recipientEmail,
      }),
    });
    setNewGiftCard({ amountCents:"", purchaserName:"", recipientName:"", recipientEmail:"" });
    loadData();
  };

  const handleToggleGiftCard = async (gc: any) => {
    await fetch(`/api/gift-cards/${gc.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: gc.status === "active" ? false : true }),
    });
    loadData();
  };

  const handleDeleteGiftCard = async (id: string) => {
    await fetch(`/api/gift-cards/${id}`, { method: "DELETE" });
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
            {([["bookings","Bookings"],["promos","Promo Codes"],["giftcards","Gift Cards"],["blocked","Blocked Times"]] as const).map(([id, label]) => (
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

          {/* GIFT CARDS TAB */}
          {tab==="giftcards" && (
            <div>
              <Card style={{ padding:18, marginBottom:16 }}>
                <h4 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:14, color:C.white, marginBottom:12 }}>Create Gift Card</h4>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr auto", gap:8, alignItems:"end" }}>
                  <Input label="Amount ($USD)" placeholder="50" value={newGiftCard.amountCents} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGiftCard({...newGiftCard, amountCents:e.target.value})} />
                  <Input label="Purchaser" placeholder="John Smith" value={newGiftCard.purchaserName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGiftCard({...newGiftCard, purchaserName:e.target.value})} />
                  <Input label="Recipient" placeholder="Jane Smith" value={newGiftCard.recipientName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGiftCard({...newGiftCard, recipientName:e.target.value})} />
                  <Input label="Recipient Email" placeholder="jane@email.com" value={newGiftCard.recipientEmail} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGiftCard({...newGiftCard, recipientEmail:e.target.value})} />
                  <Btn onClick={handleCreateGiftCard} variant="gold" size="md">Create</Btn>
                </div>
              </Card>
              {giftCards.length === 0 ? (
                <Card style={{ padding:36, textAlign:"center" }}>
                  <p style={{ color:C.dim, fontSize:14 }}>No gift cards yet.</p>
                </Card>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                  {giftCards.map(gc => (
                    <Card key={gc.id} style={{ padding:12 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div>
                          <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, color:C.gold, fontSize:14, marginRight:8 }}>{gc.code}</span>
                          <span style={{ color:C.dim, fontSize:11 }}>{gc.purchaserName || "--"} → {gc.recipientName || "--"}</span>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <span style={{ color:C.white, fontWeight:600, fontSize:12 }}>${((gc.balanceCents)/100).toFixed(0)}</span>
                          <span style={{ color:C.dim, fontSize:10 }}>of ${((gc.amountCents)/100).toFixed(0)}</span>
                          {gc.status !== "active" && <Chip color={C.red}>{gc.status === "exhausted" ? "USED" : "INACTIVE"}</Chip>}
                          <Btn onClick={() => handleToggleGiftCard(gc)} variant="ghost" size="xs">{gc.status === "active" ? "Disable" : "Enable"}</Btn>
                          <Btn onClick={() => handleDeleteGiftCard(gc.id)} variant="danger" size="xs">Delete</Btn>
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
    <div style={{ paddingTop:64, background:C.bg, minHeight:"100vh" }}>
      <div style={{ padding:"72px 24px 80px" }}>
        <div style={{ maxWidth:580, margin:"0 auto" }}>
          <Reveal>
            <SectionTitle chip="Contact" title="Let's talk." sub="Questions, feedback, or just want to say hi — we're here." />
          </Reveal>
          <Reveal delay={0.1}>
            <Card glass style={{ padding:32 }}>
              {sent ? (
                <motion.div initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.4, ease:EASE }} style={{ textAlign:"center", padding:24 }}>
                  <div style={{ width:48, height:48, borderRadius:"50%", background:C.green+"14", border:`1px solid ${C.green}30`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", color:C.green, boxShadow:"0 12px 30px -12px rgba(61,187,138,0.5)" }}>
                    <IconCheck />
                  </div>
                  <h3 style={{ fontFamily:C.display, fontWeight:600, color:C.green, fontSize:18, marginBottom:4 }}>Message sent</h3>
                  <p style={{ color:C.dim, fontSize:13 }}>We'll get back to you within a day.</p>
                </motion.div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                  <Input label="Name" value={form.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, name:e.target.value})} />
                  <Input label="Email" type="email" value={form.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, email:e.target.value})} />
                  <Textarea label="Message" value={form.message} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({...form, message:e.target.value})} />
                  <Btn onClick={handleSubmit} variant="gold" size="md" style={{ width:"100%" }}>Send message</Btn>
                  <div style={{ textAlign:"center", marginTop:8 }}>
                    <p style={{ color:C.dim, fontSize:12, margin:"0 0 4px" }}>Or reach us directly:</p>
                    <a href="tel:+14157028468" style={{ color:C.blueLt, fontWeight:700, fontSize:17, fontFamily:"'Outfit',sans-serif", textDecoration:"none" }}>(415) 702-8468</a>
                  </div>
                </div>
              )}
            </Card>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

// ── FOOTER ───────────────────────────────────────────────────────
function Footer({ setPage }: { setPage: (p: string) => void }) {
  return (
    <div style={{ background: C.card, borderTop:`1px solid ${C.border}`, padding:"48px 24px 24px" }}>
      <div style={{ maxWidth:1140, margin:"0 auto", display:"grid", gridTemplateColumns:"1.2fr 0.8fr 1fr", gap:40 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <img src="/logo.png" alt="BlueBay" style={{ width:30, height:30, borderRadius:8, filter:"drop-shadow(0 2px 8px rgba(74,138,244,0.25))" }} />
            <div>
              <div style={{ fontFamily:C.display, fontWeight:700, fontSize:16, color:C.white }}>BlueBay</div>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:500, fontSize:8, color:C.dim, letterSpacing:3, textTransform:"uppercase" as const }}>Auto Care</div>
            </div>
          </div>
          <p style={{ color:C.muted, fontSize:13, lineHeight:1.7, maxWidth:300 }}>Professional mobile detailing across San Francisco. Eco-friendly, waterless, at your doorstep.</p>
        </div>
        <div>
          <h4 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:600, color:C.white, fontSize:11, marginBottom:14, letterSpacing:1, textTransform:"uppercase" as const }}>Pages</h4>
          {[...["Home","Services","Booking","GiftCards","Loyalty","Contact"], "Admin"].map(l => (
            <button key={l} onClick={() => { setPage(l); window.scrollTo(0,0); }} className="bb-navlink" style={{ display:"block", background:"none", border:"none", cursor:"pointer", color: l === "Admin" ? C.subtle : C.muted, fontSize:l === "Admin" ? 11 : 13, fontFamily:"'Outfit',sans-serif", fontWeight:400, padding:"3px 0", transition:"color 0.2s", borderRadius:4 }}>{l === "GiftCards" ? "Gift Cards" : l}</button>
          ))}
        </div>
        <div>
          <h4 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:600, color:C.white, fontSize:11, marginBottom:14, letterSpacing:1, textTransform:"uppercase" as const }}>Contact</h4>
          <a href="tel:+14157028468" className="bb-navlink" style={{ display:"block", color:C.blueLt, fontSize:16, fontWeight:700, fontFamily:"'Outfit',sans-serif", marginBottom:6, textDecoration:"none" }}>(415) 702-8468</a>
          <p style={{ color:C.muted, fontSize:13, margin:0 }}>San Francisco, CA</p>
        </div>
      </div>
      <div style={{ maxWidth:1140, margin:"28px auto 0", paddingTop:18, borderTop:`1px solid ${C.border}`, textAlign:"center", fontSize:11, color:C.dim }}>
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
      <ScrollProgress />
      <Navbar page={page} setPage={go} />
      {page === "Home"     && <HomePage    setPage={go} />}
      {page === "Services" && <ServicesPage setPage={go} />}
      {page === "Booking"  && <BookingPage />}
      {page === "GiftCards" && <GiftCardPage setPage={go} />}
      {page === "Loyalty"  && <LoyaltyPage  setPage={go} />}
      {page === "Admin"    && <AdminPage />}
      {page === "Contact"  && <ContactPage />}
      {page !== "Home" && <Footer setPage={go} />}
    </div>
  );
}
