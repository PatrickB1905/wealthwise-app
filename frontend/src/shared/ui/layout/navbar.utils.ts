export function initialsFromName(
  firstName?: string | null,
  lastName?: string | null,
): string | null {
  const f = (firstName ?? '').trim();
  const l = (lastName ?? '').trim();
  if (!f && !l) return null;

  const a = f ? f[0] : '';
  const b = l ? l[0] : '';
  const out = (a + b).toUpperCase();
  return out || null;
}

export function initialsFromEmail(email: string): string {
  const local = email.split('@')[0] ?? '';
  const name = local.trim();
  if (!name) return 'U';

  const parts = name.split(/[._-]+/).filter(Boolean);
  const first = parts[0]?.[0] ?? name[0] ?? 'U';
  const second = parts[1]?.[0] ?? (name.length > 1 ? name[1] : '');
  return (first + second).toUpperCase();
}

export function breadcrumbsFromPath(pathname: string): [string, string] {
  const map: Record<string, string> = {
    positions: 'Portfolio',
    analytics: 'Analytics',
    news: 'News',
    profile: 'My Profile',
  };

  const seg = pathname.split('/').filter(Boolean);
  const pageSeg = seg[1];
  const page = pageSeg && map[pageSeg] ? map[pageSeg] : 'Dashboard';

  return ['App', page];
}
