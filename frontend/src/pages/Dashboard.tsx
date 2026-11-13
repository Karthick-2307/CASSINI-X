import React, { useEffect, useState } from "react";
import { api, Planet } from "../api/client";
import {
  Card,
  Badge,
  Button,
  LoadingSpinner,
  ErrorMessage,
  SectionHeading,
} from "../components/ui";

export const Dashboard: React.FC = () => {
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlanets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getPlanets();
      setPlanets(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to connect to ASTRA-X backend service.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanets();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <SectionHeading
          kicker="Mission Operations"
          title="Planetary Reference Dashboard"
          subtitle="System overview and verified reference bodies for analog discovery."
        />
        <Button variant="secondary" size="sm" onClick={fetchPlanets} className="self-start sm:self-auto">
          Refresh Connection
        </Button>
      </div>

      {loading && (
        <LoadingSpinner label="Querying planetary database (/api/planets)..." size="lg" />
      )}

      {error && (
        <ErrorMessage
          title="Backend Connection Offline"
          code="ERR_NETWORK_DISCONNECTED"
          message={error}
          onRetry={fetchPlanets}
        />
      )}

      {!loading && !error && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-semibold text-text-primary">
              Active Reference Bodies
            </h2>
            <Badge variant="ok">Live Synchronized</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {planets.map((planet) => (
              <Card key={planet.id} className="space-y-4 hover:border-accent-cyan/40 transition-colors">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-heading font-bold text-text-primary">{planet.name}</h3>
                  <Badge variant="measured">ID #{planet.id}</Badge>
                </div>

                <p className="text-xs text-text-muted leading-relaxed min-h-[3rem]">
                  {planet.description || "No description cataloged."}
                </p>

                <div className="pt-3 border-t border-border space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center text-text-muted">
                    <span>Mean Radius:</span>
                    <span className="text-text-primary font-semibold">
                      {(planet.mean_radius_m / 1000).toLocaleString()} km
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-text-muted">
                    <span>Surface Gravity:</span>
                    <span className="text-accent-cyan font-semibold">
                      {planet.gravity_ms2} m/s²
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
