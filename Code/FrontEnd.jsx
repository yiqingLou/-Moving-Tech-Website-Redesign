import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Bot, Search, ShieldCheck, Zap, Filter, BrainCircuit, Database, Globe, MessageSquare, Cpu } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const services = [
  {
    id: 1,
    name: "RouteMind AI",
    category: "Logistics",
    provider: "MoveFlow",
    description: "Optimizes moving routes, crew assignments, and scheduling windows for higher efficiency.",
    pricing: "$149/mo",
    integrations: ["Google Maps", "Slack", "Zapier"],
    accuracy: "92% route efficiency improvement",
    bestFor: "Local and regional movers",
    icon: Globe,
  },
  {
    id: 2,
    name: "LeadLift GPT",
    category: "Sales",
    provider: "PipelineOS",
    description: "Scores inbound moving leads, drafts follow-ups, and highlights the most likely conversions.",
    pricing: "$99/mo",
    integrations: ["HubSpot", "Gmail", "Salesforce"],
    accuracy: "89% lead scoring confidence",
    bestFor: "Sales and intake teams",
    icon: MessageSquare,
  },
  {
    id: 3,
    name: "ClaimGuard Vision",
    category: "Claims",
    provider: "InspectAI",
    description: "Uses computer vision to flag damage in item photos and assist with claims documentation.",
    pricing: "$229/mo",
    integrations: ["Dropbox", "Google Drive", "REST API"],
    accuracy: "95% image issue detection",
    bestFor: "Claims and QA teams",
    icon: ShieldCheck,
  },
  {
    id: 4,
    name: "OpsPilot",
    category: "Operations",
    provider: "StackMove",
    description: "Monitors fleet, dispatch, and operational bottlenecks with AI-generated recommendations.",
    pricing: "$179/mo",
    integrations: ["QuickBooks", "Tableau", "Slack"],
    accuracy: "Real-time anomaly alerts",
    bestFor: "Operations managers",
    icon: Zap,
  },
  {
    id: 5,
    name: "DocParse AI",
    category: "Admin",
    provider: "PaperLess",
    description: "Extracts and structures estimates, contracts, and customer forms into clean records.",
    pricing: "$79/mo",
    integrations: ["Google Drive", "DocuSign", "Airtable"],
    accuracy: "97% field extraction",
    bestFor: "Back office teams",
    icon: Database,
  },
  {
    id: 6,
    name: "CrewCoach",
    category: "Training",
    provider: "SkillForge",
    description: "AI assistant for onboarding, SOP retrieval, and training support for movers in the field.",
    pricing: "$129/mo",
    integrations: ["Notion", "Teams", "Mobile App"],
    accuracy: "24/7 SOP guidance",
    bestFor: "Field crews and trainers",
    icon: Cpu,
  },
];

const categories = ["All", "Logistics", "Sales", "Claims", "Operations", "Admin", "Training"];

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <div className="text-2xl font-semibold text-white md:text-3xl">{value}</div>
      <div className="mt-1 text-sm text-slate-300">{label}</div>
    </div>
  );
}

