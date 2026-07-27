import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

function SectionCard({ title, subtitle, actionLabel, actionTo, children, className = "" }) {
  return (
    <div className={`rounded-2xl bg-white border border-slate-100 shadow-sm p-4 sm:p-5 ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-[#735366]">{title}</h3>
          {subtitle ? <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p> : null}
        </div>
        {actionLabel && actionTo ? (
          <Link
            to={actionTo}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#A77A95] hover:text-[#8F6580] shrink-0"
          >
            {actionLabel}
            <ArrowRight size={14} />
          </Link>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export default SectionCard;
