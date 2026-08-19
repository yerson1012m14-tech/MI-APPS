import React, { useState } from 'react';
import { ActiveTab } from './types';
import { Navbar } from './components/Navbar';
import { HomeDashboard } from './components/HomeDashboard';
import { SettingsView } from './components/SettingsView';
import { LicenseView } from './components/LicenseView';
import { AccessGate, LicenseSession } from './components/AccessGate';
import { CyberBackground } from './components/CyberBackground';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  // License Session state
  const [licenseSession, setLicenseSession] = useState<LicenseSession | null>(() => {
    try {
      const stored = localStorage.getItem('xitforge_license_session');
      if (stored) return JSON.parse(stored);
    } catch {
      return null;
    }
    return null;
  });

  const handleUnlock = (session: LicenseSession) => {
    try {
      localStorage.setItem('xitforge_license_session', JSON.stringify(session));
      localStorage.setItem('ipa_hub_access_key', session.key);
    } catch (e) {
      console.error(e);
    }
    setLicenseSession(session);
  };

  const handleLock = () => {
    try {
      localStorage.removeItem('xitforge_license_session');
      localStorage.removeItem('ipa_hub_access_key');
    } catch (e) {
      console.error(e);
    }
    setLicenseSession(null);
  };

  // If no valid license session is set, show the XITFORGE Access Gate
  if (!licenseSession) {
    return <AccessGate onUnlock={handleUnlock} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      {/* Dynamic Animated Cyber Background (Rayos & Bolitas) */}
      <CyberBackground />

      {/* Top Header & Bottom iOS TabBar (🏠 Inicio, 🔑 Licencia & ⚙️ Ajustes) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        licenseSession={licenseSession}
        onLock={handleLock}
      />

      {/* Main Content Area - Native iOS Mobile & Tablet Layout */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-5 pb-28 relative z-10">
        {activeTab === 'home' && (
          <HomeDashboard />
        )}

        {activeTab === 'license' && (
          <LicenseView
            licenseSession={licenseSession}
            onLock={handleLock}
            onUpdateSession={handleUnlock}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView />
        )}
      </main>
    </div>
  );
}
