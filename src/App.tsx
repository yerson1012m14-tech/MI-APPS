import React, { useState } from 'react';
import { ActiveTab } from './types';
import { Navbar } from './components/Navbar';
import { HomeDashboard } from './components/HomeDashboard';
import { SettingsView } from './components/SettingsView';
import { LicenseView } from './components/LicenseView';
import { AdminView } from './components/AdminView';
import { AccessGate, LicenseSession } from './components/AccessGate';
import { CyberBackground } from './components/CyberBackground';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

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

  if (!licenseSession) {
    return <AccessGate onUnlock={handleUnlock} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      <CyberBackground />

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        licenseSession={licenseSession}
        onLock={handleLock}
      />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-5 pb-28 relative z-10">
        {activeTab === 'home' && <HomeDashboard />}

        {activeTab === 'license' && (
          <LicenseView
            licenseSession={licenseSession}
            onLock={handleLock}
            onUpdateSession={handleUnlock}
          />
        )}

        {activeTab === 'settings' && <SettingsView />}

        {activeTab === 'admin' && <AdminView />}
      </main>
    </div>
  );
}
