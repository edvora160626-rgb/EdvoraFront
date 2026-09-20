import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown, UserRound } from "lucide-react";
import { useSelector } from "react-redux";

function getInitials(firstName = "", lastName = "") {
  const first = String(firstName || "").trim()[0] || "";
  const last = String(lastName || "").trim()[0] || "";
  return (first + last).toUpperCase() || "U";
}

function pathMatches(pathname, to, end) {
  if (!to) return false;
  if (end) return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}

function moduleHasActiveChild(pathname, children = []) {
  return children.some((child) => pathMatches(pathname, child.to, child.end));
}

function FlatNavItem({ to, label, icon: Icon, end, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={Boolean(end)}
      replace
      onClick={onNavigate}
      className={({ isActive }) =>
        `group rs-nav-item flex items-center gap-2.5 sm:gap-3 font-medium transition-all duration-200 ${
          isActive
            ? "bg-white text-[#8F6580] shadow-md"
            : "text-white/85 hover:bg-white/10 hover:text-white"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`flex shrink-0 items-center justify-center rounded-lg transition-colors w-[clamp(1.75rem,4vw,2.25rem)] h-[clamp(1.75rem,4vw,2.25rem)] ${
              isActive
                ? "bg-[#FAEEE9] text-[#A77A95]"
                : "bg-white/10 text-white group-hover:bg-white/15"
            }`}
          >
            {Icon ? (
              <Icon className="w-[1em] h-[1em] text-[clamp(14px,3.2vw,18px)]" />
            ) : null}
          </span>
          <span className="truncate">{label}</span>
        </>
      )}
    </NavLink>
  );
}

function NestedModule({ module, onNavigate, expandedId, setExpandedId }) {
  const { pathname } = useLocation();
  const Icon = module.icon;
  const hasActive = moduleHasActiveChild(pathname, module.children);
  const expanded = expandedId === module.id;

  const toggle = () => {
    setExpandedId((prev) => (prev === module.id ? "" : module.id));
  };

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={expanded}
        className={`group flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all duration-200 ${
          hasActive || expanded
            ? "bg-white/15 text-white shadow-sm"
            : "text-white/85 hover:bg-white/10 hover:text-white"
        }`}
      >
        <span
          className={`flex shrink-0 items-center justify-center rounded-lg transition-colors w-[clamp(1.75rem,4vw,2.25rem)] h-[clamp(1.75rem,4vw,2.25rem)] ${
            hasActive || expanded
              ? "bg-[#F5D69B]/25 text-[#F5D69B]"
              : "bg-white/10 text-white group-hover:bg-white/15"
          }`}
        >
          {Icon ? (
            <Icon className="w-[1em] h-[1em] text-[clamp(14px,3.2vw,18px)]" />
          ) : null}
        </span>
        <span className="min-w-0 flex-1 truncate">{module.label}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-white/70 transition-transform duration-300 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="relative ml-4 space-y-1 border-l border-white/15 pl-3 pb-1 pt-0.5">
            {module.children.map((child) => (
              <NavLink
                key={child.to}
                to={child.to}
                end={Boolean(child.end)}
                replace
                onClick={onNavigate}
                className={({ isActive }) =>
                  `relative flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-white text-[#8F6580] shadow-md"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`absolute -left-[15px] h-1.5 w-1.5 rounded-full transition-colors ${
                        isActive ? "bg-[#F5D69B]" : "bg-white/35"
                      }`}
                    />
                    <span className="truncate">{child.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExamSidebarNav({
  onNavigate,
  onOpenProfile,
  items,
  roleLabel,
  nested = false,
}) {
  const user = useSelector((state) => state.auth.user);
  const { pathname } = useLocation();
  const [expandedId, setExpandedId] = useState(null);

  const initialExpanded = useMemo(() => {
    if (!nested) return null;
    const match = items.find(
      (m) => m.children?.length && moduleHasActiveChild(pathname, m.children)
    );
    return match?.id ?? null;
  }, [items, nested, pathname]);

  useEffect(() => {
    if (nested && initialExpanded) setExpandedId(initialExpanded);
  }, [nested, initialExpanded]);

  return (
    <nav className="px-3 space-y-1.5">
      <button
        type="button"
        onClick={onOpenProfile}
        className="mb-3 flex w-full items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-3 py-3 text-left transition hover:bg-white/15"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#F5D69B] to-[#A77A95] text-sm font-bold text-white shadow-md">
          {user ? getInitials(user.firstName, user.lastName) : <UserRound size={18} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-white truncate">
            {user
              ? [user.firstName, user.lastName].filter(Boolean).join(" ")
              : "Profile"}
          </span>
          <span className="block text-xs text-white/65 truncate">{roleLabel}</span>
        </span>
      </button>

      <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-white/50">
        Examination
      </p>

      {nested
        ? items.map((item) =>
            item.children?.length ? (
              <NestedModule
                key={item.id || item.to}
                module={item}
                onNavigate={onNavigate}
                expandedId={expandedId}
                setExpandedId={setExpandedId}
              />
            ) : (
              <FlatNavItem
                key={item.id || item.to}
                to={item.to}
                label={item.label}
                icon={item.icon}
                end={item.end}
                onNavigate={onNavigate}
              />
            )
          )
        : items.map((item) => (
            <FlatNavItem key={item.to} {...item} onNavigate={onNavigate} />
          ))}
    </nav>
  );
}
