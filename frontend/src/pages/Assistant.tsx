import React, { useState, useEffect } from "react";
import {
  SectionHeading,
  Card,
  Badge,
  Button,
  LoadingSpinner,
} from "../components/ui";
import {
  api,
  Region,
  AnalysisSummaryItem,
  AssistantQueryResponse,
} from "../api/client";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  intent?: string;
  engine?: string;
  sources?: Array<{ title: string; ref: string }>;
}

export const Assistant: React.FC = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [analyses, setAnalyses] = useState<AnalysisSummaryItem[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<number | null>(null);
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "intro",
      sender: "assistant",
      text: "Welcome to the ASTRA-X Scientific Assistant. I operate deterministically directly from the ingested SQLite database records, elevation rasters, and dataset provenance tables. I strictly refuse to invent or hallucinate answers outside our catalog.\n\nAsk me to summarise candidates, explain similarity scores, compare planetary regions, describe dataset limitations, or check available data.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      intent: "system_greeting",
      engine: "deterministic_database",
      sources: [{ title: "ASTRA-X Data Catalog", ref: "sqlite:astrax.db" }],
    },
  ]);

  // Load context options
  useEffect(() => {
    async function loadContext() {
      try {
        const [regList, anList] = await Promise.all([
          api.getRegions(),
          api.getAnalyses(),
        ]);
        setRegions(regList);
        setAnalyses(anList);
        if (regList.length > 0) setSelectedRegionId(regList[0].id);
        if (anList.length > 0) setSelectedAnalysisId(anList[0].id);
      } catch (err) {
        console.error("Context load error:", err);
      }
    }
    loadContext();
  }, []);

  const handleSend = async (userQuery?: string) => {
    const textToSend = (userQuery || query).trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setLoading(true);

    try {
      const res: AssistantQueryResponse = await api.queryAssistant({
        query: textToSend,
        region_id: selectedRegionId || undefined,
        analysis_id: selectedAnalysisId || undefined,
      });

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: "assistant",
        text: res.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        intent: res.intent,
        engine: res.engine,
        sources: res.sources,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const errorMsg: ChatMessage = {
        id: `e-${Date.now()}`,
        sender: "assistant",
        text: `Error querying scientific database: ${err instanceof Error ? err.message : "Unknown error"}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        intent: "error",
        engine: "error_handler",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQueries = [
    "Summarise the top candidates",
    "Explain score for candidate 1",
    "Compare Lanzarote and Jezero Crater",
    "What are the dataset limitations?",
    "What data is available for Jezero Crater?",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <SectionHeading
          kicker="Scientific Decision Support"
          title="ASTRA-X Scientific Assistant"
          subtitle="Grounded query engine operating without hallucination: answers constructed exclusively from database records and real rasters."
        />
        <div className="flex items-center space-x-2">
          <Badge variant="ok">Part 7D Active</Badge>
          <Badge variant="neutral">Deterministic</Badge>
        </div>
      </div>

      {/* Advisory Banner */}
      <div className="p-3 bg-panel border border-border rounded-panel text-xs text-text-muted flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-accent-cyan" />
          <span>
            Strict Provenance Rule: If information does not exist in the ingested database tables, the assistant explicitly states that the data is unavailable.
          </span>
        </div>
        <Badge variant="ok">Zero Fabrication</Badge>
      </div>

      {/* Optional Context Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-panel border border-border rounded-panel text-xs font-mono">
        <div className="space-y-1">
          <label className="text-text-muted uppercase text-[11px] font-semibold">
            Context Region (Optional)
          </label>
          <select
            value={selectedRegionId || ""}
            onChange={(e) => setSelectedRegionId(Number(e.target.value) || null)}
            className="w-full bg-raised border border-border rounded-btn px-3 py-1.5 text-text-primary focus:outline-none focus:border-accent-cyan"
          >
            <option value="">None (Auto-detect from query)</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.planet_id === 1 ? "Earth" : r.planet_id === 2 ? "Mars" : "Moon"})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-text-muted uppercase text-[11px] font-semibold">
            Context Analysis (Optional)
          </label>
          <select
            value={selectedAnalysisId || ""}
            onChange={(e) => setSelectedAnalysisId(Number(e.target.value) || null)}
            className="w-full bg-raised border border-border rounded-btn px-3 py-1.5 text-text-primary focus:outline-none focus:border-accent-cyan"
          >
            <option value="">None (Auto-detect latest)</option>
            {analyses.map((an) => (
              <option key={an.id} value={an.id}>
                Analysis #{an.id}: {an.target_region_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sample Question Chips */}
      <div className="space-y-2">
        <span className="text-xs font-mono text-text-muted">Quick Scientific Queries:</span>
        <div className="flex flex-wrap gap-2">
          {sampleQueries.map((sq, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(sq)}
              className="text-xs font-mono px-3 py-1.5 bg-panel border border-border rounded-full hover:border-accent-cyan/80 text-text-primary hover:text-accent-cyan transition-colors"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Stream */}
      <Card className="min-h-[420px] max-h-[600px] overflow-y-auto space-y-4 p-4 border-border flex flex-col justify-between">
        <div className="space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-3xl rounded-panel p-4 space-y-2 text-xs leading-relaxed ${
                  m.sender === "user"
                    ? "bg-accent-cyan/10 border border-accent-cyan/30 text-text-primary"
                    : "bg-raised border border-border text-text-primary"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-text-muted pb-1 border-b border-border/40">
                  <span className="font-bold uppercase tracking-wider">
                    {m.sender === "user" ? "Scientist Query" : "ASTRA-X Engine"}
                  </span>
                  <span>{m.timestamp}</span>
                </div>

                <div className="whitespace-pre-line font-sans">{m.text}</div>

                {/* Retrieved Sources & Intent */}
                {m.sender === "assistant" && m.sources && m.sources.length > 0 && (
                  <div className="pt-2 border-t border-border/40 space-y-1.5">
                    <div className="flex items-center space-x-2 text-[10px] font-mono text-text-muted">
                      <span>Intent: {m.intent}</span>
                      <span>•</span>
                      <span>Engine: {m.engine}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.sources.map((src, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 bg-panel border border-border rounded text-[10px] font-mono text-accent-cyan"
                        >
                          {src.title} ({src.ref})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-xs font-mono text-text-muted p-3 bg-raised rounded-btn border border-border w-fit">
              <LoadingSpinner size="sm" />
              <span>Querying database records and feature vectors...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="pt-4 border-t border-border flex items-center space-x-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about candidate scores, region comparisons, dataset limitations..."
            className="flex-1 bg-raised border border-border rounded-btn px-4 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-cyan font-sans"
            disabled={loading}
          />
          <Button type="submit" variant="primary" size="sm" disabled={loading || !query.trim()}>
            Send
          </Button>
        </form>
      </Card>
    </div>
  );
};
