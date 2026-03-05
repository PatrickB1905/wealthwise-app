import { useCallback, useMemo, useState } from 'react';

import type { NavSectionId } from '../types/home';
import { buildHomePageStyles } from '../pages/HomePage.styles';

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function useHomePage() {
  const styles = useMemo(() => buildHomePageStyles(), []);

  const [navAnchorEl, setNavAnchorEl] = useState<null | HTMLElement>(null);
  const navMenuOpen = Boolean(navAnchorEl);

  const openNavMenu = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setNavAnchorEl(e.currentTarget);
  }, []);

  const closeNavMenu = useCallback(() => {
    setNavAnchorEl(null);
  }, []);

  const onNav = useCallback((id: NavSectionId) => {
    scrollToId(id);
  }, []);

  const onNavAndClose = useCallback(
    (id: NavSectionId) => {
      scrollToId(id);
      closeNavMenu();
    },
    [closeNavMenu],
  );

  return {
    styles,
    navAnchorEl,
    navMenuOpen,
    openNavMenu,
    closeNavMenu,
    onNav,
    onNavAndClose,
  };
}
