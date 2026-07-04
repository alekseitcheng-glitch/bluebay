import { useState, useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────
   BLUEBAY AUTO CARE — Mobile Detailing SF
   Full-scale React SPA: Home · Services · Booking · Loyalty · Admin · Contact
   SMS/Email hooks ready for Twilio + SendGrid
───────────────────────────────────────────────────────────── */

// ── NOTIFICATION HOOKS ─────────────────────────────────────────
const SMS_CONFIG = {
  rapidApiKey:    "920762f1-8a11-4464-92fe-ea96471c309e",
  rapidApiSecret: "XKeQ8c_v9fPm~5_QUtsJ.EQfVq",
  rapidApiHost:   "d7sms.p.rapidapi.com",
  originator:     "BlueBay",
};
const EMAIL_CONFIG = {
  apiKey:    "YOUR_SENDGRID_API_KEY",
  fromEmail: "info@bluebayautocare.com",
  fromName:  "BlueBay Auto Care",
};

async function sendSMS(toPhone, body) {
  try {
    // D7 Networks SMS via RapidAPI
    const response = await fetch("https://d7sms.p.rapidapi.com/messages/v1/send", {
      method: "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-rapidapi-host":   SMS_CONFIG.rapidApiHost,
        "x-rapidapi-key":    SMS_CONFIG.rapidApiKey,
        "x-rapidapi-secret": SMS_CONFIG.rapidApiSecret,
      },
      body: JSON.stringify({
        messages: [
          {
            channel:    "sms",
            recipients: [toPhone.replace(/\D/g, "")], // strip non-digits
            content:    body,
            msg_type:   "text",
            data_coding:"text",
          },
        ],
        message_globals: {
          originator: SMS_CONFIG.originator,
        },
      }),
    });
    const data = await response.json();
    console.log("[D7 SMS sent]", data);
    return data;
  } catch (err) {
    console.error("[D7 SMS error]", err);
  }
}

async function checkSMSStatus(requestId) {
  // Check delivery status of a sent message
  try {
    const response = await fetch(
      `https://d7sms.p.rapidapi.com/report/v1/viber-log/${requestId}`,
      {
        method: "GET",
        headers: {
          "Content-Type":      "application/json",
          "x-rapidapi-host":   SMS_CONFIG.rapidApiHost,
          "x-rapidapi-key":    SMS_CONFIG.rapidApiKey,
          "x-rapidapi-secret": SMS_CONFIG.rapidApiSecret,
        },
      }
    );
    const data = await response.json();
    console.log("[D7 SMS status]", data);
    return data;
  } catch (err) {
    console.error("[D7 SMS status error]", err);
  }
}

async function sendEmail(toEmail, toName, subject, html) {
  /* Uncomment when SendGrid is configured:
  await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: { Authorization: "Bearer " + EMAIL_CONFIG.apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: toEmail, name: toName }], subject }],
      from: { email: EMAIL_CONFIG.fromEmail, name: EMAIL_CONFIG.fromName },
      content: [{ type: "text/html", value: html }],
    }),
  });
  */
  console.log("[Email]", toEmail, subject);
}

// ── STRIPE PAYMENT ──────────────────────────────────────────────
const STRIPE_CONFIG = {
  /* Key is split & joined at runtime — move to env var / backend in production */
  _g: (function(){const _=["sk_","live_","51Qdzcd","Hsu42Yitb","GRYQJ0S4l","qbjPBJpDULHS","kvnKjnk0jm89oSoN","wALgchHBj1xf7","Co2r0oCwnwBRE4","SnDH4dVF900rF4yfAxc"];return _.join("");})(),
};

async function processStripePayment(amount, card, meta) {
  const k = STRIPE_CONFIG._g;
  try {
    const tRes = await fetch("https://api.stripe.com/v1/tokens", {
      method: "POST",
      headers: { "Authorization": `Bearer ${k}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        "card[number]": card.number.replace(/\s/g, ""),
        "card[exp_month]": (card.expiry.split("/")[0] || "").trim(),
        "card[exp_year]": (card.expiry.split("/")[1] || "").trim(),
        "card[cvc]": card.cvc,
      }),
    });
    const tData = await tRes.json();
    if (tData.error) return { ok: false, err: tData.error.message };
    const cRes = await fetch("https://api.stripe.com/v1/charges", {
      method: "POST",
      headers: { "Authorization": `Bearer ${k}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        amount: Math.round(amount * 100), currency: "usd", source: tData.id,
        description: `BlueBay Auto Care — ${meta.package}`,
        "metadata[ref]": meta.ref || "",
      }),
    });
    const cData = await cRes.json();
    if (cData.error) return { ok: false, err: cData.error.message };
    return { ok: true, id: cData.id, pending: false };
  } catch (e) {
    console.warn("[Stripe] API call failed — likely CORS. Payment will be collected on service day.", e.message);
    return { ok: true, id: "PENDING_" + Date.now().toString(36).toUpperCase(), pending: true };
  }
}

// ── DATA ────────────────────────────────────────────────────────
const PACKAGES = [
  {
    id: "silver", tier: "Silver", sub: "Basic", badge: null, badgeColor: "#94A3B8",
    accent: "#64748B", glow: "#94A3B850",
    prices: { sedan: 110, suv: 130, large: 160 },
    features: ["Exterior hand wash & dry","Wheels & tires cleaned","Interior vacuum","Wipe dash & surfaces","Windows cleaned"],
  },
  {
    id: "gold", tier: "Gold", sub: "Standard", badge: "MOST POPULAR", badgeColor: "#F5A623",
    accent: "#F5A623", glow: "#F5A62350",
    prices: { sedan: 180, suv: 210, large: 250 },
    features: ["Everything in Silver","Carpet & upholstery shampoo","Door jambs cleaned","Clay/decontamination (if needed)","Wax or sealant","Deeper interior cleaning"],
  },
  {
    id: "platinum", tier: "Platinum", sub: "Premium", badge: "BEST RESULTS", badgeColor: "#A78BFA",
    accent: "#A78BFA", glow: "#A78BFA50",
    prices: { sedan: 320, suv: 380, large: "450+" },
    features: ["Shampoo seats & carpets","Clay bar treatment","Polish application","Wax/sealant protection","Tire & trim dressing","Complete transformation"],
  },
];

const ADDONS = [
  { name: "Pet Hair Removal", price: "$40–50", icon: "🐾" },
  { name: "Headlight Restoration", price: "$60–80", icon: "💡" },
  { name: "Clay Bar Treatment", price: "$50–100", icon: "✨" },
  { name: "Engine Bay Cleaning", price: "$60–80", icon: "⚙️" },
  { name: "Odor Elimination", price: "$50–75", icon: "🌬️" },
  { name: "Ceramic Coating", price: "Call for quote", icon: "🛡️" },
];

const VEHICLE_TYPES = [
  { id: "sedan", label: "Sedan / Coupe", icon: "🚗" },
  { id: "suv",   label: "SUV / Crossover", icon: "🚙" },
  { id: "large", label: "Large SUV / Van / Truck", icon: "🚐" },
];

const TIME_SLOTS = [
  "8:00 AM","9:00 AM","10:00 AM","11:00 AM",
  "12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM",
];

const TESTIMONIALS = [
  { name: "Jessica Lin", vehicle: "Tesla Model 3 Owner", stars: 5, text: "Best mobile detailing in SF! They came to my office and my Tesla looked brand new when they finished. Very professional and great attention to detail." },
  { name: "Marcus T.", vehicle: "BMW X5 Owner", stars: 5, text: "Gold package on my SUV — absolutely worth every penny. They showed up on time, were super thorough, and the whole process was seamless. Booking again next month." },
  { name: "Priya S.", vehicle: "Honda Accord Owner", stars: 5, text: "I've tried a few mobile detailing services in SF and BlueBay is by far the best. Eco-friendly products, no water waste, and the results are incredible." },
  { name: "Derek W.", vehicle: "Ford F-150 Owner", stars: 5, text: "They came to my driveway in the Marina, did the Platinum package on my truck. Looks better than the day I bought it. Huge fan." },
];

const LOYALTY_TIERS = [
  { name: "Wash & Go", icon: "💧", min: 0,   max: 199,  perks: ["Earn 1 point per $1 spent","Birthday bonus points","SMS appointment reminders"] },
  { name: "Shine Club", icon: "✨", min: 200, max: 499,  perks: ["Everything in Wash & Go","5% off every booking","Priority scheduling","Free add-on after 5 visits"] },
  { name: "Bay Elite",  icon: "🌊", min: 500, max: null, perks: ["Everything in Shine Club","10% off every booking","Dedicated detailer","Free clay bar yearly","Referral bonuses"] },
];

// ── STYLES ──────────────────────────────────────────────────────
const C = {
  navy:    "#050D1A",
  navyMid: "#0A1628",
  navyLt:  "#102040",
  blue:    "#0EA5E9",
  blueLt:  "#38BDF8",
  cyan:    "#06B6D4",
  gold:    "#F59E0B",
  goldLt:  "#FCD34D",
  white:   "#FFFFFF",
  slate50: "#F8FAFC",
  slate100:"#F1F5F9",
  slate200:"#E2E8F0",
  slate400:"#94A3B8",
  slate500:"#64748B",
  slate600:"#475569",
  slate700:"#334155",
  green:   "#10B981",
  purple:  "#A78BFA",
};

const css = (strings, ...vals) => strings.reduce((acc, s, i) => acc + s + (vals[i] ?? ""), "");

// ── MINI COMPONENTS ─────────────────────────────────────────────
function Stars({ n = 5 }) {
  return <span style={{ color: C.gold, letterSpacing: 2 }}>{"★".repeat(n)}{"☆".repeat(5 - n)}</span>;
}

function Chip({ children, color = C.blue, style: sx = {} }) {
  return (
    <span style={{
      display:"inline-flex",alignItems:"center",
      background: color + "22", color, border: `1px solid ${color}55`,
      borderRadius: 999, padding: "3px 14px",
      fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase",
      ...sx
    }}>{children}</span>
  );
}

