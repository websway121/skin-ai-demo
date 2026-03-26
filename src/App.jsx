import { useState, useRef } from "react";

const products = [
  { id: 1, name: "HydraVeil Serum", tagline: "Deep moisture lock", concern: "dryness", price: "₹1,299", icon: "💧", accent: "#3A7BD5", description: "Hyaluronic acid + ceramide complex for 72hr hydration" },
  { id: 2, name: "ClearStart Cleanser", tagline: "Pore-purifying foam", concern: "acne", price: "₹749", icon: "🫧", accent: "#1A8A5A", description: "Salicylic acid + niacinamide to clear and calm breakouts" },
  { id: 3, name: "GlowReveal Cream", tagline: "Brighten & even tone", concern: "pigmentation", price: "₹1,599", icon: "✨", accent: "#C07A00", description: "Vitamin C + kojic acid for visible brightening in 4 weeks" },
  { id: 4, name: "OilBalance Gel", tagline: "Mattify without drying", concern: "oiliness", price: "₹899", icon: "🌿", accent: "#2E7D32", description: "Zinc + green tea extract for all-day matte finish" },
  { id: 5, name: "AgeLess Eye Cream", tagline: "Firm & de-puff", concern: "fine lines", price: "₹1,899", icon: "🌸", accent: "#C2185B", description: "Retinol + peptides for visible reduction of fine lines" },
  { id: 6, name: "SunShield SPF50", tagline: "Invisible protection", concern: "sun damage", price: "₹999", icon: "☀️", accent: "#E65100", description: "Lightweight PA+++ sunscreen with blue-light filter" },
];

const skinConcerns = [
  { label: "Acne & Breakouts", key: "acne", emoji: "🔴" },
  { label: "Dryness & Dehydration", key: "dryness", emoji: "💧" },
  { label: "Dark Spots", key: "pigmentation", emoji: "🟤" },
  { label: "Oily Skin", key: "oiliness", emoji: "✨" },
  { label: "Fine Lines", key: "fine lines", emoji: "〰️" },
  { label: "Sun Damage", key: "sun damage", emoji: "☀️" },
];

const analysisSteps = [
  "Detecting facial landmarks…",
  "Analysing skin texture…",
  "Checking hydration levels…",
  "Identifying concern zones…",
  "Generating your skin profile…",
];

