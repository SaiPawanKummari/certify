import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ShieldCheck,
  Activity,
  RefreshCw,
  LogOut,
  ArrowLeft,
  Search,
  FilePlus2,
  SearchCheck,
  Ban,
  Users,
  Clock3,
  AlertTriangle,
  CheckCircle2,
  UserCircle2,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

export default function ActivityLogs() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    certificateIssued: 0,
    certificateVerified: 0,
    certificateRevoked: 0,
    userActions: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] =
    useState("all");

  /*
  |--------------------------------------------------------------------------
  | Fetch Activity Logs
  |--------------------------------------------------------------------------
  */

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/activity-logs"
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to load activity logs."
        );
      }

      setLogs(
        response.data.logs || []
      );

      setStats(
        response.data.stats || {
          total: 0,
          certificateIssued: 0,
          certificateVerified: 0,
          certificateRevoked: 0,
          userActions: 0,
        }
      );
    } catch (err) {
      console.error(
        "Activity logs error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load activity logs."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Initial Load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!user) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    fetchLogs();
  }, [user]);

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  const handleLogout = () => {
    logout();

    navigate("/login", {
      replace: true,
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Filter Logs
  |--------------------------------------------------------------------------
  */

  const filteredLogs = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return logs.filter((log) => {
      const action =
  String(
    log.display_action ||
      log.action ||
      ""
  ).toLowerCase();

const details =
  String(
    log.display_details ||
      log.details ||
      log.description ||
      ""
  ).toLowerCase();

      const userName =
        String(
          log.user_name || ""
        ).toLowerCase();

      const userEmail =
        String(
          log.user_email || ""
        ).toLowerCase();

      const matchesSearch =
        !query ||
        action.includes(query) ||
        details.includes(query) ||
        userName.includes(query) ||
        userEmail.includes(query);

      let matchesAction = true;

      if (actionFilter === "issued") {
        matchesAction =
          action.includes("issu");
      }

      if (actionFilter === "verified") {
        matchesAction =
          action.includes("verif");
      }

      if (actionFilter === "revoked") {
        matchesAction =
          action.includes("revok");
      }

      if (actionFilter === "user") {
        matchesAction =
          action.includes("user") ||
          action.includes("account");
      }

      return (
        matchesSearch &&
        matchesAction
      );
    });
  }, [
    logs,
    search,
    actionFilter,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen overflow-hidden bg-[#020617] text-white">

      {/* ================================================================
          BACKGROUND
      ================================================================= */}

      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">

        <div className="absolute left-[-180px] top-[-120px] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-3xl" />

        <div className="absolute right-[-180px] top-[50px] h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-3xl" />

        <div className="absolute bottom-[-200px] left-1/3 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-3xl" />

      </div>

      {/* ================================================================
          NAVBAR
      ================================================================= */}

      <header className="relative z-20 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">

        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-6">

          <Link
            to="/"
            className="flex items-center gap-3"
          >

            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-600/25">

              <ShieldCheck size={24} />

            </div>

            <div>

              <p className="text-xl font-bold tracking-tight">
                Certify
              </p>

              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                Digital Trust Platform
              </p>

            </div>

          </Link>

          <div className="flex items-center gap-3">

            <div className="hidden border-l border-white/10 pl-4 text-right sm:block">

              <p className="text-sm font-medium text-slate-200">
                {user?.name ||
                  "Administrator"}
              </p>

              <p className="text-xs text-slate-600">
                Administrator
              </p>

            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-red-400/20 hover:bg-red-500/10 hover:text-red-300"
            >

              <LogOut size={16} />

              Logout

            </button>

          </div>

        </div>

      </header>

      {/* ================================================================
          MAIN
      ================================================================= */}

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-10 sm:py-14">

        {/* Back */}

        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
        >

          <ArrowLeft size={16} />

          Back to Admin Dashboard

        </Link>

        {/* ================================================================
            HEADER
        ================================================================= */}

        <section className="mt-7 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">

          <div>

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-300">

              <Activity size={14} />

              Administration

            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">

              Activity{" "}

              <span className="bg-gradient-to-r from-blue-400 to-violet-500 bg-clip-text text-transparent">
                Logs
              </span>

            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              Review important actions performed across
              the Certify digital certificate platform.
            </p>

          </div>

          <button
            type="button"
            onClick={fetchLogs}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-slate-300 transition hover:border-blue-400/20 hover:bg-blue-500/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >

            <RefreshCw
              size={16}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh Logs

          </button>

        </section>

        {/* ================================================================
            ERROR
        ================================================================= */}

        {error && (

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/[0.06] px-5 py-4">

            <AlertTriangle
              size={20}
              className="mt-0.5 shrink-0 text-red-400"
            />

            <div>

              <p className="text-sm font-semibold text-red-300">
                Activity logs could not be loaded
              </p>

              <p className="mt-1 text-sm text-red-300/80">
                {error}
              </p>

            </div>

          </div>

        )}

        {/* ================================================================
            STATISTICS
        ================================================================= */}

        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">

          <LogStat
            icon={Activity}
            title="Total"
            value={stats.total}
            description="All recorded actions"
            loading={loading}
            iconClass="bg-blue-500/10 text-blue-400"
          />

          <LogStat
            icon={FilePlus2}
            title="Issued"
            value={
              stats.certificateIssued
            }
            description="Certificates issued"
            loading={loading}
            iconClass="bg-violet-500/10 text-violet-400"
          />

          <LogStat
            icon={SearchCheck}
            title="Verified"
            value={
              stats.certificateVerified
            }
            description="Verification activity"
            loading={loading}
            iconClass="bg-emerald-500/10 text-emerald-400"
          />

          <LogStat
            icon={Ban}
            title="Revoked"
            value={
              stats.certificateRevoked
            }
            description="Revocation activity"
            loading={loading}
            iconClass="bg-red-500/10 text-red-400"
          />

          <LogStat
            icon={Users}
            title="User Actions"
            value={
              stats.userActions
            }
            description="Account activity"
            loading={loading}
            iconClass="bg-cyan-500/10 text-cyan-400"
          />

        </section>

        {/* ================================================================
            LOG PANEL
        ================================================================= */}

        <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 shadow-2xl shadow-black/20 backdrop-blur-xl">

          {/* Header */}

          <div className="border-b border-white/10 px-6 py-6 sm:px-8">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">

                  <Activity size={21} />

                </div>

                <div>

                  <h2 className="text-xl font-bold">
                    Platform Activity
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Track important actions performed by users.
                  </p>

                </div>

              </div>

              {/* Search */}

              <div className="relative w-full lg:w-80">

                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search activity..."
                  className="w-full rounded-xl border border-white/10 bg-slate-950/80 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400/40"
                />

              </div>

            </div>

            {/* Filters */}

            <div className="mt-5 flex flex-wrap gap-2">

              <FilterButton
                active={
                  actionFilter ===
                  "all"
                }
                onClick={() =>
                  setActionFilter(
                    "all"
                  )
                }
              >
                All Activity
              </FilterButton>

              <FilterButton
                active={
                  actionFilter ===
                  "issued"
                }
                onClick={() =>
                  setActionFilter(
                    "issued"
                  )
                }
              >
                Issued
              </FilterButton>

              <FilterButton
                active={
                  actionFilter ===
                  "verified"
                }
                onClick={() =>
                  setActionFilter(
                    "verified"
                  )
                }
              >
                Verified
              </FilterButton>

              <FilterButton
                active={
                  actionFilter ===
                  "revoked"
                }
                onClick={() =>
                  setActionFilter(
                    "revoked"
                  )
                }
              >
                Revoked
              </FilterButton>

              <FilterButton
                active={
                  actionFilter ===
                  "user"
                }
                onClick={() =>
                  setActionFilter(
                    "user"
                  )
                }
              >
                User Actions
              </FilterButton>

            </div>

            <div className="mt-4 text-xs text-slate-600">

              Showing{" "}
              <span className="text-slate-400">
                {filteredLogs.length}
              </span>{" "}
              of{" "}
              <span className="text-slate-400">
                {logs.length}
              </span>{" "}
              activities

            </div>

          </div>

          {/* ============================================================
              LOADING
          ============================================================ */}

          {loading && (

            <div className="px-6 py-20 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">

                <RefreshCw
                  size={26}
                  className="animate-spin text-blue-400"
                />

              </div>

              <p className="mt-5 font-medium text-slate-400">
                Loading activity logs...
              </p>

            </div>

          )}

          {/* ============================================================
              EMPTY
          ============================================================ */}

          {!loading &&
            filteredLogs.length === 0 && (

              <div className="px-6 py-20 text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">

                  <Activity size={30} />

                </div>

                <h3 className="mt-5 text-lg font-semibold">
                  No activity found
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  No activity matches your current search or filter.
                </p>

              </div>

            )}

          {/* ============================================================
              TABLE
          ============================================================ */}

          {!loading &&
            filteredLogs.length > 0 && (

              <div className="overflow-x-auto">

                <table className="w-full min-w-[1000px] text-left text-sm">

                  <thead>

                    <tr className="border-b border-white/10 bg-white/[0.015] text-xs uppercase tracking-wider text-slate-500">

                      <th className="px-6 py-4 font-semibold">
                        Activity
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        User
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Details
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Date & Time
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredLogs.map(
                      (log, index) => (

                        <tr
                          key={
                            log.id ||
                            index
                          }
                          className="border-b border-white/5 transition last:border-0 hover:bg-blue-500/[0.025]"
                        >

                          {/* Activity */}

                          <td className="px-6 py-5">

                            <div className="flex items-center gap-3">

                              <ActivityIcon
                                action={
                                  log.action
                                }
                              />

                              <div>

                                <p className="font-medium text-slate-200">
  {formatAction(
    log.display_action ||
      log.action
  )}
</p>

                                <p className="mt-1 text-xs text-slate-600">
  {String(
    log.display_action ||
      log.action ||
      "activity"
  )}
</p>

                              </div>

                            </div>

                          </td>

                          {/* User */}

                          <td className="px-6 py-5">

                            <div className="flex items-center gap-3">

                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-400">

                                <UserCircle2
                                  size={18}
                                />

                              </div>

                              <div>

                                <p className="font-medium text-slate-300">

                                  {log.user_name ||
                                    "System / Public"}

                                </p>

                                <p className="mt-1 text-xs text-slate-600">

                                  {log.user_email ||
                                    "No account information"}

                                </p>

                              </div>

                            </div>

                          </td>

                          {/* Details */}

                          <td className="max-w-[350px] px-6 py-5">

                            <p className="truncate text-slate-400">

                              {log.display_details ||
  log.details ||
  log.description ||
  "No additional details"}

                            </p>

                          </td>

                          {/* Date */}

                          <td className="px-6 py-5">

                            <div className="flex items-center gap-2 text-slate-500">

                              <Clock3
                                size={15}
                              />

                              {formatDateTime(
                                log.created_at ||
                                  log.timestamp ||
                                  log.verified_at
                              )}

                            </div>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

        </section>

      </main>

      {/* ================================================================
          FOOTER
      ================================================================= */}

      <footer className="relative z-10 border-t border-white/10 px-6 py-8">

        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-xs text-slate-600 sm:flex-row">

          <p>
            © {new Date().getFullYear()} Certify. Digital
            Certificate Authentication Platform.
          </p>

          <div className="flex items-center gap-2">

            <ShieldCheck size={14} />

            Secure • Verified • Trusted

          </div>

        </div>

      </footer>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Statistics Card
|--------------------------------------------------------------------------
*/

function LogStat({
  icon: Icon,
  title,
  value,
  description,
  loading,
  iconClass,
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-black/10 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-blue-400/20">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="mt-3 text-4xl font-black tracking-tight">
            {loading
              ? "..."
              : value}
          </p>

          <p className="mt-2 text-xs text-slate-600">
            {description}
          </p>

        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconClass}`}
        >

          <Icon size={23} />

        </div>

      </div>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Filter Button
|--------------------------------------------------------------------------
*/

function FilterButton({
  active,
  onClick,
  children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-2 text-xs font-medium transition ${
        active
          ? "border-blue-400/30 bg-blue-500/10 text-blue-300"
          : "border-white/10 bg-white/[0.02] text-slate-500 hover:border-white/20 hover:text-slate-300"
      }`}
    >
      {children}
    </button>
  );
}

/*
|--------------------------------------------------------------------------
| Activity Icon
|--------------------------------------------------------------------------
*/

function ActivityIcon({ action }) {
  const value =
    String(action || "")
      .toLowerCase();

  if (value.includes("issu")) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
        <FilePlus2 size={18} />
      </div>
    );
  }

  if (value.includes("verif")) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
        <SearchCheck size={18} />
      </div>
    );
  }

  if (value.includes("revok")) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
        <Ban size={18} />
      </div>
    );
  }

  if (
    value.includes("user") ||
    value.includes("account")
  ) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
        <Users size={18} />
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
      <Activity size={18} />
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Format Action
|--------------------------------------------------------------------------
*/

function formatAction(action) {
  if (!action) {
    return "Platform Activity";
  }

  return String(action)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

/*
|--------------------------------------------------------------------------
| Format Date
|--------------------------------------------------------------------------
*/

function formatDateTime(date) {
  if (!date) {
    return "—";
  }

  const parsed =
    new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}