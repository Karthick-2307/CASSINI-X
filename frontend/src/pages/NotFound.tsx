import React from "react";
import { Link } from "react-router-dom";

export const NotFound: React.FC = () => {
  return (
    <div className="text-center py-16 space-y-4">
      <div className="text-6xl font-extrabold text-cyan-400 font-mono">404</div>
      <h1 className="text-2xl font-bold text-white">Coordinate Not Found</h1>
      <p className="text-gray-400 text-sm max-w-md mx-auto">
        The planetary sector or route you requested does not exist in the ASTRA-X navigation index.
      </p>
      <div className="pt-4">
        <Link
          to="/"
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-cyan-400 border border-gray-700 rounded text-sm transition-colors"
        >
          Return to Mission Home
        </Link>
      </div>
    </div>
  );
};