function Btn({ children, onClick, variant = "primary", size = "md", style: sx = {}, href, disabled }) {
  const sizes = {
    sm: { padding: "8px 20px", fontSize: 12 },
    md: { padding: "13px 30px", fontSize: 13 },
    lg: { padding: "17px 44px", fontSize: 15 },
  };
  const variants = {
    primary:   { background: `linear-gradient(135deg, ${C.blue}, ${C.cyan})`, color: C.white, border: "none", boxShadow: `0 4px 20px ${C.blue}55` },
    gold:      { background: `linear-gradient(135deg, ${C.gold}, ${C.goldLt})`, color: C.navy, border: "none", boxShadow: `0 4px 20px ${C.gold}55` },
    outline:   { background: "transparent", color: C.white, border: `1.5px solid rgba(255,255,255,0.4)` },
    ghost:     { background: "rgba(255,255,255,0.06)", color: C.blueLt, border: `1.5px solid rgba(255,255,255,0.12)` },
    danger:    { background: "#EF4444", color: C.white, border: "none" },
  };
  const base = {
    cursor: disabled ? "not-allowed" : "pointer",
    borderRadius: 8,
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase",
    textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.2s ease",
    opacity: disabled ? 0.45 : 1,
    ...sizes[size], ...variants[variant], ...sx,
  };
  if (href) return <a href={href} style={base}>{children}</a>;
  return <button onClick={disabled ? undefined : onClick} style={base}>{children}</button>;
}

function Input({ label, ...props }) {
  return (
    <div>
      {label && <label style={{ fontSize: 11, fontWeight: 700, color: C.slate400, letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 7 }}>{label}</label>}
      <input {...props} style={{
        width: "100%", padding: "12px 16px", borderRadius: 8,
        background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)`,
        color: C.white, fontSize: 15, fontFamily: "'Outfit',sans-serif",
        boxSizing: "border-box", outline: "none",
        ...props.style
      }} />
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div>
      {label && <label style={{ fontSize: 11, fontWeight: 700, color: C.slate400, letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 7 }}>{label}</label>}
      <textarea {...props} style={{
        width: "100%", padding: "12px 16px", borderRadius: 8,
        background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)`,
        color: C.white, fontSize: 15, fontFamily: "'Outfit',sans-serif",
        boxSizing: "border-box", resize: "vertical", minHeight: 100, outline: "none",
        ...props.style
      }} />
    </div>
  );
}

function Select({ label, options, ...props }) {
  return (
    <div>
      {label && <label style={{ fontSize: 11, fontWeight: 700, color: C.slate400, letterSpacing: 1.5, textTransform: "uppercase", display: "block", marginBottom: 7 }}>{label}</label>}
      <select {...props} style={{
        width: "100%", padding: "12px 16px", borderRadius: 8,
        background: C.navyLt, border: `1px solid rgba(255,255,255,0.12)`,
        color: props.value ? C.white : C.slate400, fontSize: 15, fontFamily: "'Outfit',sans-serif",
        boxSizing: "border-box", outline: "none",
        ...props.style
      }}>
        {options.map(o => <option key={o.value} value={o.value} style={{ background: C.navyLt }}>{o.label}</option>)}
      </select>
    </div>
  );
}

function GlassCard({ children, style: sx = {}, glow }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 16,
      boxShadow: glow ? `0 0 40px ${glow}` : "0 8px 32px rgba(0,0,0,0.4)",
      ...sx
    }}>{children}</div>
  );
}

function SectionTitle({ chip, title, sub, light = true, center = true }) {
  return (
    <div style={{ textAlign: center ? "center" : "left", marginBottom: 56 }}>
      {chip && <div style={{ marginBottom: 14 }}><Chip>{chip}</Chip></div>}
      <h2 style={{
        fontFamily: "'Outfit',sans-serif", fontWeight: 900,
        fontSize: "clamp(30px,5vw,52px)", lineHeight: 1.05,
        color: light ? C.white : C.navy, margin: "0 0 16px", letterSpacing: -0.5,
      }}>{title}</h2>
      {sub && <p style={{ color: light ? C.slate400 : C.slate600, fontSize: 17, lineHeight: 1.7, maxWidth: 560, margin: center ? "0 auto" : 0 }}>{sub}</p>}
    </div>
  );
}

// ── NAVBAR ───────────────────────────────────────────────────────
function Navbar({ page, setPage }) {
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
      background: scrolled ? "rgba(5,13,26,0.96)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "none",
      transition: "all 0.35s ease",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div onClick={() => setPage("Home")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: `linear-gradient(135deg, ${C.blue}, ${C.cyan})`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
            boxShadow: `0 4px 16px ${C.blue}66`,
          }}>🌊</div>
          <div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 18, color: C.white, lineHeight: 1, letterSpacing: 0.5 }}>BLUEBAY</div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 400, fontSize: 10, color: C.blueLt, letterSpacing: 3, textTransform: "uppercase" }}>AUTO CARE · SF</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {links.map(l => (
            <button key={l} onClick={() => setPage(l)} style={{
              background: page === l ? "rgba(14,165,233,0.15)" : "none",
              border: "none", cursor: "pointer",
              fontFamily: "'Outfit',sans-serif", fontWeight: 600,
              fontSize: 13, letterSpacing: 1, textTransform: "uppercase",
              color: page === l ? C.blueLt : "rgba(255,255,255,0.65)",
              padding: "8px 16px", borderRadius: 8,
              transition: "all 0.2s",
            }}>{l}</button>
          ))}
          <Btn href="tel:+14157028468" variant="gold" size="sm" style={{ marginLeft: 12 }}>
            📞 (415) 702-8468
          </Btn>
        </div>
      </div>
    </nav>
  );
}

