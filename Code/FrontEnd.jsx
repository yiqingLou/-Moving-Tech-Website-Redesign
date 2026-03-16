import React, { useMemo, useState } from "react";

const services = [
  {
    id: 1,
    name: "RouteMind AI",
    category: "Logistics",
    provider: "MoveFlow",
    description:
      "Optimizes moving routes, crew assignments, and scheduling windows for higher efficiency.",
    pricing: "$149/mo",
    integrations: ["Google Maps", "Slack", "Zapier"],
    spec: "92% route efficiency improvement",
    bestFor: "Local and regional movers",
  },
  {
    id: 2,
    name: "LeadLift GPT",
    category: "Sales",
    provider: "PipelineOS",
    description:
      "Scores inbound moving leads, drafts follow-ups, and highlights the most likely conversions.",
    pricing: "$99/mo",
    integrations: ["HubSpot", "Gmail", "Salesforce"],
    spec: "89% lead scoring confidence",
    bestFor: "Sales and intake teams",
  },
  {
    id: 3,
    name: "ClaimGuard Vision",
    category: "Claims",
    provider: "InspectAI",
    description:
      "Uses computer vision to flag damage in item photos and assist with claims documentation.",
    pricing: "$229/mo",
    integrations: ["Dropbox", "Google Drive", "REST API"],
    spec: "95% image issue detection",
    bestFor: "Claims and QA teams",
  },
  {
    id: 4,
    name: "OpsPilot",
    category: "Operations",
    provider: "StackMove",
    description:
      "Monitors fleet, dispatch, and operational bottlenecks with AI-generated recommendations.",
    pricing: "$179/mo",
    integrations: ["QuickBooks", "Tableau", "Slack"],
    spec: "Real-time anomaly alerts",
    bestFor: "Operations managers",
  },
  {
    id: 5,
    name: "DocParse AI",
    category: "Admin",
    provider: "PaperLess",
    description:
      "Extracts and structures estimates, contracts, and customer forms into clean records.",
    pricing: "$79/mo",
    integrations: ["Google Drive", "DocuSign", "Airtable"],
    spec: "97% field extraction",
    bestFor: "Back office teams",
  },
  {
    id: 6,
    name: "CrewCoach",
    category: "Training",
    provider: "SkillForge",
    description:
      "AI assistant for onboarding, SOP retrieval, and training support for movers in the field.",
    pricing: "$129/mo",
    integrations: ["Notion", "Teams", "Mobile App"],
    spec: "24/7 SOP guidance",
    bestFor: "Field crews and trainers",
  },
];

const categories = [
  "All",
  "Logistics",
  "Sales",
  "Claims",
  "Operations",
  "Admin",
  "Training",
];

