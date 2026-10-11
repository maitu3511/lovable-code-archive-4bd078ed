import React, { useState, useEffect } from "react";
import { PageId } from "../types";
import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { QuoteModal } from "../components/QuoteModal";
import { WhatsAppFloatingButton } from "../components/WhatsAppIcon";
import { SEOHead } from "../components/SEOHead";

export const WebsiteLayout: React.FC = () => {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const rawPage = pathname === "/" ? "home" : (pathname.slice(1) as PageId);
  const currentPage: PageId = rawPage === ("industries" as PageId) ? "applications" : rawPage;
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [preselectedService, setPreselectedService] = useState<string | undefined>(undefined);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleOpenQuote = (service?: string) => {
    setPreselectedService(service);
    setIsQuoteOpen(true);
  };

  useEffect(() => {
    const open = () => setIsQuoteOpen(true);
    window.addEventListener("advay:open-quote", open);
    return () => window.removeEventListener("advay:open-quote", open);
  }, []);

  // Window scroll progress bar calculation
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (window.scrollY / totalScroll) * 100)));
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Pre-warm critical hero images across all website pages for instantaneous loading
  useEffect(() => {
    const criticalImages = [
      "https://id-preview--7812fedb-978a-4d3f-b7af-27b541ebd405.lovable.app/__l5e/assets-v1/f8a846b8-b107-4d85-9641-31b8a5988ca3/hero-machine-working.jpg",
      "https://id-preview--7812fedb-978a-4d3f-b7af-27b541ebd405.lovable.app/__l5e/assets-v1/9ddbfe4e-ee5a-4ff8-965a-4e02c8b3de8c/hero_capabilities_moulds_new.jpg",
      "https://id-preview--7812fedb-978a-4d3f-b7af-27b541ebd405.lovable.app/__l5e/assets-v1/a135d4bb-4715-4c80-93b9-b1824200a9e1/hero_applications_parts_new.jpg",
      "https://id-preview--7812fedb-978a-4d3f-b7af-27b541ebd405.lovable.app/__l5e/assets-v1/30cd3887-7b97-4799-bbc9-cfa058d71ce9/hero_infrastructure_plant_new.jpg",
      "https://id-preview--7812fedb-978a-4d3f-b7af-27b541ebd405.lovable.app/__l5e/assets-v1/57a93132-8d81-466a-bff0-1e27df21e3a0/hero_quality_metrology_new.jpg",
      "https://id-preview--7812fedb-978a-4d3f-b7af-27b541ebd405.lovable.app/__l5e/assets-v1/3ceb244e-6b6c-470f-80cf-77d17c0139cc/hero_about_heritage_new.jpg",
      "https://id-preview--7812fedb-978a-4d3f-b7af-27b541ebd405.lovable.app/__l5e/assets-v1/6325f8f7-407f-4461-913b-8a1ce6c605cf/contact_plant_exterior_1791346820103.jpg",
      "https://id-preview--7812fedb-978a-4d3f-b7af-27b541ebd405.lovable.app/__l5e/assets-v1/20504afb-05a0-4a0f-9286-acbf8055079a/advay-engineers-logo.jpg",
    ];

    criticalImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Smooth IntersectionObserver for elegant scroll-reveal animations across all pages
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.06,
        rootMargin: "0px 0px 60px 0px",
      },
    );

    // Initial check and observer registration
    const registerElements = () => {
      const elements = document.querySelectorAll(
        ".scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale, .heading-scroll-reveal, .box-scroll-reveal, .section-heading-ltr, .heading-ltr, .section-line-expand",
      );
      const windowHeight = window.innerHeight || 800;
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= windowHeight * 0.9) {
          requestAnimationFrame(() => {
            el.classList.add("is-visible");
          });
        } else {
          observer.observe(el);
        }
      });
    };

    registerElements();
    const t1 = setTimeout(registerElements, 50);
    const t2 = setTimeout(registerElements, 200);

    // Safety fallback: ensure all content becomes visible so nothing is ever missed
    const safetyTimer = setTimeout(() => {
      const elements = document.querySelectorAll(
        ".scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale, .heading-scroll-reveal, .box-scroll-reveal, .section-heading-ltr, .heading-ltr, .section-line-expand",
      );
      elements.forEach((el) => el.classList.add("is-visible"));
    }, 1500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(safetyTimer);
      observer.disconnect();
    };
  }, [currentPage, pathname]);

  const handleNavigate = (page: PageId) => {
    navigate({ to: page === "home" ? "/" : `/${page}` });
    window.scrollTo(0, 0);
  };

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-[#FAF8F5] text-[#0B2545] flex flex-col font-sans selection:bg-[#8B1E1E] selection:text-white relative"
    >
      {/* Top Dynamic Scroll Progress Indicator Bar */}
      <div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B1E1E] via-[#0B2545] to-[#8B1E1E] z-[9999] origin-left pointer-events-none transition-transform duration-75 shadow-sm"
        style={{ transform: `scaleX(${scrollProgress / 100})` }}
      />
      {/* Dynamic SEO Meta Tags & Schema.org JSON-LD */}
      <SEOHead page={currentPage} />

      {/* Main Navigation Header */}
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenQuote={() => handleOpenQuote()}
      />

      {/* Active View / Main Content */}
      <main key={currentPage} className="flex-1 page-transition">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} onOpenQuote={() => handleOpenQuote()} />

      {/* Global RFQ / Quote Modal */}
      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        preselectedService={preselectedService}
      />

      {/* Floating Official WhatsApp Direct Action */}
      <WhatsAppFloatingButton />
    </div>
  );
};

export default WebsiteLayout;