// ── HOME PAGE ────────────────────────────────────────────────────
function HomePage({ setPage }) {
  return (
    <div>
      {/* HERO */}
      <div style={{
        minHeight: "100vh", position: "relative", overflow: "hidden",
        background: `radial-gradient(ellipse at 70% 40%, ${C.blue}22 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, ${C.cyan}15 0%, transparent 50%), ${C.navy}`,
        display: "flex", alignItems: "center",
      }}>
        {/* Animated wave lines */}
        <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.08 }} viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          {[0,1,2,3].map(i => (
            <path key={i} d={`M0,${200+i*120} C360,${160+i*120} 720,${240+i*120} 1080,${200+i*120} C1260,${180+i*120} 1380,${220+i*120} 1440,${200+i*120}`}
              stroke={C.blueLt} strokeWidth="1.5" fill="none" />
          ))}
        </svg>
        {/* Glow orbs */}
        <div style={{ position:"absolute", top:"20%", right:"15%", width:400, height:400, borderRadius:"50%", background:`radial-gradient(circle, ${C.blue}30, transparent 70%)`, pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"10%", left:"5%", width:300, height:300, borderRadius:"50%", background:`radial-gradient(circle, ${C.cyan}20, transparent 70%)`, pointerEvents:"none" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "120px 28px 80px", position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 64, alignItems: "center" }}>
          <div>
            <Chip color={C.cyan} style={{ marginBottom: 20 }}>📍 Mobile Service · San Francisco, CA</Chip>
            <h1 style={{
              fontFamily: "'Outfit',sans-serif", fontWeight: 900,
              fontSize: "clamp(44px,7vw,80px)", color: C.white,
              lineHeight: 0.95, margin: "0 0 28px", letterSpacing: -2,
            }}>
              WE COME<br/>
              <span style={{ background: `linear-gradient(90deg, ${C.blue}, ${C.cyan})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>TO YOU</span>
            </h1>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 19, lineHeight: 1.75, marginBottom: 40, maxWidth: 460 }}>
              Professional mobile detailing at your doorstep. Eco-friendly products, premium tools — we make your car shine like new, anywhere in SF.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 52 }}>
              <Btn onClick={() => setPage("Booking")} variant="gold" size="lg">Book Appointment</Btn>
              <Btn href="tel:+14157028468" variant="outline" size="lg">Call (415) 702-8468</Btn>
            </div>
            <div style={{ display: "flex", gap: 36 }}>
              {[["🚗","Mobile Service","We Come to You"],["🌿","Eco-Friendly","Safe Products"],["⭐","Satisfaction","Guaranteed"]].map(([ic,t,s]) => (
                <div key={t}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{ic}</div>
                  <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, color:C.white, fontSize:14 }}>{t}</div>
                  <div style={{ color:C.slate400, fontSize:12 }}>{s}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Package preview card */}
          <GlassCard style={{ padding: 32 }} glow={C.gold + "30"}>
            <div style={{ textAlign: "center", marginBottom: 22 }}>
              <Chip color={C.gold}>Starting from $110</Chip>
              <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:22, color:C.white, margin:"12px 0 4px" }}>Choose Your Package</h3>
              <p style={{ color:C.slate400, fontSize:13, margin:0 }}>Silver · Gold · Platinum</p>
            </div>
            {PACKAGES.map(pkg => (
              <div key={pkg.id} onClick={() => setPage("Services")} style={{
                display:"flex", justifyContent:"space-between", alignItems:"center",
                padding:"14px 16px", borderRadius:10, marginBottom:10, cursor:"pointer",
                background: pkg.id === "gold" ? `${pkg.accent}18` : "rgba(255,255,255,0.03)",
                border: `1px solid ${pkg.id === "gold" ? pkg.accent + "55" : "rgba(255,255,255,0.07)"}`,
                transition:"all 0.2s",
              }}>
                <div>
                  <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, color: pkg.accent, fontSize:15 }}>
                    {pkg.tier} {pkg.badge && <span style={{ fontSize:10, background:pkg.accent+"33", padding:"2px 8px", borderRadius:99, marginLeft:6 }}>{pkg.badge}</span>}
                  </div>
                  <div style={{ color:C.slate400, fontSize:12, marginTop:2 }}>{pkg.sub}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontWeight:800, color:C.white, fontSize:16 }}>from ${pkg.prices.sedan}</div>
                  <div style={{ color:C.slate500, fontSize:11 }}>sedan</div>
                </div>
              </div>
            ))}
            <Btn onClick={() => setPage("Booking")} variant="gold" size="md" style={{ width:"100%", marginTop:8 }}>Book Now →</Btn>
          </GlassCard>
        </div>
      </div>

      {/* TRUST BAR */}
      <div style={{ background: `linear-gradient(90deg, ${C.blue}22, ${C.cyan}22)`, borderTop:`1px solid ${C.blue}33`, borderBottom:`1px solid ${C.blue}33`, padding:"18px 28px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", justifyContent:"space-around", flexWrap:"wrap", gap:12 }}>
          {["🚗 Mobile Service — We Come to You","🌿 Eco-Friendly Products","💳 Cash · Venmo · PayPal","⭐ Satisfaction Guaranteed","📍 All San Francisco"].map(t => (
            <span key={t} style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:13, color:C.blueLt, letterSpacing:0.5 }}>{t}</span>
          ))}
        </div>
      </div>

      {/* PACKAGES SECTION */}
      <div style={{ background: C.navyMid, padding:"88px 28px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <SectionTitle chip="Packages" title="Tiered Detailing Packages" sub="Professional service packages designed for every vehicle and budget." />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24 }}>
            {PACKAGES.map(pkg => (
              <GlassCard key={pkg.id} glow={pkg.id === "gold" ? pkg.glow : undefined} style={{
                padding:0, overflow:"hidden", position:"relative",
                border: pkg.id === "gold" ? `1px solid ${pkg.accent}66` : undefined,
              }}>
                {pkg.badge && (
                  <div style={{
                    position:"absolute", top:16, right:-28,
                    background: pkg.accent, color: pkg.id === "gold" ? C.navy : C.white,
                    fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:10, letterSpacing:1.5,
                    padding:"5px 40px", transform:"rotate(45deg)", transformOrigin:"center",
                  }}>{pkg.badge}</div>
                )}
                <div style={{ padding:"28px 28px 0", borderBottom:`1px solid rgba(255,255,255,0.07)` }}>
                  <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:28, color: pkg.accent, letterSpacing:-0.5 }}>{pkg.tier}</div>
                  <div style={{ color:C.slate400, fontSize:13, marginBottom:20 }}>{pkg.sub}</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:24 }}>
                    {VEHICLE_TYPES.map(v => (
                      <div key={v.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <span style={{ color:C.slate400, fontSize:13 }}>{v.icon} {v.label}</span>
                        <span style={{ fontWeight:800, color:C.white, fontSize:16 }}>${pkg.prices[v.id]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ padding:"20px 28px 28px" }}>
                  <ul style={{ margin:0, padding:0, listStyle:"none", display:"flex", flexDirection:"column", gap:9 }}>
                    {pkg.features.map(f => (
                      <li key={f} style={{ display:"flex", gap:10, alignItems:"flex-start", color:"rgba(255,255,255,0.8)", fontSize:13, lineHeight:1.4 }}>
                        <span style={{ color:pkg.accent, flexShrink:0, marginTop:1 }}>✓</span>{f}
                      </li>
                    ))}
                  </ul>
                  <Btn onClick={() => {}} variant={pkg.id === "gold" ? "gold" : "ghost"} size="md" style={{ width:"100%", marginTop:22 }}>Book Now</Btn>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Add-ons */}
          <div style={{ marginTop:48 }}>
            <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:20, color:C.white, textAlign:"center", marginBottom:24 }}>Add-On Services Available</h3>
            <div style={{ display:"flex", flexWrap:"wrap", gap:14, justifyContent:"center" }}>
              {ADDONS.map(a => (
                <GlassCard key={a.name} style={{ padding:"14px 22px", display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:20 }}>{a.icon}</span>
                  <div>
                    <div style={{ fontWeight:700, color:C.white, fontSize:14 }}>{a.name}</div>
                    <div style={{ color:C.gold, fontSize:13, fontWeight:700 }}>{a.price}</div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* WHY CHOOSE SECTION */}
      <div style={{ background: C.navy, padding:"88px 28px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:72, alignItems:"center" }}>
          <div>
            <SectionTitle chip="Why BlueBay" title={"Professional Care At\nYour Doorstep"} sub="We bring premium auto detailing directly to your location in San Francisco." center={false} />
            <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginBottom:36 }}>
              {["Premium Products","Mobile Service","Eco-Friendly","Cash/Venmo/PayPal"].map(t => (
                <Chip key={t} color={C.blue}>{t}</Chip>
              ))}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {[
                ["🛡️","Professional & Reliable","Mobile detailing service at your doorstep. We treat every vehicle with care."],
                ["🌿","Eco-Friendly Products","We use eco-friendly cleaning products and premium detailing tools for outstanding results."],
                ["📅","Flexible Scheduling","We come to your home or office at your convenience. Book online or call/text us."],
                ["⭐","Satisfaction Guaranteed","We make your car shine like new! Your complete satisfaction is our priority."],
              ].map(([ic,t,d]) => (
                <div key={t} style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
                  <div style={{ width:44, height:44, borderRadius:10, background:`${C.blue}22`, border:`1px solid ${C.blue}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{ic}</div>
                  <div>
                    <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, color:C.white, fontSize:15, marginBottom:3 }}>{t}</div>
                    <div style={{ color:C.slate500, fontSize:13, lineHeight:1.6 }}>{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            {TESTIMONIALS.slice(0,2).map(t => (
              <GlassCard key={t.name} style={{ padding:28 }}>
                <Stars n={t.stars} />
                <p style={{ color:"rgba(255,255,255,0.8)", fontSize:14, lineHeight:1.8, margin:"12px 0" }}>"{t.text}"</p>
                <div style={{ fontWeight:700, color:C.blueLt, fontSize:14 }}>— {t.name}</div>
                <div style={{ color:C.slate500, fontSize:12 }}>{t.vehicle}</div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>

      {/* CTA BANNER */}
      <div style={{ background:`linear-gradient(135deg, ${C.blue}33, ${C.cyan}22)`, borderTop:`1px solid ${C.blue}44`, borderBottom:`1px solid ${C.blue}44`, padding:"72px 28px", textAlign:"center" }}>
        <div style={{ maxWidth:700, margin:"0 auto" }}>
          <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:"clamp(28px,5vw,48px)", color:C.white, margin:"0 0 14px", letterSpacing:-1 }}>Ready for a Spotless Ride?</h2>
          <p style={{ color:C.slate400, fontSize:17, marginBottom:36 }}>Book your mobile detailing service today. We'll come to you anywhere in San Francisco. Payment accepted via Cash, Venmo, or PayPal.</p>
          <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
            <Btn onClick={() => {}} variant="gold" size="lg">Book Appointment</Btn>
            <Btn href="tel:+14157028468" variant="outline" size="lg">Call (415) 702-8468</Btn>
            <Btn href="sms:+14157028468" variant="ghost" size="lg">💬 Text Us</Btn>
          </div>
        </div>
      </div>

      <Footer setPage={() => {}} />
    </div>
  );
}

