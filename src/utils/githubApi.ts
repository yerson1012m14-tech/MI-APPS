import { GitHubRelease, GitHubRepo } from '../types';

const GITHUB_API_BASE = 'https://api.github.com';

export function getStoredToken(): string {
  try {
    return localStorage.getItem('ipa_hub_gh_token') || '';
  } catch {
    return '';
  }
}

export function setStoredToken(token: string): void {
  try {
    if (token) {
      localStorage.setItem('ipa_hub_gh_token', token.trim());
    } else {
      localStorage.removeItem('ipa_hub_gh_token');
    }
  } catch (e) {
    console.error('Error saving GitHub token:', e);
  }
}

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
  };
  const token = getStoredToken();
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }
  return headers;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
}

export async function checkRateLimit(): Promise<RateLimitInfo | null> {
  try {
    const res = await fetch(`${GITHUB_API_BASE}/rate_limit`, {
      headers: getHeaders(),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      limit: data.rate.limit,
      remaining: data.rate.remaining,
      reset: new Date(data.rate.reset * 1000),
    };
  } catch {
    return null;
  }
}

export async function fetchRepoDetails(ownerAndRepo: string): Promise<GitHubRepo> {
  const clean = ownerAndRepo.replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
  const res = await fetch(`${GITHUB_API_BASE}/repos/${clean}`, {
    headers: getHeaders(),
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Repositorio "${clean}" no encontrado en GitHub.`);
    }
    if (res.status === 403) {
      throw new Error('Límite de peticiones de la API de GitHub alcanzado. Puedes añadir un Personal Access Token en ajustes.');
    }
    throw new Error(`Error de GitHub API (${res.status}): ${res.statusText}`);
  }

  return res.json();
}

export async function fetchRepoReleases(ownerAndRepo: string, perPage = 10): Promise<GitHubRelease[]> {
  const clean = ownerAndRepo.replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
  const res = await fetch(`${GITHUB_API_BASE}/repos/${clean}/releases?per_page=${perPage}`, {
    headers: getHeaders(),
  });

  if (!res.ok) {
    if (res.status === 404) {
      return [];
    }
    if (res.status === 403) {
      throw new Error('Límite de peticiones de GitHub API alcanzado.');
    }
    throw new Error(`Error al obtener versiones de ${clean} (${res.status})`);
  }

  const releases: GitHubRelease[] = await res.json();
  return releases;
}

export async function searchGitHubRepos(query: string): Promise<GitHubRepo[]> {
  const formattedQuery = encodeURIComponent(query.trim());
  const res = await fetch(`${GITHUB_API_BASE}/search/repositories?q=${formattedQuery}+sort:stars-desc&per_page=20`, {
    headers: getHeaders(),
  });

  if (!res.ok) {
    if (res.status === 403) {
      throw new Error('Límite de búsqueda alcanzado en GitHub API. Prueba más tarde o introduce un token de GitHub.');
    }
    throw new Error(`Error en la búsqueda (${res.status}): ${res.statusText}`);
  }

  const data = await res.json();
  return data.items || [];
}

export function filterIpaAssets(release: GitHubRelease) {
  return release.assets.filter(
    (a) => a.name.toLowerCase().endsWith('.ipa') || a.name.toLowerCase().endsWith('.zip') || a.name.toLowerCase().endsWith('.deb')
  );
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
