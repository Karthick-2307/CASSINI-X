import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Dashboard } from "./pages/Dashboard";
import { Discovery } from "./pages/Discovery";
import { Explorer } from "./pages/Explorer";
import { Analysis } from "./pages/Analysis";
import { Geology } from "./pages/Geology";
import { Mission } from "./pages/Mission";
import { Reports } from "./pages/Reports";
import { About } from "./pages/About";
import { NotFound } from "./pages/NotFound";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="discovery" element={<Discovery />} />
          <Route path="explorer" element={<Explorer />} />
          <Route path="analysis" element={<Analysis />} />
          <Route path="geology" element={<Geology />} />
          <Route path="mission" element={<Mission />} />
          <Route path="reports" element={<Reports />} />
          <Route path="about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