function ServiceCard({ service }) {
  const Icon = service.icon;

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <Card className="h-full rounded-3xl border-slate-200/60 bg-white/90 shadow-xl shadow-slate-200/50">
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-900 p-3 text-white">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl text-slate-900">{service.name}</CardTitle>
                <p className="text-sm text-slate-500">by {service.provider}</p>
              </div>
            </div>
            <Badge className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 hover:bg-slate-100">
              {service.category}
            </Badge>
          </div>
          <p className="text-sm leading-6 text-slate-600">{service.description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-3">
              <div className="text-xs font-medium uppercase tracking-wide text-slate-400">Pricing</div>
              <div className="mt-1 font-semibold text-slate-800">{service.pricing}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3">
              <div className="text-xs font-medium uppercase tracking-wide text-slate-400">Best For</div>
              <div className="mt-1 font-semibold text-slate-800">{service.bestFor}</div>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-3">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-400">Spec Highlight</div>
            <div className="mt-1 font-semibold text-slate-800">{service.accuracy}</div>
          </div>

          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Integrations</div>
            <div className="flex flex-wrap gap-2">
              {service.integrations.map((integration) => (
                <Badge key={integration} variant="secondary" className="rounded-full px-3 py-1">
                  {integration}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function MovingTechAIFrontend() {
  const [entered, setEntered] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesCategory = category === "All" || service.category === category;
      const haystack = `${service.name} ${service.provider} ${service.description} ${service.bestFor} ${service.integrations.join(" ")}`.toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <AnimatePresence mode="wait">
        {!entered ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.22),_transparent_28%),radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_24%),linear-gradient(to_bottom,_#020617,_#0f172a)]" />
            <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:52px_52px]" />

            <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8">
              <header className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-md">
                    <BrainCircuit className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold tracking-tight">movingtech.ai</div>
                    <div className="text-sm text-slate-400">AI tools for the moving industry</div>
                  </div>
                </div>
                <Badge className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-slate-200 hover:bg-white/5">
                  Curated marketplace
                </Badge>
              </header>

              <main className="grid flex-1 items-center gap-12 py-16 md:grid-cols-2 md:py-24">
                <div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-200"
                  >
                    <Bot className="h-4 w-4" />
                    Discover smarter tools for modern movers
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="mt-6 max-w-3xl text-5xl font-semibold leading-tight tracking-tight text-white md:text-7xl"
                  >
                    Find the best AI services built for moving companies.
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 max-w-2xl text-lg leading-8 text-slate-300"
                  >
                    Browse AI tools for scheduling, sales, claims, operations, and back-office automation — all in one polished marketplace experience.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="mt-8 flex flex-col gap-4 sm:flex-row"
                  >
                    <Button
                      onClick={() => setEntered(true)}
                      className="h-12 rounded-2xl bg-white px-6 text-base font-semibold text-slate-900 shadow-lg shadow-white/10 hover:bg-slate-100"
                    >
                      Explore Services
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 rounded-2xl border-white/15 bg-white/5 px-6 text-base text-white backdrop-blur-md hover:bg-white/10"
                    >
                      View Platform Overview
                    </Button>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-10 grid gap-4 sm:grid-cols-3"
                  >
                    <Stat label="AI services listed" value="50+" />
                    <Stat label="Categories covered" value="12" />
                    <Stat label="Time saved" value="100s hrs" />
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative"
                >
                  <div className="absolute -inset-6 rounded-[2rem] bg-cyan-400/10 blur-3xl" />
                  <div className="relative rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-xl">
                    <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <div className="text-sm text-slate-400">Featured Workspace</div>
                          <div className="text-xl font-semibold text-white">AI Vendor Explorer</div>
                        </div>
                        <div className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm text-emerald-300">Live</div>
                      </div>

                      <div className="grid gap-4">
                        {services.slice(0, 3).map((service) => {
                          const Icon = service.icon;
                          return (
                            <div key={service.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="rounded-xl bg-white/10 p-2">
                                    <Icon className="h-4 w-4 text-white" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-white">{service.name}</div>
                                    <div className="text-sm text-slate-400">{service.category}</div>
                                  </div>
                                </div>
                                <div className="text-sm font-medium text-cyan-300">{service.pricing}</div>
                              </div>
                              <div className="mt-3 text-sm text-slate-300">{service.description}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </main>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-slate-100"
          >
            <div className="mx-auto max-w-7xl px-6 py-8">
              <div className="mb-8 flex flex-col gap-4 rounded-[2rem] bg-slate-950 px-6 py-6 text-white shadow-2xl md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm uppercase tracking-[0.2em] text-slate-400">movingtech.ai</div>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight">AI services marketplace</h2>
                  <p className="mt-2 text-slate-300">Search, compare, and filter AI solutions built for moving businesses.</p>
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => setEntered(false)} variant="secondary" className="rounded-2xl px-5 py-2.5">
                    Back to Landing
                  </Button>
                </div>
              </div>

              <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_220px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search services, providers, integrations, or use cases..."
                    className="h-12 rounded-2xl border-slate-200 bg-white pl-11 text-base shadow-sm"
                  />
                </div>

                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-slate-500" />
                      <SelectValue placeholder="Filter by category" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-slate-900">Available services</h3>
                  <p className="mt-1 text-slate-500">
                    Showing <span className="font-semibold text-slate-800">{filteredServices.length}</span> result{filteredServices.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <motion.div layout className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                <AnimatePresence>
                  {filteredServices.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </AnimatePresence>
              </motion.div>

              {filteredServices.length === 0 && (
                <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                    <Search className="h-6 w-6 text-slate-500" />
                  </div>
                  <h4 className="mt-4 text-xl font-semibold text-slate-900">No services found</h4>
                  <p className="mt-2 text-slate-500">Try adjusting your search or choosing a different category.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
