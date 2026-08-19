export interface SourceAppEntry {
  name: string;
  bundleIdentifier: string;
  developerName: string;
  version: string;
  versionDate: string;
  versionDescription?: string;
  downloadURL: string;
  localizedDescription?: string;
  iconURL?: string;
  size?: number;
  minOSVersion?: string;
}

/**
 * Generates an Apple OTA manifest.plist for Enterprise / Ad-hoc itms-services installation
 */
export function generateOtaManifestPlist(
  ipaHttpsUrl: string,
  bundleId: string,
  bundleVersion: string,
  appName: string,
  iconUrl?: string
): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>items</key>
  <array>
    <dict>
      <key>assets</key>
      <array>
        <dict>
          <key>kind</key>
          <string>software-package</string>
          <key>url</key>
          <string>${ipaHttpsUrl}</string>
        </dict>
        ${
          iconUrl
            ? `<dict>
          <key>kind</key>
          <string>display-image</string>
          <key>needs-shine</key>
          <true/>
          <key>url</key>
          <string>${iconUrl}</string>
        </dict>`
            : ''
        }
      </array>
      <key>metadata</key>
      <dict>
        <key>bundle-identifier</key>
        <string>${bundleId}</string>
        <key>bundle-version</key>
        <string>${bundleVersion}</string>
        <key>kind</key>
        <string>software</string>
        <key>title</key>
        <string>${appName}</string>
      </dict>
    </dict>
  </array>
</dict>
</plist>`;
}

/**
 * Generates an AltStore / SideStore JSON repository source
 */
export function generateAltStoreSource(
  sourceName: string,
  sourceIdentifier: string,
  apps: SourceAppEntry[]
): string {
  const altStoreObj = {
    name: sourceName,
    identifier: sourceIdentifier,
    subtitle: 'Repositorio de aplicaciones IPA personalizadas de GitHub',
    description: 'Fuente generada para AltStore y SideStore',
    website: 'https://github.com',
    apps: apps.map((app) => ({
      name: app.name,
      bundleIdentifier: app.bundleIdentifier,
      developerName: app.developerName || 'GitHub Open Source Developer',
      version: app.version,
      versionDate: app.versionDate || new Date().toISOString(),
      versionDescription: app.versionDescription || 'Última versión disponible en GitHub.',
      downloadURL: app.downloadURL,
      localizedDescription: app.localizedDescription || app.name,
      iconURL: app.iconURL || 'https://raw.githubusercontent.com/github/explore/main/topics/ios/ios.png',
      tintColor: '007AFF',
      size: app.size || 50000000,
      minOSVersion: app.minOSVersion || '14.0',
    })),
    news: [
      {
        title: '¡Fuente sincronizada con GitHub!',
        identifier: 'welcome-news',
        caption: 'IPAs listas para instalar con firmado automático.',
        date: new Date().toISOString(),
        tintColor: '007AFF',
      },
    ],
  };

  return JSON.stringify(altStoreObj, null, 2);
}

/**
 * Generates a Scarlet JSON repository
 */
export function generateScarletRepo(
  repoName: string,
  apps: SourceAppEntry[]
): string {
  const scarletObj = {
    META: {
      repoName: repoName,
      repoIcon: 'https://raw.githubusercontent.com/github/explore/main/topics/ios/ios.png',
      description: 'Repositorio de IPAs para Scarlet',
    },
    apps: apps.map((app) => ({
      name: app.name,
      bundle: app.bundleIdentifier,
      version: app.version,
      down: app.downloadURL,
      icon: app.iconURL || 'https://raw.githubusercontent.com/github/explore/main/topics/ios/ios.png',
      dev: app.developerName || 'Desarrollador GitHub',
      desc: app.localizedDescription || app.name,
    })),
  };

  return JSON.stringify(scarletObj, null, 2);
}
