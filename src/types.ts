export type ActiveTab = 'home' | 'license' | 'settings' | 'admin';

export interface GitHubAsset {
  id: number;
  name: string;
  size: number;
  download_count: number;
  browser_download_url: string;
  created_at: string;
  content_type: string;
}

export interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  body: string;
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  published_at: string;
  html_url: string;
  assets: GitHubAsset[];
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  updated_at: string;
  topics?: string[];
  default_branch: string;
}

export interface CuratedIPARepo {
  id: string;
  name: string;
  repo: string;
  category: 'emulators' | 'tweaks' | 'utilities' | 'media' | 'games' | 'sideloading';
  description: string;
  icon?: string;
  tags: string[];
  website?: string;
  recommendedSideload?: string;
}

export interface InjectedDylib {
  name: string;
  path: string;
  size: number;
}

export interface ProvisioningInfo {
  appIdName?: string;
  teamName?: string;
  teamId?: string;
  creationDate?: string;
  expirationDate?: string;
  isExpired?: boolean;
  provisionedDevicesCount?: number;
  entitlements?: Record<string, any>;
}

export interface ParsedIPA {
  fileName: string;
  fileSize: number;
  sha256?: string;
  appName: string;
  bundleDisplayName: string;
  bundleIdentifier: string;
  version: string;
  buildNumber: string;
  minOSVersion: string;
  deviceFamilies: string[];
  appIconUrl?: string;
  injectedDylibs: InjectedDylib[];
  provisioning?: ProvisioningInfo;
  permissions: { key: string; description: string }[];
  rawPlist?: Record<string, any>;
  frameworksCount: number;
  supportedArchitectures?: string[];
}