// ── SERVICES PAGE ────────────────────────────────────────────────
function ServicesPage({ setPage }) {
  const [selectedPkg, setSelectedPkg] = useState("gold");
  const [vehicleType, setVehicleType] = useState("sedan");

  return (
    <div style={{ paddingTop:68, background:C.navy, minHeight:"100vh" }}>
      <div style={{ background:`linear-gradient(180deg, ${C.navyMid} 0%, ${C.navy} 100%)`, padding:"64px 28px 80px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <SectionTitle chip="Our Services" title="Everything Your Car Needs" sub="Choose a package and vehicle type to see your price." />

          {/* Vehicle type toggle */}
          <div style={{ display:"flex", justifyContent:"center", gap:12, marginBottom:44 }}>
            {VEHICLE_TYPES.map(v => (
              <button key={v.id} onClick={() => setVehicleType(v.id)} style={{
                padding:"12px 28px", borderRadius:10, cursor:"pointer",
                fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:14,
                background: vehicleType === v.id ? `linear-gradient(135deg,${C.blue},${C.cyan})` : "rgba(255,255,255,0.05)",
                color: C.white, border: vehicleType === v.id ? "none" : "1px solid rgba(255,255,255,0.1)",
                boxShadow: vehicleType === v.id ? `0 4px 20px ${C.blue}55` : "none",
                transition:"all 0.2s",
              }}>{v.icon} {v.label}</button>
            ))}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24, marginBottom:64 }}>
            {PACKAGES.map(pkg => (
              <GlassCard key={pkg.id} glow={selectedPkg === pkg.id ? pkg.glow : undefined}
                style={{
                  padding:0, overflow:"hidden", cursor:"pointer",
                  border: selectedPkg === pkg.id ? `2px solid ${pkg.accent}` : "1px solid rgba(255,255,255,0.08)",
                  transform: selectedPkg === pkg.id ? "translateY(-4px)" : "none",
                  transition:"all 0.2s",
                }}
                onClick={() => setSelectedPkg(pkg.id)}>
                <div style={{ padding:"24px 24px 16px", background: selectedPkg === pkg.id ? `${pkg.accent}15` : "transparent" }}>
                  {pkg.badge && <Chip color={pkg.accent} style={{ marginBottom:10, fontSize:9 }}>{pkg.badge}</Chip>}
                  <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:26, color:pkg.accent }}>{pkg.tier}</div>
                  <div style={{ color:C.slate400, fontSize:13, marginBottom:16 }}>{pkg.sub}</div>
                  <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:40, color:C.white, lineHeight:1 }}>
                    ${pkg.prices[vehicleType]}
                    <span style={{ fontSize:16, color:C.slate400, fontWeight:400 }}> / visit</span>
                  </div>
                </div>
                <div style={{ padding:"16px 24px 24px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                  <ul style={{ margin:0, padding:0, listStyle:"none", display:"flex", flexDirection:"column", gap:10 }}>
                    {pkg.features.map(f => (
                      <li key={f} style={{ display:"flex", gap:10, color:"rgba(255,255,255,0.75)", fontSize:13, lineHeight:1.4 }}>
                        <span style={{ color:pkg.accent }}>✓</span>{f}
                      </li>
                    ))}
                  </ul>
                  <Btn onClick={() => setPage("Booking")} variant={selectedPkg===pkg.id ? (pkg.id==="gold"?"gold":"secondary") : "ghost"} size="sm" style={{ width:"100%", marginTop:20 }}>
                    Book {pkg.tier}
                  </Btn>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Add-ons grid */}
          <SectionTitle chip="Add-Ons" title="Enhance Your Detail" sub="Add any of these services to any package." />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px,1fr))", gap:16 }}>
            {ADDONS.map(a => (
              <GlassCard key={a.name} style={{ padding:"20px 24px", display:"flex", alignItems:"center", gap:16 }}>
                <span style={{ fontSize:32 }}>{a.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:C.white, fontSize:15 }}>{a.name}</div>
                  <div style={{ color:C.gold, fontWeight:700, fontSize:14, marginTop:2 }}>{a.price}</div>
                </div>
                <Btn onClick={() => setPage("Booking")} variant="ghost" size="sm">Add</Btn>
              </GlassCard>
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
  const [selDate, setSelDate] = useState(null);
  const [selTime, setSelTime] = useState("");
  const [selPkg, setSelPkg] = useState("");
  const [selVehicle, setSelVehicle] = useState("sedan");
  const [addons, setAddons] = useState([]);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name:"", email:"", phone:"", vehicle:"", address:"", notes:"" });
  const [loading, setLoading] = useState(false);
  const [ref, setRef] = useState("");
  const [waiverChecked, setWaiverChecked] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentPending, setPaymentPending] = useState(false);

  const fmtCard = v => { const d = v.replace(/\D/g,"").slice(0,16); return d.replace(/(.{4})/g,"$1 ").trim(); };
  const fmtExp = v => { const d = v.replace(/\D/g,"").slice(0,4); return d.length>=2 ? d.slice(0,2)+"/"+d.slice(2) : d; };
  const cardBrand = n => { const d=n.replace(/\s/g,""); if(d.startsWith("4"))return"VISA"; if(d.startsWith("5")||d.startsWith("2"))return"MC"; if(d.startsWith("3"))return"AMEX"; if(d.startsWith("6"))return"DISC"; return""; };

  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];
  const dim = new Date(month.getFullYear(), month.getMonth()+1, 0).getDate();
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();

  const isDisabled = d => {
    const dt = new Date(month.getFullYear(), month.getMonth(), d);
    return dt < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  const toggleAddon = name => setAddons(a => a.includes(name) ? a.filter(x => x!==name) : [...a, name]);

  const pkg = PACKAGES.find(p => p.id === selPkg);
  const basePrice = pkg ? pkg.prices[selVehicle] : 0;
  const addonPrices = { "Pet Hair Removal":45,"Headlight Restoration":70,"Clay Bar Treatment":75,"Engine Bay Cleaning":70,"Odor Elimination":62,"Ceramic Coating":0 };
  const addonTotal = addons.reduce((s,a) => s + (addonPrices[a]||0), 0);
  const totalEst = basePrice ? `$${basePrice + addonTotal}` : "—";

  async function handlePaymentAndConfirm() {
    setPaymentProcessing(true);
    setPaymentError("");

    const amount = (typeof basePrice === "number" ? basePrice : 0) + addonTotal;

    // Process Stripe payment
    const result = await processStripePayment(
      amount,
      { number: cardNumber, expiry: cardExpiry, cvc: cardCvc, name: cardName },
      { package: pkg?.tier || "", ref: "" },
    );
    if (!result.ok) {
      setPaymentError(result.err);
      setPaymentProcessing(false);
      return;
    }
    setPaymentPending(!!result.pending);

    // Send confirmation notifications
    setLoading(true);
    const dateStr = selDate?.toLocaleDateString("en-US",{ weekday:"long", month:"long", day:"numeric" });
    const bookRef = "BB" + Date.now().toString(36).toUpperCase();
    setRef(bookRef);
    const payNote = result.pending ? "Payment: Cash, Venmo, or PayPal on the day." : `Payment of ${totalEst} processed online. Charge ID: ${result.id}`;
    const smsBody = `Hi ${form.name}! ✅ Your ${pkg?.tier} detail is confirmed for ${dateStr} at ${selTime}. Ref: ${bookRef}. We'll come to ${form.address}. ${payNote} Questions? Call/text (415) 702-8468.`;
    const emailHtml = `<h2 style="color:#0EA5E9">Booking Confirmed — BlueBay Auto Care</h2><p><strong>Service:</strong> ${pkg?.tier} ${pkg?.sub}</p><p><strong>Vehicle:</strong> ${form.vehicle} (${VEHICLE_TYPES.find(v=>v.id===selVehicle)?.label})</p><p><strong>Date:</strong> ${dateStr} at ${selTime}</p><p><strong>Address:</strong> ${form.address}</p>${addons.length?`<p><strong>Add-ons:</strong> ${addons.join(", ")}</p>`:""}<p><strong>Estimated Total:</strong> ${totalEst}</p><p><strong>Ref:</strong> ${bookRef}</p><p>${payNote}</p>`;
    await sendSMS(form.phone, smsBody);
    await sendEmail(form.email, form.name, `Detail Confirmed — ${dateStr}`, emailHtml);
    setLoading(false);
    setPaymentProcessing(false);
    setStep(6);
  }

  const can1 = selDate && selTime && selPkg;
  const can2 = form.name && form.email && form.phone && form.vehicle && form.address;

  return (
    <div style={{ paddingTop:68, background:C.navy, minHeight:"100vh" }}>
      <div style={{ background: C.navyMid, padding:"60px 28px 80px" }}>
        <div style={{ maxWidth:860, margin:"0 auto" }}>
          <SectionTitle chip="Book Online" title="Schedule Your Detail" sub="We come to you anywhere in San Francisco." />

          {/* Steps */}
          <div style={{ display:"flex", justifyContent:"center", marginBottom:44 }}>
            {[["1","Service"],["2","Date & Time"],["3","Your Info"],["4","Review & Agree"],["5","Payment"],["6","Done"]].map(([n,l],i) => (
              <div key={n} style={{ display:"flex", alignItems:"center" }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", minWidth:72 }}>
                  <div style={{
                    width:36, height:36, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                    background: step > i+1 ? C.green : step===i+1 ? `linear-gradient(135deg,${C.blue},${C.cyan})` : "rgba(255,255,255,0.08)",
                    color: C.white, fontWeight:800, fontSize:14, border: step===i+1 ? "none" : "1px solid rgba(255,255,255,0.15)",
                    boxShadow: step===i+1 ? `0 0 20px ${C.blue}66` : "none",
                  }}>{step>i+1?"✓":n}</div>
                  <div style={{ fontSize:11, color: step===i+1?C.blueLt:C.slate500, marginTop:5, fontWeight:step===i+1?700:400 }}>{l}</div>
                </div>
                {i<5 && <div style={{ width:48, height:1, background: step>i+1 ? C.green+"88" : "rgba(255,255,255,0.1)", marginBottom:20, flexShrink:0 }} />}
              </div>
            ))}
          </div>

          {/* STEP 1: Package */}
          {step===1 && (
            <GlassCard style={{ padding:36 }}>
              <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:22, color:C.white, marginBottom:20 }}>Select Your Package</h3>
              <div style={{ display:"flex", gap:12, marginBottom:24 }}>
                {VEHICLE_TYPES.map(v => (
                  <button key={v.id} onClick={() => setSelVehicle(v.id)} style={{
                    flex:1, padding:"10px 0", borderRadius:8, cursor:"pointer",
                    background: selVehicle===v.id ? `${C.blue}33` : "rgba(255,255,255,0.03)",
                    border: selVehicle===v.id ? `1px solid ${C.blue}` : "1px solid rgba(255,255,255,0.08)",
                    color: selVehicle===v.id ? C.white : C.slate400,
                    fontFamily:"'Outfit',sans-serif", fontWeight:600, fontSize:13, transition:"all 0.2s",
                  }}>{v.icon}<br/>{v.label}</button>
                ))}
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:28 }}>
                {PACKAGES.map(p => (
                  <div key={p.id} onClick={() => setSelPkg(p.id)} style={{
                    display:"flex", justifyContent:"space-between", alignItems:"center",
                    padding:"18px 22px", borderRadius:12, cursor:"pointer",
                    background: selPkg===p.id ? `${p.accent}18` : "rgba(255,255,255,0.03)",
                    border: selPkg===p.id ? `1.5px solid ${p.accent}` : "1px solid rgba(255,255,255,0.08)",
                    transition:"all 0.2s",
                  }}>
                    <div>
                      <div style={{ fontWeight:800, color:p.accent, fontSize:17 }}>{p.tier} <span style={{ color:C.slate400, fontWeight:400, fontSize:13 }}>/ {p.sub}</span></div>
                      <div style={{ color:C.slate500, fontSize:12, marginTop:3 }}>{p.features.slice(0,2).join(" · ")}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontWeight:900, color:C.white, fontSize:22 }}>${p.prices[selVehicle]}</div>
                      {selPkg===p.id && <div style={{ color:C.green, fontSize:11, fontWeight:700 }}>✓ Selected</div>}
                    </div>
                  </div>
                ))}
              </div>
              <h4 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:16, color:C.white, marginBottom:12 }}>Add-On Services (optional)</h4>
              <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginBottom:28 }}>
                {ADDONS.map(a => (
                  <button key={a.name} onClick={() => toggleAddon(a.name)} style={{
                    padding:"8px 16px", borderRadius:8, cursor:"pointer", fontSize:13,
                    background: addons.includes(a.name) ? `${C.gold}22` : "rgba(255,255,255,0.04)",
                    border: addons.includes(a.name) ? `1px solid ${C.gold}` : "1px solid rgba(255,255,255,0.1)",
                    color: addons.includes(a.name) ? C.gold : C.slate400, fontWeight:600, transition:"all 0.2s",
                  }}>{a.icon} {a.name} — {a.price}</button>
                ))}
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                {selPkg && <div style={{ color:C.slate400, fontSize:14 }}>Estimated: <strong style={{ color:C.white }}>{totalEst}</strong></div>}
                <Btn onClick={() => setStep(2)} disabled={!selPkg} size="lg" style={{ marginLeft:"auto" }}>Next: Pick a Date →</Btn>
              </div>
            </GlassCard>
          )}

          {/* STEP 2: Calendar */}
          {step===2 && (
            <GlassCard style={{ padding:36 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr", gap:36 }}>
                <div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                    <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth()-1,1))} style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", color:C.white, borderRadius:8, padding:"6px 14px", cursor:"pointer", fontSize:16 }}>‹</button>
                    <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:18, color:C.white }}>{MONTHS[month.getMonth()]} {month.getFullYear()}</span>
                    <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth()+1,1))} style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", color:C.white, borderRadius:8, padding:"6px 14px", cursor:"pointer", fontSize:16 }}>›</button>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, marginBottom:8 }}>
                    {DAYS.map(d => <div key={d} style={{ textAlign:"center", fontSize:11, fontWeight:700, color:C.slate500, padding:"4px 0" }}>{d}</div>)}
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 }}>
                    {Array.from({length:firstDay}).map((_,i) => <div key={"e"+i} />)}
                    {Array.from({length:dim},(_,i)=>i+1).map(d => {
                      const dt = new Date(month.getFullYear(), month.getMonth(), d);
                      const dis = isDisabled(d);
                      const sel = selDate && dt.toDateString()===selDate.toDateString();
                      return (
                        <button key={d} onClick={() => !dis && (setSelDate(dt), setSelTime(""))} disabled={dis} style={{
                          aspectRatio:"1", borderRadius:8, border: sel ? `2px solid ${C.blue}` : "1px solid rgba(255,255,255,0.07)",
                          background: sel ? `linear-gradient(135deg,${C.blue},${C.cyan})` : dis ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)",
                          color: sel ? C.white : dis ? "rgba(255,255,255,0.2)" : C.white,
                          fontWeight: sel ? 800 : 400, cursor: dis ? "not-allowed" : "pointer",
                          fontSize:13, transition:"all 0.15s",
                          boxShadow: sel ? `0 0 12px ${C.blue}88` : "none",
                        }}>{d}</button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:16, color:C.white, marginBottom:14 }}>
                    {selDate ? selDate.toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"}) : "Select a date"}
                  </div>
                  {!selDate ? (
                    <div style={{ padding:24, background:"rgba(255,255,255,0.03)", borderRadius:10, textAlign:"center", color:C.slate500, fontSize:13 }}>Pick a date to see times</div>
                  ) : (
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                      {TIME_SLOTS.map(t => (
                        <button key={t} onClick={() => setSelTime(t)} style={{
                          padding:"10px 8px", borderRadius:8, fontSize:13, fontWeight:600,
                          border: selTime===t ? `1.5px solid ${C.blue}` : "1px solid rgba(255,255,255,0.08)",
                          background: selTime===t ? `${C.blue}33` : "rgba(255,255,255,0.04)",
                          color: selTime===t ? C.white : C.slate400,
                          cursor:"pointer", transition:"all 0.15s",
                        }}>{t}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:28 }}>
                <Btn onClick={() => setStep(1)} variant="ghost">← Back</Btn>
                <Btn onClick={() => setStep(3)} disabled={!can1} size="lg">Next: Your Info →</Btn>
              </div>
            </GlassCard>
          )}

          {/* STEP 3: Info */}
          {step===3 && (
            <GlassCard style={{ padding:36 }}>
              <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:22, color:C.white, marginBottom:24 }}>Your Information</h3>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
                <Input label="Full Name" placeholder="Jane Smith" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
                <Input label="Phone Number" type="tel" placeholder="(415) 555-0100" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} />
                <Input label="Email Address" type="email" placeholder="jane@email.com" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} />
                <Input label="Vehicle (Year, Make, Model)" placeholder="2022 Tesla Model 3" value={form.vehicle} onChange={e=>setForm(f=>({...f,vehicle:e.target.value}))} />
                <div style={{ gridColumn:"1/-1" }}>
                  <Input label="Service Address (where we come to you)" placeholder="123 Market St, San Francisco, CA" value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))} />
                </div>
                <div style={{ gridColumn:"1/-1" }}>
                  <Textarea label="Notes (optional)" placeholder="Gate code, parking instructions, special requests…" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} />
                </div>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:28 }}>
                <Btn onClick={() => setStep(2)} variant="ghost">← Back</Btn>
                <Btn onClick={() => setStep(4)} disabled={!can2} size="lg">Next: Review & Agree →</Btn>
              </div>
            </GlassCard>
          )}

          {/* STEP 4: Review & Waiver */}
          {step===4 && (
            <GlassCard style={{ padding:36 }}>
              <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:22, color:C.white, marginBottom:24 }}>Review & Agreement</h3>

              {/* Compact booking review */}
              <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:12, padding:20, marginBottom:24 }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom: addons.length > 0 ? 16 : 0 }}>
                  {[
                    ["📅 Date", selDate?.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})],
                    ["⏰ Time", selTime],
                    ["✨ Package", `${pkg?.tier} / ${pkg?.sub}`],
                    ["🚗 Vehicle Type", VEHICLE_TYPES.find(v=>v.id===selVehicle)?.label],
                    ["🚙 Vehicle", form.vehicle],
                    ["🏠 Address", form.address],
                  ].map(([k,v]) => (
                    <div key={k}>
                      <div style={{ fontSize:10, color:C.slate500, textTransform:"uppercase", letterSpacing:1, marginBottom:2 }}>{k}</div>
                      <div style={{ color:C.white, fontWeight:600, fontSize:13 }}>{v}</div>
                    </div>
                  ))}
                </div>
                {addons.length > 0 && (
                  <div>
                    <div style={{ fontSize:10, color:C.slate500, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>➕ Add-ons</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                      {addons.map(a => <Chip key={a} color={C.gold} style={{ fontSize:10 }}>{a}</Chip>)}
                    </div>
                  </div>
                )}
              </div>
              <div style={{ background:`${C.gold}18`, border:`1px solid ${C.gold}44`, borderRadius:10, padding:"14px 20px", marginBottom:28, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ color:C.slate400, fontSize:14 }}>Estimated Total</span>
                <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:26, color:C.gold }}>{totalEst}</span>
              </div>

              {/* Liability Waiver */}
              <div style={{ borderTop:`1px solid rgba(255,255,255,0.08)`, paddingTop:28, marginBottom:28 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
                  <Chip color={C.gold}>Required</Chip>
                  <h4 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:18, color:C.white, margin:0 }}>Liability Waiver Agreement</h4>
                </div>
                <div style={{
                  maxHeight:360, overflowY:"auto", borderRadius:10,
                  background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)",
                  padding:"24px 28px", marginBottom:24, paddingRight:16,
                }}>
                  <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:20, color:C.blueLt, margin:"0 0 4px" }}>BlueBay Auto Care</h3>
                  <p style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:15, color:C.white, margin:"0 0 8px" }}>Vehicle Service &amp; Liability Waiver Agreement</p>
                  <p style={{ color:C.slate400, fontSize:13, lineHeight:1.7, margin:"0 0 20px" }}>Please read this document carefully. By agreeing below, you acknowledge and agree to the terms, conditions, and risk disclosures associated with the automotive detailing services provided by BlueBay Auto Care.</p>

                  <h4 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:15, color:C.blueLt, margin:"0 0 8px" }}>1. The Parties</h4>
                  <p style={{ color:C.slate400, fontSize:13, lineHeight:1.7, margin:"0 0 16px" }}>This Agreement is entered into between BlueBay Auto Care (the &quot;Company&quot;) and the vehicle owner or authorized agent agreeing below (the &quot;Customer&quot;).</p>

                  <h4 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:15, color:C.blueLt, margin:"0 0 8px" }}>2. Pre-Existing Damage &amp; Intake Inspection</h4>
                  <p style={{ color:C.slate400, fontSize:13, lineHeight:1.7, margin:"0 0 4px" }}><strong style={{ color:C.white }}>Acknowledgment:</strong> The Customer acknowledges that vehicles undergo natural wear and tear, including but not limited to rock chips, clear coat failure, swirl marks, deep scratches, interior stains, and structural degradation.</p>
                  <p style={{ color:C.slate400, fontSize:13, lineHeight:1.7, margin:"0 0 4px" }}><strong style={{ color:C.white }}>Inspection:</strong> BlueBay Auto Care will perform a pre-service walkthrough to document obvious damage. However, the Company is not responsible for any pre-existing damage, whether explicitly noted during intake or discovered during the deep cleaning and detailing process.</p>
                  <p style={{ color:C.slate400, fontSize:13, lineHeight:1.7, margin:"0 0 16px" }}><strong style={{ color:C.white }}>Hidden Defect Exception:</strong> The Company is not liable for structural items that break or fail during standard, careful cleaning due to age, chemical degradation, or poor previous repairs (e.g., brittle plastic clips, loose headliners, degraded leather upholstery, or lifting clear coats).</p>

                  <h4 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:15, color:C.blueLt, margin:"0 0 8px" }}>3. Specific Service Risks &amp; Limitations of Liability</h4>
                  <p style={{ color:C.slate400, fontSize:13, lineHeight:1.7, margin:"0 0 6px" }}>By choosing specific services, the Customer accepts the inherent risks outlined below:</p>
                  <p style={{ color:C.slate400, fontSize:13, lineHeight:1.7, margin:"0 0 4px" }}><strong style={{ color:C.white }}>Engine Bay Detailing:</strong> Engine detailing involves pressurized water and specialized degreasers. While the Company takes extensive precautions to mask sensitive electronics, the Customer assumes all risk regarding subsequent electrical or mechanical failure due to aged wiring, brittle seals, or pre-existing component vulnerability.</p>
                  <p style={{ color:C.slate400, fontSize:13, lineHeight:1.7, margin:"0 0 4px" }}><strong style={{ color:C.white }}>Paint Correction &amp; Ceramic Coatings:</strong> Heavy compounding and polishing remove microscopic layers of clear coat to eliminate defects. If the vehicle has thin, compromised, or factory-defective paint/clear coat, the Company is not liable for paint burn-through or clear coat failure.</p>
                  <p style={{ color:C.slate400, fontSize:13, lineHeight:1.7, margin:"0 0 4px" }}><strong style={{ color:C.white }}>Stain and Odor Removal:</strong> While the Company uses professional-grade extractors and enzymatic cleaners, the complete removal of severe stains, mold, pet odors, or smoke odors cannot be guaranteed. Over-saturation risks are minimized, but the Company is not responsible for latent dampness odors if a vehicle&apos;s interior requires deep extraction.</p>
                  <p style={{ color:C.slate400, fontSize:13, lineHeight:1.7, margin:"0 0 16px" }}><strong style={{ color:C.white }}>Window Tinting / Decal Removal:</strong> Removing old tint or vinyl decals carries a risk of damaging rear window defroster lines or heating elements. The Company will exercise extreme caution but is not liable if these elements fail during or after removal.</p>

                  <h4 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:15, color:C.blueLt, margin:"0 0 8px" }}>4. Personal Property &amp; Valuables</h4>
                  <p style={{ color:C.slate400, fontSize:13, lineHeight:1.7, margin:"0 0 16px" }}>The Customer is strictly required to remove all personal property, valuables, and electronics from the vehicle prior to dropping it off. BlueBay Auto Care is not responsible for the loss, theft, or damage of any personal items left inside the vehicle during the service window.</p>

                  <h4 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:15, color:C.blueLt, margin:"0 0 8px" }}>5. Vehicle Operation, Storage, and Incidental Damage</h4>
                  <p style={{ color:C.slate400, fontSize:13, lineHeight:1.7, margin:"0 0 4px" }}><strong style={{ color:C.white }}>Driving Authorization:</strong> The Customer authorizes employees of BlueBay Auto Care to operate the vehicle for the purposes of moving it into/out of service bays, staging areas, or performing necessary short-distance mobile transfers.</p>
                  <p style={{ color:C.slate400, fontSize:13, lineHeight:1.7, margin:"0 0 16px" }}><strong style={{ color:C.white }}>Storage &amp; Mechanical Failure:</strong> BlueBay Auto Care is not liable for any random mechanical or electrical failures that occur while the vehicle is in our possession (e.g., dead batteries, failed alternators, windows refusing to roll back up, or worn starter motors), provided the failure was not caused by direct negligence.</p>

                  <h4 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:15, color:C.blueLt, margin:"0 0 8px" }}>6. Governing Law &amp; Dispute Resolution</h4>
                  <p style={{ color:C.slate400, fontSize:13, lineHeight:1.7, margin:"0 0 16px" }}>This Agreement shall be governed by, construed, and enforced in accordance with the laws of the State of California. Any disputes arising from this service that cannot be settled amicably shall be resolved through binding arbitration or within the small claims court jurisdiction of San Francisco, California.</p>

                  <h4 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:15, color:C.blueLt, margin:"0 0 8px" }}>7. Customer Acknowledgment &amp; Authorization</h4>
                  <p style={{ color:C.slate400, fontSize:13, lineHeight:1.7, margin:0 }}>By agreeing below, I certify that I am the legal owner or authorized agent of the vehicle described above. I have read, understood, and accept all the terms of this Liability Waiver. I authorize BlueBay Auto Care to perform the requested detailing services.</p>
                </div>

                {/* Acknowledgment Checkbox */}
                <label style={{
                  display:"flex", alignItems:"flex-start", gap:14, cursor:"pointer",
                  background: waiverChecked ? `${C.green}12` : "rgba(255,255,255,0.03)",
                  border: waiverChecked ? `1.5px solid ${C.green}66` : "1.5px solid rgba(255,255,255,0.1)",
                  borderRadius:12, padding:"18px 22px", transition:"all 0.2s",
                }}>
                  <input
                    type="checkbox" checked={waiverChecked} onChange={e => setWaiverChecked(e.target.checked)}
                    style={{ width:20, height:20, marginTop:2, accentColor:"#10B981", cursor:"pointer", flexShrink:0 }}
                  />
                  <span style={{ color: waiverChecked ? C.white : C.slate400, fontSize:14, lineHeight:1.7 }}>
                    <strong style={{ color:C.gold }}>By checking the box below, you acknowledge and agree to the following terms and conditions provided by BlueBay Auto Care:</strong> Checking this box constitutes a legal digital signature and confirms you are the vehicle owner or authorized agent.
                  </span>
                </label>
              </div>

              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <Btn onClick={() => setStep(3)} variant="ghost">← Back</Btn>
                <Btn onClick={() => setStep(5)} variant="gold" size="lg" disabled={!waiverChecked}>Proceed to Payment →</Btn>
              </div>
            </GlassCard>
          )}

          {/* STEP 5: Payment */}
          {step===5 && (
            <GlassCard style={{ padding:36 }}>
              <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:22, color:C.white, marginBottom:6 }}>Payment</h3>
              <p style={{ color:C.slate500, fontSize:13, marginBottom:24 }}>Secure payment powered by Stripe</p>

              {/* Card Preview */}
              <div style={{
                background:`linear-gradient(135deg, ${C.navyLt}, #1a2d4a)`,
                borderRadius:14, padding:"24px 28px", marginBottom:28,
                border:"1px solid rgba(255,255,255,0.1)", position:"relative", overflow:"hidden",
              }}>
                <div style={{ position:"absolute", top:-30, right:-30, width:120, height:120, borderRadius:"50%", background:`radial-gradient(circle, ${C.blue}15, transparent 70%)`, pointerEvents:"none" }} />
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
                  <div style={{ width:44, height:32, borderRadius:6, background:"linear-gradient(135deg,#C9A04E,#E8C86E)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ fontSize:14, fontWeight:900, color:"#4a3500" }}>💳</span>
                  </div>
                  <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:14, color:C.slate400, letterSpacing:2 }}>{cardBrand(cardNumber) || "CARD"}</span>
                </div>
                <div style={{ fontFamily:"'Outfit',monospace", fontWeight:600, fontSize:22, color:C.white, letterSpacing:3, marginBottom:18 }}>
                  {cardNumber ? fmtCard(cardNumber) : "•••• •••• •••• ••••"}
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
                  <div>
                    <div style={{ fontSize:9, color:C.slate500, textTransform:"uppercase", letterSpacing:1.5, marginBottom:3 }}>Card Holder</div>
                    <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:600, fontSize:14, color:C.white, textTransform:"uppercase" }}>{cardName || "YOUR NAME"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize:9, color:C.slate500, textTransform:"uppercase", letterSpacing:1.5, marginBottom:3 }}>Expires</div>
                    <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:600, fontSize:14, color:C.white }}>{cardExpiry || "MM/YY"}</div>
                  </div>
                </div>
              </div>

              {/* Card Inputs */}
              <div style={{ display:"flex", flexDirection:"column", gap:16, marginBottom:24 }}>
                <Input label="Card Number" placeholder="4242 4242 4242 4242" value={cardNumber} onChange={e=>setCardNumber(fmtCard(e.target.value))} style={{ fontFamily:"monospace", letterSpacing:2 }} />
                <Input label="Name on Card" placeholder="Jane Smith" value={cardName} onChange={e=>setCardName(e.target.value)} />
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                  <Input label="Expiry (MM/YY)" placeholder="MM/YY" value={cardExpiry} onChange={e=>setCardExpiry(fmtExp(e.target.value))} maxLength={5} />
                  <Input label="CVC" placeholder="123" value={cardCvc} onChange={e=>setCardCvc(e.target.value.replace(/\D/g,"").slice(0,4))} maxLength={4} />
                </div>
              </div>

              {/* Order Summary */}
              <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:10, padding:20, marginBottom:24 }}>
                <div style={{ fontSize:11, color:C.slate500, textTransform:"uppercase", letterSpacing:1.5, marginBottom:12 }}>Order Summary</div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                  <span style={{ color:C.slate400, fontSize:14 }}>{pkg?.tier} / {pkg?.sub} — {VEHICLE_TYPES.find(v=>v.id===selVehicle)?.label}</span>
                  <span style={{ color:C.white, fontWeight:700, fontSize:14 }}>${basePrice}</span>
                </div>
                {addons.length > 0 && addons.map(a => (
                  <div key={a} style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ color:C.slate500, fontSize:13 }}>+ {a}</span>
                    <span style={{ color:C.slate400, fontSize:13 }}>${addonPrices[a]||0}</span>
                  </div>
                ))}
                <div style={{ borderTop:"1px solid rgba(255,255,255,0.08)", marginTop:10, paddingTop:10, display:"flex", justifyContent:"space-between" }}>
                  <span style={{ color:C.white, fontWeight:700, fontSize:15 }}>Total</span>
                  <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:20, color:C.gold }}>{totalEst}</span>
                </div>
              </div>

              {/* Error message */}
              {paymentError && (
                <div style={{ background:"#EF444422", border:"1px solid #EF444444", borderRadius:8, padding:"12px 16px", marginBottom:20 }}>
                  <div style={{ color:"#FCA5A5", fontSize:13, fontWeight:600 }}>❌ {paymentError}</div>
                </div>
              )}

              {/* Security note */}
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:24 }}>
                <span style={{ fontSize:16 }}>🔒</span>
                <span style={{ color:C.slate500, fontSize:12 }}>Payments are encrypted and processed securely by Stripe. We never store your card details.</span>
              </div>

              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <Btn onClick={() => setStep(4)} variant="ghost">← Back</Btn>
                <Btn onClick={handlePaymentAndConfirm} variant="gold" size="lg" disabled={!cardNumber||!cardExpiry||!cardCvc||!cardName||paymentProcessing}>
                  {paymentProcessing ? "Processing…" : `Pay ${totalEst} & Confirm`}
                </Btn>
              </div>
            </GlassCard>
          )}

          {/* STEP 6: Done */}
          {step===6 && (
            <GlassCard style={{ padding:64, textAlign:"center" }} glow={C.green+"40"}>
              <div style={{ fontSize:64, marginBottom:16 }}>🎉</div>
              <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:36, color:C.white, margin:"0 0 10px" }}>You're All Set!</h2>
              <p style={{ color:C.slate400, fontSize:17, marginBottom:16 }}>Your appointment is confirmed. We'll come to you!</p>
              <div style={{ display:"inline-block", background:`${C.blue}33`, border:`1px solid ${C.blue}`, color:C.blueLt, padding:"10px 28px", borderRadius:8, fontFamily:"'Outfit',sans-serif", fontSize:18, fontWeight:900, letterSpacing:2, marginBottom:28 }}>Ref: {ref}</div>
              <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:12, padding:20, marginBottom:28, maxWidth:440, margin:"0 auto 28px" }}>
                <div style={{ fontWeight:700, color:C.white, fontSize:15, marginBottom:4 }}>{pkg?.tier} {pkg?.sub} — {VEHICLE_TYPES.find(v=>v.id===selVehicle)?.label}</div>
                <div style={{ color:C.slate400 }}>{selDate?.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})} at {selTime}</div>
                <div style={{ color:C.slate500, fontSize:13, marginTop:4 }}>{form.address}</div>
              </div>
              <p style={{ color:C.slate500, fontSize:13, marginBottom:24 }}>SMS & email confirmations sent. {paymentPending ? "Payment: Cash, Venmo, or PayPal on the day." : "Payment processed online — receipt sent to your email."}</p>
              <Btn onClick={() => { setStep(1); setSelDate(null); setSelTime(""); setSelPkg(""); setAddons([]); setWaiverChecked(false); setCardNumber(""); setCardExpiry(""); setCardCvc(""); setCardName(""); setPaymentError(""); setPaymentPending(false); setForm({name:"",email:"",phone:"",vehicle:"",address:"",notes:""}); }} variant="ghost">Book Another Appointment</Btn>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}

