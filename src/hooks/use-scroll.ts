import { useEffect, useState } from 'react';

export function useScroll(threshold = 10) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [hideNavbar, setHideNavbar] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // 判断是否超过阈值
          setIsScrolled(currentScrollY > threshold);

          // 判断滚动方向
          if (currentScrollY > lastScrollY && currentScrollY > 100) {
            // 向下滚动且超过100px时隐藏navbar
            setIsScrollingUp(false);
            setHideNavbar(true);
          } else if (currentScrollY < lastScrollY) {
            // 向上滚动时显示navbar
            setIsScrollingUp(true);
            setHideNavbar(false);
          }

          // 在顶部时始终显示
          if (currentScrollY <= 10) {
            setHideNavbar(false);
          }

          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold, lastScrollY]);

  return {
    isScrolled,
    isScrollingUp,
    hideNavbar,
    scrollY: lastScrollY,
  };
}
