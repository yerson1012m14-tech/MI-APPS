import JSZip from 'jszip';
import { InjectedDylib, ParsedIPA, ProvisioningInfo } from '../types';

/**
 * Calculates SHA-256 hash of a File or Blob
 */
export async function calculateSHA256(file: File | Blob): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    console.error('Error calculating SHA256:', err);
    return '';
  }
}

/**
 * Simple XML Plist parser
 */
function parseXmlPlist(xmlString: string): Record<string, any> {
  const result: Record<string, any> = {};
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    const dict = xmlDoc.querySelector('plist > dict');
    if (!dict) return result;

    const children = Array.from(dict.children);
    for (let i = 0; i < children.length; i += 2) {
      const keyElem = children[i];
      const valElem = children[i + 1];
      if (keyElem && keyElem.tagName === 'key' && valElem) {
        const key = keyElem.textContent?.trim() || '';
        result[key] = parsePlistValue(valElem);
      }
    }
  } catch (e) {
    console.warn('Failed to parse XML plist:', e);
  }
  return result;
}

function parsePlistValue(elem: Element): any {
  const tag = elem.tagName.toLowerCase();
  if (tag === 'string') return elem.textContent || '';
  if (tag === 'true') return true;
  if (tag === 'false') return false;
  if (tag === 'integer') return parseInt(elem.textContent || '0', 10);
  if (tag === 'real') return parseFloat(elem.textContent || '0');
  if (tag === 'date') return elem.textContent || '';
  if (tag === 'array') {
    return Array.from(elem.children).map(parsePlistValue);
  }
  if (tag === 'dict') {
    const obj: Record<string, any> = {};
    const children = Array.from(elem.children);
    for (let i = 0; i < children.length; i += 2) {
      const k = children[i]?.textContent?.trim() || '';
      const v = children[i + 1] ? parsePlistValue(children[i + 1]) : null;
      if (k) obj[k] = v;
    }
    return obj;
  }
  return elem.textContent || '';
}

/**
 * Fallback binary / text heuristic scanner for Info.plist if not pure XML
 */
function extractValuesFromBinaryOrText(content: string): Record<string, any> {
  const extracted: Record<string, any> = {};

  const searchKeys = [
    'CFBundleDisplayName',
    'CFBundleName',
    'CFBundleIdentifier',
    'CFBundleShortVersionString',
    'CFBundleVersion',
    'MinimumOSVersion',
    'DTPlatformVersion',
    'NSCameraUsageDescription',
    'NSPhotoLibraryUsageDescription',
    'NSMicrophoneUsageDescription',
    'NSLocationWhenInUseUsageDescription',
  ];

  for (const key of searchKeys) {
    const idx = content.indexOf(key);
    if (idx !== -1) {
      // Find following ascii printable string
      const slice = content.substring(idx + key.length, idx + key.length + 200);
      const match = slice.match(/[\x20-\x7E]{2,80}/g);
      if (match && match.length > 0) {
        // filter out unwanted tokens
        const val = match.find(
          (s) => !s.startsWith('<') && !s.startsWith('>') && !s.includes(key) && s.length > 1
        );
        if (val) {
          extracted[key] = val.trim();
        }
      }
    }
  }

  return extracted;
}

/**
 * Extracts embedded.mobileprovision details (XML payload embedded in CMS signed profile)
 */
function parseMobileProvision(content: string): ProvisioningInfo | undefined {
  const xmlStart = content.indexOf('<?xml');
  const xmlEnd = content.indexOf('</plist>');

  if (xmlStart !== -1 && xmlEnd !== -1) {
    const xmlContent = content.substring(xmlStart, xmlEnd + 8);
    const plist = parseXmlPlist(xmlContent);

    const info: ProvisioningInfo = {
      appIdName: plist['AppIDName'],
      teamName: plist['TeamName'],
      teamId: Array.isArray(plist['TeamIdentifier']) ? plist['TeamIdentifier'][0] : plist['TeamIdentifier'],
      creationDate: plist['CreationDate'],
      expirationDate: plist['ExpirationDate'],
      entitlements: plist['Entitlements'],
      provisionedDevicesCount: Array.isArray(plist['ProvisionedDevices'])
        ? plist['ProvisionedDevices'].length
        : undefined,
    };

    if (info.expirationDate) {
      const exp = new Date(info.expirationDate);
      info.isExpired = exp.getTime() < Date.now();
    }

    return info;
  }
  return undefined;
}

