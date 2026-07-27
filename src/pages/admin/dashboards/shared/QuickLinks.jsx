import { Link } from "react-router-dom";

const TONES = [
  "from-[#A77A95] to-[#735366]",
  "from-[#F5D69B] to-[#D4B87A]",
  "from-[#C3C3D5] to-[#A77A95]",
  "from-[#8F6580] to-[#735366]",
  "from-[#D4B87A] to-[#A77A95]",
  "from-[#A77A95] to-[#C3C3D5]",
  "from-[#735366] to-[#8F6580]",
];

function QuickLinks({ items = [] }) {
  if (!items.length) return null;

  return (
    <section>
      <h2 className="text-sm font-semibold text-slate-500 mb-3">Quick Links</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {items.map((item, index) => {
          const Icon = item.icon;
          const tone = TONES[index % TONES.length];
          const content = (
            <>
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br ${tone} text-white shadow-md mb-2 group-hover:scale-105 transition`}
              >
                {Icon ? <Icon size={18} /> : null}
              </span>
              <span className="text-xs font-semibold text-[#735366] text-center leading-tight">
                {item.label}
              </span>
            </>
          );

          const className =
            "group flex flex-col items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm p-3 hover:shadow-md hover:-translate-y-0.5 transition min-h-[96px]";

          if (item.to) {
            return (
              <Link key={item.label} to={item.to} className={className}>
                {content}
              </Link>
            );
          }

          return (
            <div key={item.label} className={`${className} opacity-80 cursor-default`}>
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default QuickLinks;
