import React, { useEffect, useState } from "react";
import { api, Planet } from "../api/client";

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Planetary Dashboard</h1>
          <p className="text-sm text-gray-400">
            System overview and verified reference bodies for analog discovery.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchPlanets}
          className="self-start sm:self-auto px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-cyan-400 border border-gray-700 rounded text-sm transition-colors"
        >
          Refresh Connection
        </button>
      </div>

      {loading && (
        <div className="p-8 text-center text-gray-400 bg-gray-900/50 rounded-lg border border-gray-800">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mb-3"></div>
          <p>Connecting to ASTRA-X backend (/api/planets)...</p>
        </div>
      )}

      {error && (
        <div className="p-6 bg-red-950/40 border border-red-800 rounded-lg text-red-200 space-y-2">
          <div className="flex items-center space-x-2 text-red-400 font-semibold">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>Backend Connection Error</span>
          </div>
          <p className="text-sm">{error}</p>
          <p className="text-xs text-red-400">
            Ensure FastAPI server is running with: <code className="bg-red-900/60 px-1 py-0.5 rounded font-mono">uvicorn app.main:app --reload</code>
          </p>
        </div>
      )}

      {!loading && !error && (
        <div>
          <h2 className="text-lg font-semibold text-gray-200 mb-4">
            Available Planetary Reference Bodies ({planets.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {planets.map((planet) => (
              <div
                key={planet.id}
                className="bg-gray-900 border border-gray-800 rounded-lg p-5 space-y-3 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">{planet.name}</h3>
                  <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-gray-800 text-cyan-400 border border-gray-700">
                    ID #{planet.id}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{planet.description || "No description available."}</p>
                <div className="pt-2 border-t border-gray-800 space-y-1 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>Mean Radius:</span>
                    <span className="font-mono text-gray-200">
                      {(planet.mean_radius_m / 1000).toLocaleString()} km
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Surface Gravity:</span>
                    <span className="font-mono text-gray-200">
                      {planet.gravity_ms2} m/s²
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