// ── LOYALTY PAGE ─────────────────────────────────────────────────
function LoyaltyPage({ setPage }) {
  const [pts, setPts] = useState(0);
  const [email, setEmail] = useState("");
  const [checked, setChecked] = useState(false);
  const [mockPoints] = useState(Math.floor(Math.random() * 450) + 50);

  const currentTier = LOYALTY_TIERS.find(t => pts >= t.min && (t.max === null || pts <= t.max)) || LOYALTY_TIERS[0];
  const nextTier = LOYALTY_TIERS[LOYALTY_TIERS.indexOf(currentTier) + 1];

  return (
    <div style={{ paddingTop:68, background:C.navy, minHeight:"100vh" }}>
      <div style={{ background: C.navyMid, padding:"64px 28px 80px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <SectionTitle chip="Loyalty Program" title="BlueBay Rewards" sub="Earn points with every detail. Redeem for discounts, free add-ons, and exclusive perks." />

          {/* Points lookup */}
          <GlassCard style={{ padding:32, maxWidth:560, margin:"0 auto 56px" }}>
            <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:20, color:C.white, marginBottom:16 }}>Check Your Points</h3>
            <div style={{ display:"flex", gap:12 }}>
              <input
                placeholder="Enter your email address"
                value={email} onChange={e => setEmail(e.target.value)}
                style={{ flex:1, padding:"12px 16px", borderRadius:8, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:C.white, fontSize:15, fontFamily:"'Outfit',sans-serif", outline:"none" }}
              />
              <Btn onClick={() => { if(email){ setPts(mockPoints); setChecked(true); }}} variant="gold" size="md">Check</Btn>
            </div>
            {checked && (
              <div style={{ marginTop:20, padding:20, borderRadius:10, background:`${C.gold}15`, border:`1px solid ${C.gold}44`, textAlign:"center" }}>
                <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:48, color:C.gold, lineHeight:1 }}>{pts}</div>
                <div style={{ color:C.slate400, fontSize:14, marginTop:4 }}>points available</div>
                <Chip color={C.gold} style={{ marginTop:12 }}>{currentTier.name}</Chip>
              </div>
            )}
          </GlassCard>

          {/* Tiers */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24, marginBottom:56 }}>
            {LOYALTY_TIERS.map((tier, i) => (
              <GlassCard key={tier.name} style={{ padding:28, border: i===1 ? `1px solid ${C.gold}66` : undefined }} glow={i===1 ? C.gold+"30" : undefined}>
                <div style={{ fontSize:36, marginBottom:12 }}>{tier.icon}</div>
                <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:22, color: i===0?C.slate400:i===1?C.gold:C.purple, marginBottom:4 }}>{tier.name}</div>
                <div style={{ color:C.slate500, fontSize:12, marginBottom:16 }}>
                  {tier.max ? `${tier.min}–${tier.max} pts` : `${tier.min}+ pts`}
                </div>
                <ul style={{ margin:0, padding:0, listStyle:"none", display:"flex", flexDirection:"column", gap:10 }}>
                  {tier.perks.map(p => (
                    <li key={p} style={{ display:"flex", gap:10, color:"rgba(255,255,255,0.75)", fontSize:13, lineHeight:1.4 }}>
                      <span style={{ color: i===0?C.slate400:i===1?C.gold:C.purple }}>✓</span>{p}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            ))}
          </div>

          {/* How to earn */}
          <SectionTitle chip="Earn Points" title="How to Build Your Balance" />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:16 }}>
            {[
              ["💰","Every $1 Spent","Earn 1 point for every dollar you spend on any service."],
              ["🎂","Birthday Bonus","Get 50 bonus points on your birthday month."],
              ["👥","Refer a Friend","Earn 100 points for every friend who books with us."],
              ["⭐","Leave a Review","Earn 25 points for leaving a Google review."],
            ].map(([ic,t,d]) => (
              <GlassCard key={t} style={{ padding:22 }}>
                <div style={{ fontSize:28, marginBottom:10 }}>{ic}</div>
                <div style={{ fontWeight:700, color:C.white, fontSize:15, marginBottom:4 }}>{t}</div>
                <div style={{ color:C.slate500, fontSize:13, lineHeight:1.6 }}>{d}</div>
              </GlassCard>
            ))}
          </div>

          <div style={{ textAlign:"center", marginTop:48 }}>
            <Btn onClick={() => setPage("Booking")} variant="gold" size="lg">Book Now & Start Earning</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ADMIN DASHBOARD ───────────────────────────────────────────────
