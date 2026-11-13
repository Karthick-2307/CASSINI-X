import React from "react";
import { Link } from "react-router-dom";
import { Button, GlassPanel } from "../components/ui";

export const NotFound: React.FC = () => {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <GlassPanel className="space-y-6 p-10 border-accent-cyan/30">
        <div className="text-6xl font-mono font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-blue">
          404
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Planetary Sector Not Cataloged
          </h1>
          <p className="text-sm text-text-muted leading-relaxed">
            The orbital coordinate or interface path requested does not match any index in the ASTRA-X navigation registry.
          </p>
        </div>
        <div className="pt-2">
          <Link to="/">
            <Button variant="primary" size="md">
              Return to Mission Home
            </Button>
          </Link>
        </div>
      </GlassPanel>
    </div>
  );
};
