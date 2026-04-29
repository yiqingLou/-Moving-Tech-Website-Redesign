import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar';
import LandingPage from './pages/landingPage';
import DirectoryPage from './pages/directoryPage';
import SoftwareDetailPage from './pages/softwareDetailPage';
import "./styles/global.css";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/directory" element={<DirectoryPage />} />
        <Route path="/software/:id" element={<SoftwareDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}