export default function App() {
  const [entered, setEntered] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  React.useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = windowWidth < 768;

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesCategory =
        category === "All" || service.category === category;
      const haystack =
        `${service.name} ${service.provider} ${service.description} ${service.bestFor} ${service.integrations.join(
          " "
        )}`.toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  return (
    <div style={styles.app}>
      {!entered ? (
        <div style={styles.landing}>
          <div style={styles.backgroundGlow1} />
          <div style={styles.backgroundGlow2} />

          <div
            style={{
              ...styles.heroWrap,
              padding: isMobile ? "28px 18px" : "40px 32px",
            }}
          >
            <div
              style={{
                ...styles.navRow,
                flexDirection: isMobile ? "column" : "row",
                alignItems: isMobile ? "flex-start" : "center",
                gap: isMobile ? 12 : 16,
              }}
            >
              <div style={styles.logoWrap}>
                <div style={styles.logoIcon}>AI</div>
                <div>
                  <div style={styles.logoTitle}>movingtech.ai</div>
                  <div style={styles.logoSubtitle}>
                    AI tools for the moving industry
                  </div>
                </div>
              </div>

              <div style={styles.marketplaceBadge}>Curated marketplace</div>
            </div>

            <div
              style={{
                ...styles.heroGrid,
                gridTemplateColumns: isMobile ? "1fr" : "1.1fr 0.9fr",
                gap: isMobile ? 28 : 36,
                marginTop: isMobile ? 28 : 40,
              }}
            >
              <div>
                <div style={styles.smallHeroBadge}>
                  Discover smarter tools for modern movers
                </div>

                <h1
                  style={{
                    ...styles.heroTitle,
                    fontSize: isMobile ? "52px" : "84px",
                    lineHeight: isMobile ? 0.95 : 0.92,
                    marginTop: 18,
                  }}
                >
                  movingtech.ai
                </h1>

                <h2
                  style={{
                    ...styles.heroSubtitle,
                    fontSize: isMobile ? "28px" : "42px",
                    lineHeight: 1.1,
                    marginTop: 18,
                  }}
                >
                  Find the best AI services built for moving companies.
                </h2>

                <p
                  style={{
                    ...styles.heroDescription,
                    fontSize: isMobile ? "18px" : "21px",
                    maxWidth: "780px",
                    marginTop: 18,
                  }}
                >
                  Browse AI tools for scheduling, sales, claims, operations, and
                  back-office automation — all in one polished marketplace
                  experience.
                </p>

                <div style={{ ...styles.buttonRow, marginTop: 28 }}>
                  <button
                    style={styles.primaryButton}
                    onClick={() => setEntered(true)}
                  >
                    Explore Services →
                  </button>
                </div>

                <div
                  style={{
                    ...styles.statsRow,
                    gridTemplateColumns: isMobile
                      ? "1fr"
                      : "repeat(3, minmax(0, 1fr))",
                    marginTop: 32,
                  }}
                >
                  <div style={styles.statCard}>
                    <div style={styles.statNumber}>50+</div>
                    <div style={styles.statLabel}>AI services listed</div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statNumber}>12</div>
                    <div style={styles.statLabel}>Categories covered</div>
                  </div>
                  <div style={styles.statCard}>
                    <div style={styles.statNumber}>100s</div>
                    <div style={styles.statLabel}>Hours saved</div>
                  </div>
                </div>
              </div>

              <div style={styles.previewShell}>
                <div style={styles.previewCard}>
                  <div style={styles.previewTop}>
                    <div>
                      <div style={styles.previewLabel}>Featured Workspace</div>
                      <div style={styles.previewTitle}>AI Vendor Explorer</div>
                    </div>
                    <div style={styles.liveBadge}>Live</div>
                  </div>

                  {services.slice(0, 3).map((service) => (
                    <div key={service.id} style={styles.previewItem}>
                      <div style={styles.previewItemTop}>
                        <div>
                          <div style={styles.previewItemTitle}>
                            {service.name}
                          </div>
                          <div style={styles.previewItemMeta}>
                            {service.category}
                          </div>
                        </div>
                        <div style={styles.previewPrice}>{service.pricing}</div>
                      </div>
                      <div style={styles.previewItemDesc}>
                        {service.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={styles.mainPage}>
          <div
            style={{
              ...styles.topBar,
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "flex-start" : "center",
            }}
          >
            <div>
              <div style={styles.smallLabel}>movingtech.ai</div>
              <h2 style={styles.mainTitle}>AI services marketplace</h2>
              <p style={styles.mainSubtitle}>
                Search, compare, and filter AI solutions built for moving
                businesses.
              </p>
            </div>

            <button
              style={styles.secondaryButton}
              onClick={() => setEntered(false)}
            >
              Back to Landing
            </button>
          </div>

          <div
            style={{
              ...styles.controls,
              gridTemplateColumns: isMobile ? "1fr" : "1fr 220px",
            }}
          >
            <input
              style={styles.search}
              placeholder="Search services, providers, integrations, or use cases..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              style={styles.select}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.resultsText}>
            Showing <strong>{filteredServices.length}</strong> result
            {filteredServices.length !== 1 ? "s" : ""}
          </div>

          <div
            style={{
              ...styles.grid,
              gridTemplateColumns: isMobile
                ? "1fr"
                : "repeat(auto-fit, minmax(320px, 1fr))",
            }}
          >
            {filteredServices.map((service) => (
              <div key={service.id} style={styles.card}>
                <div style={styles.cardTop}>
                  <div>
                    <h3 style={styles.cardTitle}>{service.name}</h3>
                    <div style={styles.provider}>by {service.provider}</div>
                  </div>
                  <div style={styles.categoryTag}>{service.category}</div>
                </div>

                <p style={styles.cardDescription}>{service.description}</p>

                <div style={styles.infoGrid}>
                  <div style={styles.infoBox}>
                    <div style={styles.infoLabel}>Pricing</div>
                    <div style={styles.infoValue}>{service.pricing}</div>
                  </div>
                  <div style={styles.infoBox}>
                    <div style={styles.infoLabel}>Best For</div>
                    <div style={styles.infoValue}>{service.bestFor}</div>
                  </div>
                </div>

                <div style={styles.fullInfoBox}>
                  <div style={styles.infoLabel}>Spec Highlight</div>
                  <div style={styles.infoValue}>{service.spec}</div>
                </div>

                <div>
                  <div style={styles.infoLabel}>Integrations</div>
                  <div style={styles.tags}>
                    {service.integrations.map((integration) => (
                      <span key={integration} style={styles.integrationTag}>
                        {integration}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredServices.length === 0 && (
            <div style={styles.noResults}>
              No services found. Try a different search or category.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },

  landing: {
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    background:
      "radial-gradient(circle at top right, rgba(59,130,246,0.22), transparent 25%), radial-gradient(circle at top left, rgba(16,185,129,0.12), transparent 18%), linear-gradient(180deg, #020617 0%, #0f172a 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "32px 20px",
    boxSizing: "border-box",
  },

  backgroundGlow1: {
    position: "absolute",
    width: "700px",
    height: "700px",
    borderRadius: "999px",
    background: "rgba(37,99,235,0.18)",
    filter: "blur(120px)",
    top: "-160px",
    right: "-180px",
    pointerEvents: "none",
  },

  backgroundGlow2: {
    position: "absolute",
    width: "500px",
    height: "500px",
    borderRadius: "999px",
    background: "rgba(16,185,129,0.1)",
    filter: "blur(120px)",
    bottom: "-120px",
    left: "-120px",
    pointerEvents: "none",
  },

  heroWrap: {
    width: "100%",
    maxWidth: "1380px",
    position: "relative",
    zIndex: 2,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "34px",
    boxShadow: "0 30px 80px rgba(0,0,0,0.38)",
    backdropFilter: "blur(12px)",
  },

  navRow: {
    display: "flex",
    justifyContent: "space-between",
  },

  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  logoIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.1)",
    color: "white",
    fontWeight: 800,
    letterSpacing: "0.04em",
  },

  logoTitle: {
    color: "white",
    fontSize: "22px",
    fontWeight: 700,
    lineHeight: 1.1,
  },

  logoSubtitle: {
    color: "#94a3b8",
    fontSize: "14px",
    marginTop: "4px",
  },

  marketplaceBadge: {
    padding: "10px 16px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#e2e8f0",
    fontSize: "14px",
  },

  heroGrid: {
    display: "grid",
    alignItems: "center",
  },

  smallHeroBadge: {
    display: "inline-block",
    background: "rgba(56,189,248,0.12)",
    color: "#bae6fd",
    border: "1px solid rgba(56,189,248,0.14)",
    padding: "10px 16px",
    borderRadius: "999px",
    fontSize: "14px",
    fontWeight: 500,
  },

  heroTitle: {
    color: "white",
    margin: 0,
    fontWeight: 800,
    letterSpacing: "-0.04em",
  },

  heroSubtitle: {
    color: "white",
    margin: 0,
    fontWeight: 700,
    maxWidth: "800px",
    letterSpacing: "-0.03em",
  },

  heroDescription: {
    color: "#cbd5e1",
    lineHeight: 1.7,
    marginBottom: 0,
  },

  buttonRow: {
    display: "flex",
    gap: "14px",
    flexWrap: "wrap",
  },

  primaryButton: {
    background: "white",
    color: "#0f172a",
    border: "none",
    borderRadius: "18px",
    padding: "16px 24px",
    fontSize: "17px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 10px 30px rgba(255,255,255,0.08)",
  },

  statsRow: {
    display: "grid",
    gap: "16px",
  },

  statCard: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "22px",
    padding: "22px",
  },

  statNumber: {
    fontSize: "38px",
    fontWeight: 800,
    color: "white",
    marginBottom: "6px",
  },

  statLabel: {
    color: "#cbd5e1",
    fontSize: "15px",
  },

  previewShell: {
    position: "relative",
  },

  previewCard: {
    background: "rgba(2,6,23,0.7)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "28px",
    padding: "22px",
    boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
  },

  previewTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "18px",
  },

  previewLabel: {
    color: "#94a3b8",
    fontSize: "14px",
    marginBottom: "6px",
  },

  previewTitle: {
    color: "white",
    fontSize: "24px",
    fontWeight: 700,
  },

  liveBadge: {
    background: "rgba(16,185,129,0.15)",
    color: "#86efac",
    borderRadius: "999px",
    padding: "8px 12px",
    fontSize: "14px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  previewItem: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "20px",
    padding: "16px",
    marginBottom: "14px",
  },

  previewItemTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "flex-start",
    marginBottom: "10px",
  },

  previewItemTitle: {
    color: "white",
    fontSize: "17px",
    fontWeight: 700,
  },

  previewItemMeta: {
    color: "#94a3b8",
    fontSize: "13px",
    marginTop: "4px",
  },

  previewPrice: {
    color: "#7dd3fc",
    fontSize: "14px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  previewItemDesc: {
    color: "#cbd5e1",
    fontSize: "14px",
    lineHeight: 1.6,
  },

  mainPage: {
    minHeight: "100vh",
    background: "#f8fafc",
    padding: "32px 20px 50px",
  },

  topBar: {
    maxWidth: "1200px",
    margin: "0 auto 24px auto",
    background: "#0f172a",
    color: "white",
    borderRadius: "28px",
    padding: "28px",
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    boxShadow: "0 20px 40px rgba(15,23,42,0.22)",
  },

  smallLabel: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.18em",
    color: "#94a3b8",
    marginBottom: "8px",
  },

  mainTitle: {
    margin: "0 0 8px 0",
    fontSize: "34px",
    color: "white",
  },

  mainSubtitle: {
    margin: 0,
    color: "#cbd5e1",
    fontSize: "16px",
  },

  secondaryButton: {
    background: "#e2e8f0",
    color: "#0f172a",
    border: "none",
    borderRadius: "14px",
    padding: "12px 18px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    height: "fit-content",
  },

  controls: {
    maxWidth: "1200px",
    margin: "0 auto 18px auto",
    display: "grid",
    gap: "14px",
  },

  search: {
    width: "100%",
    padding: "15px 16px",
    fontSize: "16px",
    borderRadius: "16px",
    border: "1px solid #cbd5e1",
    outline: "none",
    boxSizing: "border-box",
    background: "white",
  },

  select: {
    width: "100%",
    padding: "15px 16px",
    fontSize: "16px",
    borderRadius: "16px",
    border: "1px solid #cbd5e1",
    outline: "none",
    background: "white",
  },

  resultsText: {
    maxWidth: "1200px",
    margin: "0 auto 18px auto",
    color: "#475569",
    fontSize: "16px",
  },

  grid: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gap: "20px",
  },

  card: {
    background: "white",
    borderRadius: "24px",
    padding: "22px",
    boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
    border: "1px solid #e2e8f0",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "flex-start",
    marginBottom: "14px",
  },

  cardTitle: {
    margin: "0 0 6px 0",
    fontSize: "22px",
    color: "#0f172a",
  },

  provider: {
    color: "#64748b",
    fontSize: "14px",
  },

  categoryTag: {
    background: "#eef2ff",
    color: "#3730a3",
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  cardDescription: {
    color: "#475569",
    lineHeight: 1.6,
    fontSize: "15px",
    marginBottom: "16px",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "12px",
  },

  infoBox: {
    background: "#f8fafc",
    borderRadius: "16px",
    padding: "14px",
  },

  fullInfoBox: {
    background: "#f8fafc",
    borderRadius: "16px",
    padding: "14px",
    marginBottom: "12px",
  },

  infoLabel: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#94a3b8",
    marginBottom: "6px",
    fontWeight: 700,
  },

  infoValue: {
    color: "#0f172a",
    fontWeight: 700,
    fontSize: "15px",
  },

  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "8px",
  },

  integrationTag: {
    background: "#e2e8f0",
    color: "#1e293b",
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 600,
  },

  noResults: {
    maxWidth: "1200px",
    margin: "24px auto 0 auto",
    background: "white",
    border: "1px dashed #cbd5e1",
    borderRadius: "24px",
    padding: "28px",
    textAlign: "center",
    color: "#64748b",
  },
};
