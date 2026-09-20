import { PageHeader, Surface } from "./components/ExamUI";

const FAQS = [
  {
    q: "How do I start a scheduled exam?",
    a: "Open Schedule Test or Dashboard, choose an available exam, then continue through system checks (face auth skipped for now) and start when ready.",
  },
  {
    q: "Can I pause a live exam?",
    a: "Live exams run on a timer. Leaving the page may submit or lock the attempt depending on institution rules.",
  },
  {
    q: "Where are practice results?",
    a: "After you submit a practice test you are taken to the result page. Recent scores also appear on the dashboard.",
  },
  {
    q: "School portal vs Examination portal?",
    a: "Use the login switch: School for attendance, classes and timetable; Examination for mocks, exams and certificates.",
  },
];

export default function Help() {
  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Help"
        description="Quick answers for the Examination portal."
      />
      <div className="space-y-3">
        {FAQS.map((item) => (
          <Surface key={item.q} className="p-4 sm:p-5">
            <h2 className="font-bold text-sm text-[#3d1f33]">{item.q}</h2>
            <p className="mt-2 text-sm text-[#735366]/75 leading-relaxed">
              {item.a}
            </p>
          </Surface>
        ))}
      </div>
    </div>
  );
}