/**
 * Main parser for .ipa file
 */
export async function parseIPAFile(file: File): Promise<ParsedIPA> {
  const zip = new JSZip();
  const zipData = await zip.loadAsync(file);

  let appPayloadPath = '';
  // Locate Payload/*.app/ directory
  for (const path of Object.keys(zipData.files)) {
    const match = path.match(/^Payload\/([^/]+\.app)\//i);
    if (match) {
      appPayloadPath = `Payload/${match[1]}/`;
      break;
    }
  }

  let rawPlist: Record<string, any> = {};
  let infoPlistContent = '';

  // Find Info.plist
  const infoPlistFile =
    zipData.file(`${appPayloadPath}Info.plist`) ||
    Object.values(zipData.files).find((f) => f.name.toLowerCase().endsWith('/info.plist') || f.name.toLowerCase() === 'info.plist');

  if (infoPlistFile) {
    try {
      infoPlistContent = await infoPlistFile.async('text');
      if (infoPlistContent.startsWith('<?xml') || infoPlistContent.includes('<plist')) {
        rawPlist = parseXmlPlist(infoPlistContent);
      } else {
        rawPlist = extractValuesFromBinaryOrText(infoPlistContent);
      }
    } catch {
      // binary plist fallback
      try {
        const binStr = await infoPlistFile.async('binarystring');
        rawPlist = extractValuesFromBinaryOrText(binStr);
      } catch (err) {
        console.warn('Could not parse Info.plist string:', err);
      }
    }
  }

  // Find App Icon
  let appIconUrl: string | undefined = undefined;
  const iconCandidates = Object.keys(zipData.files).filter((name) => {
    const lower = name.toLowerCase();
    return (
      lower.startsWith(appPayloadPath.toLowerCase()) &&
      (lower.includes('appicon') || lower.includes('icon-') || lower.includes('icon@') || lower.endsWith('.png')) &&
      !lower.includes('frameworks') &&
      !lower.includes('assets.car')
    );
  });

  // Sort icon candidates to prefer largest / 60x60@2x / 60x60@3x
  iconCandidates.sort((a, b) => {
    const aScore = (a.includes('60@') || a.includes('60x60') || a.includes('120') || a.includes('180') ? 10 : 1) + (a.includes('AppIcon') ? 5 : 0);
    const bScore = (b.includes('60@') || b.includes('60x60') || b.includes('120') || b.includes('180') ? 10 : 1) + (b.includes('AppIcon') ? 5 : 0);
    return bScore - aScore;
  });

  if (iconCandidates.length > 0) {
    try {
      const iconFile = zipData.file(iconCandidates[0]);
      if (iconFile) {
        const iconBlob = await iconFile.async('blob');
        appIconUrl = URL.createObjectURL(iconBlob);
      }
    } catch (e) {
      console.warn('Failed to extract app icon:', e);
    }
  }

  // Find injected dylibs / frameworks
  const injectedDylibs: InjectedDylib[] = [];
  let frameworksCount = 0;
  for (const [path, zipEntry] of Object.entries(zipData.files)) {
    if (zipEntry.dir) continue;
    const lower = path.toLowerCase();
    if (lower.endsWith('.dylib') || (lower.includes('/frameworks/') && !lower.endsWith('/'))) {
      frameworksCount++;
      const fileName = path.split('/').pop() || path;
      if (lower.endsWith('.dylib') || lower.includes('.framework/')) {
        injectedDylibs.push({
          name: fileName,
          path,
          size: (zipEntry as any)._data?.uncompressedSize || 0,
        });
      }
    }
  }

  // Find embedded.mobileprovision
  let provisioning: ProvisioningInfo | undefined = undefined;
  const provFile =
    zipData.file(`${appPayloadPath}embedded.mobileprovision`) ||
    Object.values(zipData.files).find((f) => f.name.toLowerCase().endsWith('embedded.mobileprovision'));

  if (provFile) {
    try {
      const provStr = await provFile.async('binarystring');
      provisioning = parseMobileProvision(provStr);
    } catch (e) {
      console.warn('Failed to read mobileprovision:', e);
    }
  }

  // Extract common permissions
  const permissions: { key: string; description: string }[] = [];
  const permMap: Record<string, string> = {
    NSCameraUsageDescription: 'Acceso a la Cámara',
    NSPhotoLibraryUsageDescription: 'Acceso a la Fototeca (Fotos)',
    NSPhotoLibraryAddUsageDescription: 'Guardar fotos en la Fototeca',
    NSMicrophoneUsageDescription: 'Acceso al Micrófono',
    NSLocationWhenInUseUsageDescription: 'Ubicación al usar la app',
    NSLocationAlwaysUsageDescription: 'Ubicación siempre en segundo plano',
    NSBluetoothAlwaysUsageDescription: 'Acceso a Bluetooth',
    NSFaceIDUsageDescription: 'Autenticación con Face ID / Touch ID',
    NSAppleMusicUsageDescription: 'Acceso a Apple Music y Mediateca',
    NSContactsUsageDescription: 'Acceso a Contactos',
    NSCalendarsUsageDescription: 'Acceso a Calendarios',
    NSUserTrackingUsageDescription: 'Rastreo y Publicidad (App Tracking)',
  };

  for (const [key, label] of Object.entries(permMap)) {
    if (rawPlist[key]) {
      permissions.push({
        key: label,
        description: typeof rawPlist[key] === 'string' ? rawPlist[key] : 'Requerido por la app',
      });
    }
  }

  // Device families (1 = iPhone/iPod, 2 = iPad, 6 = Mac Catalyst)
  const deviceFamilies: string[] = [];
  const rawFam = rawPlist['UIDeviceFamily'];
  if (Array.isArray(rawFam)) {
    if (rawFam.includes(1) || rawFam.includes('1')) deviceFamilies.push('iPhone');
    if (rawFam.includes(2) || rawFam.includes('2')) deviceFamilies.push('iPad');
    if (rawFam.includes(6) || rawFam.includes('6')) deviceFamilies.push('Mac (Silicon)');
  } else {
    deviceFamilies.push('iPhone', 'iPad');
  }

  // Calculate SHA256
  const sha256 = await calculateSHA256(file);

  const appName =
    rawPlist['CFBundleDisplayName'] ||
    rawPlist['CFBundleName'] ||
    file.name.replace(/\.ipa$/i, '');

  const bundleDisplayName = rawPlist['CFBundleDisplayName'] || appName;
  const bundleIdentifier = rawPlist['CFBundleIdentifier'] || 'com.unknown.app';
  const version = rawPlist['CFBundleShortVersionString'] || rawPlist['CFBundleVersion'] || '1.0';
  const buildNumber = rawPlist['CFBundleVersion'] || '1';
  const minOSVersion = rawPlist['MinimumOSVersion'] || rawPlist['DTPlatformVersion'] || 'iOS 14.0+';

  return {
    fileName: file.name,
    fileSize: file.size,
    sha256,
    appName,
    bundleDisplayName,
    bundleIdentifier,
    version,
    buildNumber,
    minOSVersion,
    deviceFamilies,
    appIconUrl,
    injectedDylibs,
    provisioning,
    permissions,
    rawPlist,
    frameworksCount,
  };
}
