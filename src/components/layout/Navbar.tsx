import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, HandHeart, LayoutDashboard, LogOut, Menu, User, X } from "lucide-react";
import { Logo } from "./Logo";
import { serviceCategories } from "../../data/services";
import { useAuth } from "../../lib/auth/AuthContext";
import type { Role } from "../../lib/auth/types";

function spaceFor(role: Role): { href: string; label: string } {
  return role === "CLIENT"
    ? { href: "/mes-demandes", label: "Mes demandes" }
    : { href: "/espace-interne", label: "Espace interne" };
}

export function Navbar() {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    setMobileOpen(false);
    navigate("/");
  }

  useEffect(() => {
    if (!servicesOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (servicesRef.current && !servicesRef.current.contains(event.target as Node)) {
        setServicesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [servicesOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-[#F1FAE1]/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />

        {/* Nav desktop */}
        <nav className="hidden items-center gap-1 md:flex">
          <div className="relative" ref={servicesRef}>
            <button
              type="button"
              className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-ink hover:bg-surface-2"
              aria-expanded={servicesOpen}
              onClick={() => setServicesOpen((open) => !open)}
            >
              Nos services
              <ChevronDown size={16} className={servicesOpen ? "rotate-180 transition-transform" : "transition-transform"} />
            </button>

            {servicesOpen && (
              <div className="absolute left-1/2 top-full w-80 -translate-x-1/2 pt-2">
                <div className="rounded-2xl border border-line bg-surface p-2 shadow-xl shadow-ink/5">
                  {serviceCategories.map((service) => (
                    <Link
                      key={service.slug}
                      to={`/services/${service.slug}`}
                      onClick={() => setServicesOpen(false)}
                      className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-surface-2"
                    >
                      <span className="text-xl leading-none">{service.icon}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-ink">{service.name}</p>
                          {!service.active && (
                            <span className="shrink-0 rounded-full bg-accent-2-soft px-2 py-0.5 text-[11px] font-medium text-accent-2">
                              Bientôt
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-ink-dim">{service.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Actions à droite */}
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Link
                to={spaceFor(user.role).href}
                className="flex items-center gap-1.5 rounded-full bg-accent-2-soft px-3 py-2 text-sm font-medium text-accent-2 hover:bg-accent-2 hover:text-white"
              >
                <LayoutDashboard size={18} />
                {spaceFor(user.role).label}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-2 text-sm font-medium text-ink hover:border-accent hover:text-accent"
              >
                <LogOut size={18} />
                Se déconnecter
              </button>
            </>
          ) : (
            <>
              <Link
                to="/connexion"
                className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-ink hover:bg-surface-2"
              >
                <User size={18} />
                Connexion
              </Link>
              <Link
                to="/devenir-partenaire"
                className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-2 text-sm font-medium text-ink hover:border-accent-2 hover:text-accent-2"
              >
                <HandHeart size={18} />
                Devenir partenaire
              </Link>
            </>
          )}
        </div>

        {/* Bouton menu mobile */}
        <button
          type="button"
          className="rounded-full p-2 text-ink hover:bg-surface-2 md:hidden"
          aria-label="Ouvrir le menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Menu mobile */}
      {mobileOpen && (
        <div className="border-t border-line bg-paper px-4 pb-6 md:hidden">
          <p className="pt-4 pb-2 text-xs font-semibold tracking-wide text-ink-dim uppercase">
            Nos services
          </p>
          <div className="space-y-1">
            {serviceCategories.map((service) => (
              <Link
                key={service.slug}
                to={`/services/${service.slug}`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-surface-2"
              >
                <span className="text-lg leading-none">{service.icon}</span>
                <span className="text-sm font-medium text-ink">{service.name}</span>
                {!service.active && (
                  <span className="rounded-full bg-accent-2-soft px-2 py-0.5 text-[11px] font-medium text-accent-2">
                    Bientôt
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4">
            {user ? (
              <>
                <Link
                  to={spaceFor(user.role).href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-full bg-accent-2-soft px-3 py-2.5 text-sm font-medium text-accent-2"
                >
                  <LayoutDashboard size={18} />
                  {spaceFor(user.role).label}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-full border border-line px-3 py-2.5 text-sm font-medium text-ink"
                >
                  <LogOut size={18} />
                  Se déconnecter
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/connexion"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-full px-3 py-2.5 text-sm font-medium text-ink hover:bg-surface-2"
                >
                  <User size={18} />
                  Connexion
                </Link>
                <Link
                  to="/devenir-partenaire"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-full border border-line px-3 py-2.5 text-sm font-medium text-ink"
                >
                  <HandHeart size={18} />
                  Devenir partenaire
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
