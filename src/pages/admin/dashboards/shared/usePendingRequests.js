import { useEffect, useMemo, useState } from "react";
import {
  canActOnRole,
  getRequestDisplayOrder,
  getViewRoles,
} from "../../../../utils/rolePermissions";
import {
  fetchAllViewableRequests,
  fetchPendingCounts,
} from "../../../../utils/requestsApi";

export default function usePendingRequests() {
  const displayOrder = getRequestDisplayOrder();
  const [pendingCounts, setPendingCounts] = useState({});
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const viewRoles = getViewRoles();
        if (!viewRoles.length) {
          if (!cancelled) {
            setPendingCounts({});
            setRecentRequests([]);
            setLoading(false);
          }
          return;
        }

        const [counts, groups] = await Promise.all([
          fetchPendingCounts(viewRoles),
          fetchAllViewableRequests(undefined, viewRoles),
        ]);
        if (cancelled) return;
        setPendingCounts(counts);
        setLoading(false);

        const recent = groups
          .flatMap(({ role, users }) =>
            users.map((requestUser) => ({
              ...requestUser,
              role: requestUser.role || role,
              actionable: canActOnRole(role),
            }))
          )
          .slice(0, 5);
        setRecentRequests(recent);
      } catch (error) {
        console.error(error);
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(
    () =>
      displayOrder.map((role) => ({
        role,
        count: pendingCounts[role]?.REQUESTED || 0,
        actionable: canActOnRole(role),
      })),
    [pendingCounts, displayOrder]
  );

  const totalPending = stats.reduce((sum, item) => sum + item.count, 0);
  const actionablePending = stats
    .filter((item) => item.actionable)
    .reduce((sum, item) => sum + item.count, 0);

  return {
    loading,
    stats,
    totalPending,
    actionablePending,
    recentRequests,
    pendingCounts,
  };
}
