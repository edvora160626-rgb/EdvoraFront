import AdminUsers from "./AdminUsers";

export default function AdminCandidates() {
  return (
    <AdminUsers
      lockedRole="EXAM_CANDIDATE"
      module="Admin"
      title="Candidate"
      description="Registered candidates who take practice and certification exams."
      showFilters={false}
    />
  );
}
