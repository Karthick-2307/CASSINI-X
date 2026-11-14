import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Discovery } from "./pages/Discovery";
import { Reports } from "./pages/Reports";
import { About } from "./pages/About";
import { NotFound } from "./pages/NotFound";
import { features } from "./config/features";
import { Card, Button } from "./components/ui";

// Lazy / conditional imports for legacy pages
import { Dashboard } from "./pages/Dashboard";
import { Explorer } from "./pages/Explorer";
import { Analysis } from "./pages/Analysis";
import { Geology } from "./pages/Geology";
import { Mission } from "./pages/Mission";
import { Assistant } from "./pages/Assistant";

const MovedNotice: React.FC<{ featureName: string; destination?: string }> = ({
  featureName,
  destination = "/discovery",
}) => (
  <div className="py-16 flex items-center justify-center">
    <Card className="max-w-md w-full text-center space-y-4 p-8">
      <h2 className="text-xl font-heading font-semibold text-text-primary">
        Page Relocated
      </h2>
      <p className="text-sm text-text-muted leading-relaxed font-sans">
        The <strong>{featureName}</strong> workflow has been integrated into the Discovery workspace to provide a unified research workflow.
      </p>
      <div className="pt-2">
        <Link to={destination}>
          <Button variant="primary" size="md">
            Go to Discovery
          </Button>
        </Link>
      </div>
    </Card>
  </div>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="discovery" element={<Discovery />} />
          <Route path="reports" element={<Reports />} />
          <Route path="about" element={<About />} />

          {/* Feature-flagged legacy routes (no dead links) */}
          <Route
            path="dashboard"
            element={features.dashboard ? <Dashboard /> : <MovedNotice featureName="Dashboard" />}
          />
          <Route
            path="explorer"
            element={features.explorer ? <Explorer /> : <MovedNotice featureName="Planetary Explorer" />}
          />
          <Route
            path="analysis"
            element={features.analysis ? <Analysis /> : <MovedNotice featureName="Similarity Analysis" />}
          />
          <Route
            path="geology"
            element={features.geology ? <Geology /> : <MovedNotice featureName="Geological Resources" />}
          />
          <Route
            path="mission"
            element={features.mission ? <Mission /> : <MovedNotice featureName="Mission Planning" />}
          />
          <Route
            path="assistant"
            element={features.assistant ? <Assistant /> : <MovedNotice featureName="Scientific Assistant" />}
          />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
