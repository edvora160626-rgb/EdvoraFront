import AdminUsers from "./AdminUsers";

export default function AdminCreateAdmin() {
  return (
    <AdminUsers
      lockedRole="EXAM_ADMIN"
      module="Admin"
      title="Create Admin"
      description="Examination admin accounts that manage question bank, tests and reports."
      showFilters={false}
    />
  );
}