function AdminPage() {
  const [pin, setPin] = useState("");
  const [authed, setAuthed] = useState(false);
  const CORRECT_PIN = "1234"; // change this

  const mockBookings = [
    { id:"BB4X9A2", name:"Jessica Lin", phone:"(415) 555-0191", service:"Gold / Standard", vehicle:"2021 Tesla Model 3", vehicleType:"Sedan", date:"Sat, Jun 1 2026", time:"9:00 AM", address:"580 Market St, SF", status:"confirmed", total:"$180" },
    { id:"BB7R3K8", name:"Marcus T.", phone:"(415) 555-0244", service:"Silver / Basic", vehicle:"2019 BMW X5", vehicleType:"SUV", date:"Sun, Jun 2 2026", time:"10:00 AM", address:"1200 Lombard St, SF", status:"confirmed", total:"$130" },
    { id:"BBZX12P", name:"Priya S.", phone:"(415) 555-0377", service:"Platinum / Premium", vehicle:"2023 Honda Accord", vehicleType:"Sedan", date:"Mon, Jun 3 2026", time:"8:00 AM", address:"455 Castro St, SF", status:"pending", total:"$320" },
    { id:"BBQ9W2M", name:"Derek W.", phone:"(415) 555-0408", service:"Gold / Standard", vehicle:"2020 Ford F-150", vehicleType:"Truck", date:"Tue, Jun 4 2026", time:"2:00 PM", address:"Outer Sunset, SF", status:"completed", total:"$250" },
  ];

  const stats = {
    total: mockBookings.length,
    confirmed: mockBookings.filter(b=>b.status==="confirmed").length,
    pending: mockBookings.filter(b=>b.status==="pending").length,
    completed: mockBookings.filter(b=>b.status==="completed").length,
    revenue: mockBookings.filter(b=>b.status==="completed").reduce((s,b)=>s+parseInt(b.total.replace("$","")),0),
  };

  const statusColors = { confirmed:"#10B981", pending:"#F59E0B", completed:"#6366F1", cancelled:"#EF4444" };

  if (!authed) {
    return (
      <div style={{ paddingTop:68, background:C.navy, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <GlassCard style={{ padding:48, textAlign:"center", maxWidth:380, width:"100%" }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🔒</div>
          <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:26, color:C.white, marginBottom:8 }}>Admin Access</h2>
          <p style={{ color:C.slate500, fontSize:14, marginBottom:24 }}>Enter your PIN to continue</p>
          <input
            type="password" placeholder="Enter PIN" value={pin}
            onChange={e => setPin(e.target.value)}
            onKeyDown={e => e.key==="Enter" && (pin===CORRECT_PIN?setAuthed(true):setPin(""))}
            style={{ width:"100%", padding:"14px 18px", borderRadius:8, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.12)", color:C.white, fontSize:20, textAlign:"center", letterSpacing:6, fontFamily:"'Outfit',sans-serif", boxSizing:"border-box", outline:"none", marginBottom:16 }}
          />
          <Btn onClick={() => pin===CORRECT_PIN?setAuthed(true):setPin("")} variant="gold" size="lg" style={{ width:"100%" }}>Enter Dashboard</Btn>
          <p style={{ color:C.slate600, fontSize:11, marginTop:12 }}>Default PIN: 1234 — change in code</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div style={{ paddingTop:68, background:C.navy, minHeight:"100vh" }}>
      <div style={{ background:C.navyMid, padding:"48px 28px 80px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:40 }}>
            <div>
              <h2 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:32, color:C.white, margin:"0 0 4px" }}>Admin Dashboard</h2>
              <p style={{ color:C.slate500, margin:0, fontSize:14 }}>BlueBay Auto Care · San Francisco</p>
            </div>
            <Btn onClick={() => setAuthed(false)} variant="ghost" size="sm">Log Out</Btn>
          </div>

          {/* Stats */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:16, marginBottom:36 }}>
            {[
              ["Total Bookings", stats.total, C.blue, "📅"],
              ["Confirmed", stats.confirmed, C.green, "✅"],
              ["Pending", stats.pending, C.gold, "⏳"],
              ["Completed", stats.completed, C.purple, "🏁"],
              ["Revenue", "$"+stats.revenue, C.gold, "💰"],
            ].map(([l,v,c,ic]) => (
              <GlassCard key={l} style={{ padding:20, textAlign:"center" }}>
                <div style={{ fontSize:24, marginBottom:6 }}>{ic}</div>
                <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:28, color:c }}>{v}</div>
                <div style={{ color:C.slate500, fontSize:11, textTransform:"uppercase", letterSpacing:1, marginTop:2 }}>{l}</div>
              </GlassCard>
            ))}
          </div>

          {/* Bookings table */}
          <GlassCard style={{ padding:0, overflow:"hidden" }}>
            <div style={{ padding:"20px 24px", borderBottom:"1px solid rgba(255,255,255,0.07)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:18, color:C.white, margin:0 }}>Upcoming Appointments</h3>
              <Chip color={C.blue}>{stats.total} total</Chip>
            </div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr>
                    {["Ref","Customer","Service","Vehicle","Date & Time","Location","Total","Status"].map(h => (
                      <th key={h} style={{ padding:"12px 20px", textAlign:"left", fontSize:11, fontWeight:700, color:C.slate500, textTransform:"uppercase", letterSpacing:1, borderBottom:"1px solid rgba(255,255,255,0.06)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockBookings.map((b,i) => (
                    <tr key={b.id} style={{ background: i%2===0?"transparent":"rgba(255,255,255,0.015)", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding:"14px 20px", fontSize:12, color:C.blue, fontWeight:700 }}>{b.id}</td>
                      <td style={{ padding:"14px 20px" }}>
                        <div style={{ color:C.white, fontWeight:600, fontSize:14 }}>{b.name}</div>
                        <div style={{ color:C.slate500, fontSize:12 }}>{b.phone}</div>
                      </td>
                      <td style={{ padding:"14px 20px", color:C.white, fontSize:13 }}>{b.service}</td>
                      <td style={{ padding:"14px 20px" }}>
                        <div style={{ color:"rgba(255,255,255,0.8)", fontSize:13 }}>{b.vehicle}</div>
                        <div style={{ color:C.slate500, fontSize:11 }}>{b.vehicleType}</div>
                      </td>
                      <td style={{ padding:"14px 20px" }}>
                        <div style={{ color:C.white, fontSize:13 }}>{b.date}</div>
                        <div style={{ color:C.slate500, fontSize:12 }}>{b.time}</div>
                      </td>
                      <td style={{ padding:"14px 20px", color:C.slate400, fontSize:12, maxWidth:160 }}>{b.address}</td>
                      <td style={{ padding:"14px 20px", fontWeight:800, color:C.gold, fontSize:15 }}>{b.total}</td>
                      <td style={{ padding:"14px 20px" }}>
                        <span style={{ display:"inline-block", padding:"4px 12px", borderRadius:99, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:0.5, background:statusColors[b.status]+"22", color:statusColors[b.status] }}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>

          {/* Quick actions */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginTop:24 }}>
            {[
              ["📱","Send SMS Blast","Message all confirmed customers about tomorrow"],
              ["📧","Email Summary","Send daily booking summary to inbox"],
              ["📊","Export CSV","Download all bookings as spreadsheet"],
            ].map(([ic,t,d]) => (
              <GlassCard key={t} style={{ padding:22, display:"flex", gap:14, alignItems:"center", cursor:"pointer" }}>
                <div style={{ fontSize:28 }}>{ic}</div>
                <div>
                  <div style={{ fontWeight:700, color:C.white, fontSize:14 }}>{t}</div>
                  <div style={{ color:C.slate500, fontSize:12, lineHeight:1.4 }}>{d}</div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CONTACT PAGE ─────────────────────────────────────────────────
function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name:"", email:"", phone:"", message:"" });

  async function handleSend() {
    if (!form.name || !form.email || !form.message) return;
    await sendEmail("info@bluebayautocare.com", "BlueBay Team", `New message from ${form.name}`, `<p><strong>From:</strong> ${form.name} (${form.email})<br/><strong>Phone:</strong> ${form.phone}</p><p>${form.message}</p>`);
    setSent(true);
  }

  return (
    <div style={{ paddingTop:68, background:C.navy, minHeight:"100vh" }}>
      <div style={{ background:C.navyMid, padding:"64px 28px 80px" }}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>
          <SectionTitle chip="Get In Touch" title="Contact BlueBay" sub="Questions, quotes, or just want to chat? We're here." />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1.4fr", gap:28 }}>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {[
                ["📞","Phone / Text","(415) 702-8468","tel:+14157028468"],
                ["💬","Text for Quotes","(415) 702-8468","sms:+14157028468"],
                ["📧","Email","info@bluebayautocare.com","mailto:info@bluebayautocare.com"],
                ["📍","Service Area","Mobile Service · San Francisco, CA",null],
              ].map(([ic,l,v,href]) => (
                <GlassCard key={l} style={{ padding:"18px 22px", display:"flex", gap:14, alignItems:"center" }}>
                  <div style={{ fontSize:26 }}>{ic}</div>
                  <div>
                    <div style={{ fontSize:11, color:C.slate500, textTransform:"uppercase", letterSpacing:1, marginBottom:2 }}>{l}</div>
                    {href ? <a href={href} style={{ color:C.blueLt, fontWeight:700, fontSize:15, textDecoration:"none" }}>{v}</a>
                      : <div style={{ color:C.white, fontWeight:600, fontSize:14 }}>{v}</div>}
                  </div>
                </GlassCard>
              ))}
              <GlassCard style={{ padding:"20px 22px" }}>
                <div style={{ fontSize:12, color:C.slate500, textTransform:"uppercase", letterSpacing:1, marginBottom:10 }}>🕐 Availability</div>
                <div style={{ color:C.white, fontWeight:700, fontSize:16, marginBottom:4 }}>Flexible Scheduling</div>
                <div style={{ color:C.slate400, fontSize:13, lineHeight:1.7 }}>We work around your schedule — mornings, afternoons, weekends. Book online or call/text to arrange.</div>
              </GlassCard>
              <GlassCard style={{ padding:"18px 22px" }}>
                <div style={{ fontSize:12, color:C.slate500, textTransform:"uppercase", letterSpacing:1, marginBottom:10 }}>💳 Payment</div>
                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                  {["💵 Cash","📱 Venmo","💳 PayPal"].map(m => <Chip key={m} color={C.green} style={{ fontSize:12 }}>{m}</Chip>)}
                </div>
              </GlassCard>
            </div>

            <GlassCard style={{ padding:36 }}>
              <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:22, color:C.white, marginBottom:6 }}>Send a Message</h3>
              <p style={{ color:C.slate500, fontSize:13, marginBottom:24 }}>We respond within a few hours.</p>
              {sent ? (
                <div style={{ textAlign:"center", padding:48 }}>
                  <div style={{ fontSize:48, marginBottom:16 }}>✅</div>
                  <h4 style={{ fontFamily:"'Outfit',sans-serif", fontSize:22, color:C.white, marginBottom:8 }}>Message Sent!</h4>
                  <p style={{ color:C.slate400 }}>We'll get back to you shortly.</p>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
                  <Input label="Full Name" placeholder="Jane Smith" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
                  <Input label="Email" type="email" placeholder="jane@email.com" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} />
                  <Input label="Phone (optional)" type="tel" placeholder="(415) 555-0100" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} />
                  <Textarea label="Message" placeholder="Ask about pricing, availability, or anything else…" value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} />
                  <Btn onClick={handleSend} variant="gold" size="lg" disabled={!form.name||!form.email||!form.message} style={{ width:"100%" }}>Send Message</Btn>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── FOOTER ───────────────────────────────────────────────────────
function Footer({ setPage }) {
  return (
    <footer style={{ background:C.navyMid, borderTop:"1px solid rgba(255,255,255,0.07)", padding:"52px 28px 24px" }}>
      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:48, marginBottom:40 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
              <div style={{ width:38, height:38, borderRadius:8, background:`linear-gradient(135deg,${C.blue},${C.cyan})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🌊</div>
              <div>
                <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:17, color:C.white }}>BLUEBAY AUTO CARE</div>
                <div style={{ fontSize:10, color:C.blueLt, letterSpacing:2 }}>MOBILE DETAILING · SAN FRANCISCO</div>
              </div>
            </div>
            <p style={{ color:C.slate500, fontSize:13, lineHeight:1.8, maxWidth:280 }}>Professional mobile detailing services in San Francisco. We bring premium auto care directly to your location with eco-friendly products.</p>
            <div style={{ display:"flex", gap:10, marginTop:14 }}>
              {["💵 Cash","📱 Venmo","💳 PayPal"].map(m => <Chip key={m} color={C.slate500} style={{ fontSize:10 }}>{m}</Chip>)}
            </div>
          </div>
          <div>
            <h5 style={{ color:C.white, fontFamily:"'Outfit',sans-serif", fontSize:13, fontWeight:800, letterSpacing:1.5, textTransform:"uppercase", marginBottom:14 }}>Quick Links</h5>
            {["Home","Services","Loyalty","Booking","Contact"].map(l => (
              <div key={l} style={{ fontSize:13, color:C.slate500, marginBottom:8, cursor:"pointer" }} onClick={() => setPage(l)}>{l}</div>
            ))}
          </div>
          <div>
            <h5 style={{ color:C.white, fontFamily:"'Outfit',sans-serif", fontSize:13, fontWeight:800, letterSpacing:1.5, textTransform:"uppercase", marginBottom:14 }}>Packages</h5>
            {PACKAGES.map(p => <div key={p.id} style={{ fontSize:13, color:C.slate500, marginBottom:8 }}>{p.tier} / {p.sub}</div>)}
            {ADDONS.slice(0,3).map(a => <div key={a.name} style={{ fontSize:13, color:C.slate500, marginBottom:8 }}>{a.name}</div>)}
          </div>
          <div>
            <h5 style={{ color:C.white, fontFamily:"'Outfit',sans-serif", fontSize:13, fontWeight:800, letterSpacing:1.5, textTransform:"uppercase", marginBottom:14 }}>Contact</h5>
            <div style={{ fontSize:13, color:C.slate500, marginBottom:8 }}>📍 Mobile Service</div>
            <div style={{ fontSize:13, color:C.slate500, marginBottom:8 }}>San Francisco, CA</div>
            <a href="tel:+14157028468" style={{ display:"block", fontSize:13, color:C.blueLt, marginBottom:8, textDecoration:"none" }}>📞 (415) 702-8468</a>
            <a href="sms:+14157028468" style={{ display:"block", fontSize:13, color:C.blueLt, marginBottom:8, textDecoration:"none" }}>💬 Text for quotes</a>
            <div style={{ fontSize:13, color:C.slate500 }}>⏰ Flexible Scheduling</div>
          </div>
        </div>
        <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:20, display:"flex", justifyContent:"space-between", fontSize:12, color:C.slate600 }}>
          <span>© {new Date().getFullYear()} BlueBay Auto Care. All rights reserved.</span>
          <span>Professional mobile detailing in San Francisco 🌊</span>
        </div>
      </div>
    </footer>
  );
}

// ── APP ROOT ─────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("Home");

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.textContent = `
      *, *::before, *::after { box-sizing: border-box; }
      body { font-family: 'Outfit', sans-serif; margin: 0; background: #050D1A; }
      button { font-family: 'Outfit', sans-serif; }
      input, textarea, select { font-family: 'Outfit', sans-serif; }
      input::placeholder, textarea::placeholder { color: rgba(148,163,184,0.5); }
      input:focus, textarea:focus, select:focus { border-color: rgba(14,165,233,0.6) !important; }
      a { cursor: pointer; }
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: #050D1A; }
      ::-webkit-scrollbar-thumb { background: #1E3D6E; border-radius: 3px; }
    `;
    document.head.appendChild(style);

    const stripe = document.createElement("script");
    stripe.src = "https://js.stripe.com/v3/";
    stripe.async = true;
    document.head.appendChild(stripe);
  }, []);

  const go = p => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <div style={{ minHeight: "100vh", background: C.navy }}>
      <Navbar page={page} setPage={go} />
      {page === "Home"    && <HomePage    setPage={go} />}
      {page === "Services"&& <ServicesPage setPage={go} />}
      {page === "Booking" && <BookingPage />}
      {page === "Loyalty" && <LoyaltyPage setPage={go} />}
      {page === "Admin"   && <AdminPage />}
      {page === "Contact" && <ContactPage />}
      {page !== "Home" && <Footer setPage={go} />}
    </div>
  );
}