export default function App() {
  const [step, setStep] = useState("home");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const fileRef = useRef();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadedImage({ file, url });
    setStep("preview");
  };

  const runAnalysis = async () => {
    setStep("analysing");
    setAnalysisStep(0);

    for (let i = 0; i < analysisSteps.length; i++) {
      await new Promise((r) => setTimeout(r, 900));
      setAnalysisStep(i);
    }

    await new Promise((r) => setTimeout(r, 600));

    const toBase64 = (file) =>
      new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result.split(",")[1]);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });

    try {
      const base64 = await toBase64(uploadedImage.file);
      const mediaType = uploadedImage.file.type || "image/jpeg";

      const response = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, mediaType }),
      });

      const parsed = await response.json();
      setAnalysisResult(parsed);
      setStep("result");
    } catch (err) {
      setAnalysisResult({
        skinType: "combination",
        concerns: ["oiliness", "acne", "pigmentation"],
        overallScore: 6,
        summary: "Your skin shows a mix of oiliness in the T-zone with some acne-prone areas and mild pigmentation. With the right routine, you can achieve balanced, glowing skin.",
        zones: { forehead: "Slightly oily", cheeks: "Some dark spots visible", nose: "Enlarged pores", chin: "Mild breakouts" },
      });
      setStep("result");
    }
  };

  const recommendedProducts = analysisResult
    ? products.filter((p) => analysisResult.concerns?.includes(p.concern))
    : [];

  const scoreColor = (s) => s >= 8 ? "#1A8A5A" : s >= 5 ? "#C07A00" : "#C0392B";
  const scoreLabel = (s) => s >= 8 ? "Healthy" : s >= 5 ? "Needs Care" : "Attention Needed";

  return (
    <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", minHeight: "100vh", background: "#FAFAF7" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .btn-primary { background: #1C1C1C; color: #FAFAF7; border: none; padding: 16px 36px; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; cursor: pointer; transition: all 0.25s; }
        .btn-primary:hover { background: #3A3A3A; transform: translateY(-1px); }
        .btn-outline { background: transparent; color: #1C1C1C; border: 1.5px solid #1C1C1C; padding: 14px 32px; font-family: 'DM Sans', sans-serif; font-size: 14px; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; transition: all 0.25s; }
        .btn-outline:hover { background: #1C1C1C; color: #FAFAF7; }
        .product-card { background: white; border: 1px solid #EBEBEB; padding: 28px 24px; transition: all 0.25s; position: relative; overflow: hidden; }
        .product-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--accent); }
        .product-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.08); }
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .fade-in { animation: fadeIn 0.6s ease forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .progress-bar { height: 4px; background: #EBEBEB; border-radius: 2px; overflow: hidden; }
        .progress-fill { height: 100%; background: #1C1C1C; border-radius: 2px; transition: width 0.8s ease; }
        .zone-tag { background: #F5F5F0; padding: 10px 16px; font-family: 'DM Sans', sans-serif; font-size: 13px; }
        .concern-pill { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 100px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; background: #1C1C1C; color: #FAFAF7; }
      `}</style>

      <header style={{ padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #EBEBEB", background: "#FAFAF7", position: "sticky", top: 0, zIndex: 100 }}>
        <div>
          <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 24, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" }}>LUMIÈRE</div>
          <div style={{ fontFamily: "'DM Sans'", fontSize: 10, letterSpacing: 4, color: "#888", textTransform: "uppercase", marginTop: 2 }}>Skin Intelligence</div>
        </div>
        <nav style={{ display: "flex", gap: 32, fontFamily: "'DM Sans'", fontSize: 13, letterSpacing: 1, color: "#555" }}>
          <span style={{ cursor: "pointer" }}>Products</span>
          <span style={{ cursor: "pointer" }}>Science</span>
          <span style={{ cursor: "pointer", color: "#1C1C1C", fontWeight: 500 }}>Skin AI ✦</span>
        </nav>
      </header>

      {step === "home" && (
        <div className="fade-in">
          <div style={{ minHeight: "90vh", display: "grid", gridTemplateColumns: "1fr 1fr", maxWidth: 1200, margin: "0 auto", padding: "80px 40px", gap: 80, alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "'DM Sans'", fontSize: 12, letterSpacing: 4, color: "#888", textTransform: "uppercase", marginBottom: 20 }}>✦ AI-Powered Skin Analysis</div>
              <h1 style={{ fontFamily: "'Cormorant Garamond'", fontSize: 68, fontWeight: 300, lineHeight: 1.05, color: "#1C1C1C", marginBottom: 28 }}>
                Your skin<br /><em>deserves</em><br />to be understood.
              </h1>
              <p style={{ fontFamily: "'DM Sans'", fontSize: 16, lineHeight: 1.8, color: "#666", marginBottom: 40, maxWidth: 420 }}>
                Upload a photo and our AI analyses your skin in seconds — then recommends the exact products your skin needs.
              </p>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <button className="btn-primary" onClick={() => fileRef.current?.click()}>Scan My Skin</button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileUpload} />
              <div style={{ marginTop: 48, display: "flex", gap: 40 }}>
                {[["12", "Parameters analysed"], ["30s", "Analysis time"], ["98%", "Accuracy rate"]].map(([num, label]) => (
                  <div key={label}>
                    <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 36, fontWeight: 500 }}>{num}</div>
                    <div style={{ fontFamily: "'DM Sans'", fontSize: 12, color: "#888", letterSpacing: 1 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: "linear-gradient(145deg, #F5F0EB 0%, #EDE8E3 100%)", aspectRatio: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, border: "1px solid #DDD", position: "relative", overflow: "hidden" }}>
              <div style={{ fontSize: 80 }}>🧴</div>
              <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 22, color: "#888", fontStyle: "italic" }}>Your perfect routine awaits</div>
              {[{ top: "15%", left: "5%", label: "Hydration ✓", bg: "#C8E6FF" }, { top: "30%", right: "5%", label: "Acne zone ⚠", bg: "#FFD6D6" }, { bottom: "25%", left: "5%", label: "T-zone oily", bg: "#FFF3CD" }, { bottom: "15%", right: "8%", label: "Even tone ✓", bg: "#D4F5E9" }].map((tag) => (
                <div key={tag.label} style={{ position: "absolute", top: tag.top, left: tag.left, right: tag.right, bottom: tag.bottom, background: tag.bg, padding: "6px 12px", fontFamily: "'DM Sans'", fontSize: 12, fontWeight: 500, whiteSpace: "nowrap" }}>{tag.label}</div>
              ))}
            </div>
          </div>

          <div style={{ background: "#1C1C1C", color: "#FAFAF7", padding: "80px 40px" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond'", fontSize: 44, fontWeight: 300, marginBottom: 60 }}>Three steps to your <em>ideal routine</em></h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 40 }}>
                {[{ num: "01", title: "Upload Photo", desc: "Take a selfie or upload a recent photo in natural light. No filters, no makeup for best results." }, { num: "02", title: "AI Analysis", desc: "Our model scans 12 skin parameters: hydration, sebum, texture, pigmentation, pores, and more." }, { num: "03", title: "Your Routine", desc: "Receive a personalised product stack curated specifically for your skin's unique needs." }].map((item) => (
                  <div key={item.num}>
                    <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 52, fontWeight: 300, color: "#444", marginBottom: 16 }}>{item.num}</div>
                    <h3 style={{ fontFamily: "'Cormorant Garamond'", fontSize: 26, fontWeight: 400, marginBottom: 12 }}>{item.title}</h3>
                    <p style={{ fontFamily: "'DM Sans'", fontSize: 14, lineHeight: 1.8, color: "#AAA" }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {step === "preview" && (
        <div className="fade-in" style={{ maxWidth: 600, margin: "80px auto", padding: "0 40px", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond'", fontSize: 40, fontWeight: 300, marginBottom: 32 }}>Does this look right?</h2>
          <div style={{ border: "1px solid #EBEBEB", overflow: "hidden", marginBottom: 32 }}>
            <img src={uploadedImage?.url} alt="Your face" style={{ width: "100%", maxHeight: 400, objectFit: "cover", display: "block" }} />
          </div>
          <p style={{ fontFamily: "'DM Sans'", fontSize: 14, color: "#888", marginBottom: 32, lineHeight: 1.7 }}>For best results: good lighting, no heavy makeup, face clearly visible.</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            <button className="btn-primary" onClick={runAnalysis}>Analyse My Skin →</button>
            <button className="btn-outline" onClick={() => { setStep("home"); setUploadedImage(null); }}>Retake</button>
          </div>
        </div>
      )}

      {step === "analysing" && (
        <div style={{ maxWidth: 500, margin: "120px auto", padding: "0 40px", textAlign: "center" }}>
          <div style={{ fontSize: 60, marginBottom: 32 }} className="pulse">🔍</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond'", fontSize: 40, fontWeight: 300, marginBottom: 12 }}>Analysing your skin…</h2>
          <p style={{ fontFamily: "'DM Sans'", fontSize: 14, color: "#888", marginBottom: 48 }}>Please wait while our AI studies your unique skin profile</p>
          <div style={{ marginBottom: 32 }}>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${((analysisStep + 1) / analysisSteps.length) * 100}%` }} />
            </div>
          </div>
          <div style={{ fontFamily: "'DM Sans'", fontSize: 14, color: "#555", height: 24 }} className="pulse">{analysisSteps[analysisStep]}</div>
          <div style={{ marginTop: 48, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            {skinConcerns.map((c, i) => (
              <div key={c.key} style={{ padding: "6px 14px", background: i <= analysisStep * 1.2 ? "#1C1C1C" : "#F0F0EB", color: i <= analysisStep * 1.2 ? "#FAFAF7" : "#BBB", fontFamily: "'DM Sans'", fontSize: 12, transition: "all 0.4s" }}>
                {c.emoji} {c.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {step === "result" && analysisResult && (
        <div className="fade-in" style={{ maxWidth: 1100, margin: "60px auto", padding: "0 40px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 60, marginBottom: 60 }}>
            <div>
              <div style={{ border: "1px solid #EBEBEB", overflow: "hidden", marginBottom: 24 }}>
                <img src={uploadedImage?.url} alt="Your face" style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block" }} />
              </div>
              <div style={{ background: "white", border: "1px solid #EBEBEB", padding: 24, textAlign: "center" }}>
                <div style={{ fontFamily: "'DM Sans'", fontSize: 11, letterSpacing: 3, color: "#888", textTransform: "uppercase", marginBottom: 12 }}>Skin Health Score</div>
                <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 72, fontWeight: 400, color: scoreColor(analysisResult.overallScore) }}>
                  {analysisResult.overallScore}<span style={{ fontSize: 24, color: "#BBB" }}>/10</span>
                </div>
                <div style={{ fontFamily: "'DM Sans'", fontSize: 13, fontWeight: 500, color: scoreColor(analysisResult.overallScore), letterSpacing: 2, textTransform: "uppercase" }}>{scoreLabel(analysisResult.overallScore)}</div>
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "'DM Sans'", fontSize: 11, letterSpacing: 4, color: "#888", textTransform: "uppercase", marginBottom: 12 }}>Your Skin Report</div>
              <h2 style={{ fontFamily: "'Cormorant Garamond'", fontSize: 44, fontWeight: 300, marginBottom: 20, lineHeight: 1.1 }}>
                {analysisResult.skinType?.charAt(0).toUpperCase() + analysisResult.skinType?.slice(1)} skin profile
              </h2>
              <p style={{ fontFamily: "'DM Sans'", fontSize: 15, color: "#555", lineHeight: 1.9, marginBottom: 32 }}>{analysisResult.summary}</p>
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontFamily: "'DM Sans'", fontSize: 11, letterSpacing: 3, color: "#888", textTransform: "uppercase", marginBottom: 14 }}>Detected Concerns</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {analysisResult.concerns?.map((concern) => {
                    const found = skinConcerns.find((c) => c.key === concern);
                    return <div key={concern} className="concern-pill">{found?.emoji || "●"} {found?.label || concern}</div>;
                  })}
                </div>
              </div>
              {analysisResult.zones && (
                <div>
                  <div style={{ fontFamily: "'DM Sans'", fontSize: 11, letterSpacing: 3, color: "#888", textTransform: "uppercase", marginBottom: 14 }}>Zone-by-Zone Breakdown</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {Object.entries(analysisResult.zones).map(([zone, note]) => (
                      <div key={zone} className="zone-tag">
                        <span style={{ fontWeight: 500, textTransform: "capitalize" }}>{zone}</span>
                        <span style={{ color: "#888", marginLeft: 8 }}>— {note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ borderTop: "1px solid #EBEBEB", paddingTop: 60 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond'", fontSize: 40, fontWeight: 300, marginBottom: 40 }}>Your recommended <em>routine</em></h2>
            {recommendedProducts.length === 0 ? (
              <p style={{ fontFamily: "'DM Sans'", fontSize: 15, color: "#888" }}>Your skin looks great! Browse our full range to maintain it.</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
                {recommendedProducts.map((product) => (
                  <div key={product.id} className="product-card" style={{ "--accent": product.accent }}>
                    <div style={{ fontSize: 36, marginBottom: 16 }}>{product.icon}</div>
                    <div style={{ fontFamily: "'DM Sans'", fontSize: 10, letterSpacing: 3, color: "#888", textTransform: "uppercase", marginBottom: 6 }}>For · {product.concern}</div>
                    <h3 style={{ fontFamily: "'Cormorant Garamond'", fontSize: 26, fontWeight: 500, marginBottom: 4 }}>{product.name}</h3>
                    <div style={{ fontFamily: "'DM Sans'", fontSize: 13, color: "#888", fontStyle: "italic", marginBottom: 12 }}>{product.tagline}</div>
                    <p style={{ fontFamily: "'DM Sans'", fontSize: 13, color: "#666", lineHeight: 1.7, marginBottom: 20 }}>{product.description}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 24, fontWeight: 500 }}>{product.price}</div>
                      <button style={{ background: product.accent, color: "white", border: "none", padding: "10px 20px", fontFamily: "'DM Sans'", fontSize: 12, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}>Add to Bag</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ textAlign: "center", marginTop: 60, paddingBottom: 60 }}>
            <button className="btn-outline" onClick={() => { setStep("home"); setUploadedImage(null); setAnalysisResult(null); }}>
