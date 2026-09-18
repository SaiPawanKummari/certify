import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Users,
  GraduationCap,
  BriefcaseBusiness,
  UserCog,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowLeft,
  LogOut,
  Search,
  UserCheck,
  UserX,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

export default function UserManagement() {
  const { user, logout } = useAuth();

  const [users, setUsers] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    students: 0,
    issuers: 0,
    admins: 0,
    active: 0,
    inactive: 0,
  });

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  /*
  |--------------------------------------------------------------------------
  | Fetch Users
  |--------------------------------------------------------------------------
  */

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/auth/users"
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to load users."
        );
      }

      setUsers(
        response.data.users || []
      );

      setStats(
        response.data.stats || {
          total: 0,
          students: 0,
          issuers: 0,
          admins: 0,
          active: 0,
          inactive: 0,
        }
      );
    } catch (err) {
      console.error(
        "User management fetch error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load users."
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
    fetchUsers();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Update User Status
  |--------------------------------------------------------------------------
  */

  const handleStatusChange = async (
    targetUser,
    newStatus
  ) => {
    if (!targetUser?.id) {
      return;
    }

    if (
      Number(targetUser.id) ===
        Number(user?.id) &&
      newStatus === "inactive"
    ) {
      setError(
        "You cannot deactivate your own admin account."
      );

      return;
    }

    try {
      setUpdatingId(targetUser.id);
      setError("");
      setSuccess("");

      const response = await api.patch(
        `/auth/users/${targetUser.id}/status`,
        {
          status: newStatus,
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to update user status."
        );
      }

      setSuccess(
        response.data.message ||
          "User status updated successfully."
      );

      await fetchUsers();
    } catch (err) {
      console.error(
        "User status update error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update user status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  const handleLogout = () => {
    logout();
  };

  /*
  |--------------------------------------------------------------------------
  | Filtering
  |--------------------------------------------------------------------------
  */

  const filteredUsers = users.filter(
    (targetUser) => {
      const search =
        searchTerm.trim().toLowerCase();

      const matchesSearch =
        !search ||
        targetUser.name
          ?.toLowerCase()
          .includes(search) ||
        targetUser.email
          ?.toLowerCase()
          .includes(search);

      const matchesRole =
        roleFilter === "all" ||
        targetUser.role === roleFilter;

      const matchesStatus =
        statusFilter === "all" ||
        targetUser.status === statusFilter;

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    }
  );

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

          {/* Logo */}

          <Link
            to="/"
            className="flex items-center gap-3"
          >

            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-600/25">

              <ShieldCheck size={24} />

            </div>

            <div>

              <p className="text-xl font-bold">
                Certify
              </p>

              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                Digital Trust Platform
              </p>

            </div>

          </Link>

          {/* Right */}

          <div className="flex items-center gap-3">

            <div className="hidden text-right sm:block">

              <p className="text-sm font-medium text-slate-200">
                {user?.name || "Administrator"}
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

        {/* ================================================================
            HEADER
        ================================================================= */}

        <div className="mb-8">

          <Link
            to="/admin/dashboard"
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Admin Dashboard
          </Link>

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">

            <div>

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-300">

                <Sparkles size={14} />

                Administration

              </div>

              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">

                User{" "}

                <span className="bg-gradient-to-r from-blue-400 to-violet-500 bg-clip-text text-transparent">
                  Management
                </span>

              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                Manage student, issuer and administrator
                accounts and control account access.
              </p>

            </div>

            <button
              type="button"
              onClick={fetchUsers}
              disabled={loading}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-blue-400/20 hover:bg-blue-500/10 hover:text-white disabled:opacity-50"
            >

              <RefreshCw
                size={17}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh Users

            </button>

          </div>

        </div>

        {/* ================================================================
            MESSAGES
        ================================================================= */}

        {success && (

          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.06] px-5 py-4">

            <CheckCircle2
              size={20}
              className="mt-0.5 shrink-0 text-emerald-400"
            />

            <p className="text-sm text-emerald-300">
              {success}
            </p>

          </div>
        )}

        {error && (

          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/[0.06] px-5 py-4">

            <AlertTriangle
              size={20}
              className="mt-0.5 shrink-0 text-red-400"
            />

            <p className="text-sm text-red-300">
              {error}
            </p>

          </div>
        )}

        {/* ================================================================
            USER STATISTICS
        ================================================================= */}

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-6">

          <UserStat
            icon={Users}
            title="Total"
            value={stats.total}
            loading={loading}
            iconClass="bg-blue-500/10 text-blue-400"
          />

          <UserStat
            icon={GraduationCap}
            title="Students"
            value={stats.students}
            loading={loading}
            iconClass="bg-cyan-500/10 text-cyan-400"
          />

          <UserStat
            icon={BriefcaseBusiness}
            title="Issuers"
            value={stats.issuers}
            loading={loading}
            iconClass="bg-violet-500/10 text-violet-400"
          />

          <UserStat
            icon={UserCog}
            title="Admins"
            value={stats.admins}
            loading={loading}
            iconClass="bg-purple-500/10 text-purple-400"
          />

          <UserStat
            icon={UserCheck}
            title="Active"
            value={stats.active}
            loading={loading}
            iconClass="bg-emerald-500/10 text-emerald-400"
          />

          <UserStat
            icon={UserX}
            title="Inactive"
            value={stats.inactive}
            loading={loading}
            iconClass="bg-red-500/10 text-red-400"
          />

        </section>

        {/* ================================================================
            USER MANAGEMENT TABLE
        ================================================================= */}

        <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 shadow-2xl shadow-black/20 backdrop-blur-xl">

          {/* Header */}

          <div className="border-b border-white/10 px-6 py-6 sm:px-8">

            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">

                  <Users size={21} />

                </div>

                <div>

                  <h2 className="text-xl font-bold">
                    Platform Users
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    View and manage registered platform accounts.
                  </p>

                </div>

              </div>

              {/* Search */}

              <div className="relative w-full lg:w-72">

                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                  placeholder="Search name or email..."
                  className="w-full rounded-xl border border-white/10 bg-slate-950 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
                />

              </div>

            </div>

            {/* Filters */}

            <div className="mt-5 flex flex-wrap gap-3">

              <select
                value={roleFilter}
                onChange={(event) =>
                  setRoleFilter(
                    event.target.value
                  )
                }
                className="rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-blue-500"
              >

                <option value="all">
                  All Roles
                </option>

                <option value="student">
                  Students
                </option>

                <option value="issuer">
                  Issuers
                </option>

                <option value="admin">
                  Admins
                </option>

              </select>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-blue-500"
              >

                <option value="all">
                  All Status
                </option>

                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>

              </select>

              <span className="flex items-center rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5 text-xs text-slate-500">

                Showing {filteredUsers.length} of{" "}
                {users.length} users

              </span>

            </div>

          </div>

          {/* Loading */}

          {loading && (

            <div className="px-6 py-20 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">

                <RefreshCw
                  size={26}
                  className="animate-spin text-blue-400"
                />

              </div>

              <p className="mt-5 font-medium text-slate-400">
                Loading users...
              </p>

            </div>
          )}

          {/* Empty */}

          {!loading &&
            filteredUsers.length === 0 && (

              <div className="px-6 py-20 text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-slate-500">

                  <Users size={30} />

                </div>

                <h3 className="mt-5 text-lg font-semibold">
                  No users found
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Try changing your search or filters.
                </p>

              </div>
            )}

          {/* Table */}

          {!loading &&
            filteredUsers.length > 0 && (

              <div className="overflow-x-auto">

                <table className="w-full min-w-[950px] text-left text-sm">

                  <thead>

                    <tr className="border-b border-white/10 bg-white/[0.015] text-xs uppercase tracking-wider text-slate-500">

                      <th className="px-6 py-4 font-semibold">
                        User
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Role
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Status
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Created
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Access
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredUsers.map(
                      (targetUser) => (

                        <tr
                          key={targetUser.id}
                          className="border-b border-white/5 transition last:border-0 hover:bg-blue-500/[0.025]"
                        >

                          {/* User */}

                          <td className="px-6 py-5">

                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">

                                {getRoleIcon(
                                  targetUser.role
                                )}

                              </div>

                              <div>

                                <p className="font-medium text-slate-200">
                                  {targetUser.name}
                                </p>

                                <p className="mt-1 text-xs text-slate-600">
                                  {targetUser.email}
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* Role */}

                          <td className="px-6 py-5">

                            <RoleBadge
                              role={
                                targetUser.role
                              }
                            />

                          </td>

                          {/* Status */}

                          <td className="px-6 py-5">

                            <StatusBadge
                              status={
                                targetUser.status
                              }
                            />

                          </td>

                          {/* Created */}

                          <td className="px-6 py-5 text-slate-500">

                            {formatDate(
                              targetUser.created_at
                            )}

                          </td>

                          {/* Access */}

                          <td className="px-6 py-5">

                            {targetUser.role ===
                            "admin" ? (

                              <span className="inline-flex items-center gap-2 rounded-xl border border-violet-400/10 bg-violet-500/[0.04] px-3 py-2 text-xs font-semibold text-violet-400">

                                <ShieldCheck
                                  size={14}
                                />

                                Admin Protected

                              </span>

                            ) : targetUser.status ===
                              "active" ? (

                              <button
                                type="button"
                                disabled={
                                  updatingId ===
                                  targetUser.id
                                }
                                onClick={() =>
                                  handleStatusChange(
                                    targetUser,
                                    "inactive"
                                  )
                                }
                                className="inline-flex items-center gap-2 rounded-xl border border-red-400/15 bg-red-500/[0.04] px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                              >

                                {updatingId ===
                                targetUser.id ? (
                                  <RefreshCw
                                    size={14}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <UserX
                                    size={14}
                                  />
                                )}

                                Deactivate

                              </button>

                            ) : (

                              <button
                                type="button"
                                disabled={
                                  updatingId ===
                                  targetUser.id
                                }
                                onClick={() =>
                                  handleStatusChange(
                                    targetUser,
                                    "active"
                                  )
                                }
                                className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/15 bg-emerald-500/[0.04] px-3 py-2 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                              >

                                {updatingId ===
                                targetUser.id ? (
                                  <RefreshCw
                                    size={14}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <UserCheck
                                    size={14}
                                  />
                                )}

                                Activate

                              </button>

                            )}

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
| User Statistic
|--------------------------------------------------------------------------
*/

function UserStat({
  icon: Icon,
  title,
  value,
  loading,
  iconClass,
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-xl shadow-black/10 backdrop-blur-xl">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-xs text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-black">
            {loading ? "..." : value}
          </p>

        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={19} />
        </div>

      </div>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Role Badge
|--------------------------------------------------------------------------
*/

function RoleBadge({ role }) {
  if (role === "admin") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold capitalize text-violet-400">

        <ShieldCheck size={14} />

        Admin

      </span>
    );
  }

  if (role === "issuer") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold capitalize text-blue-400">

        <BriefcaseBusiness size={14} />

        Issuer

      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold capitalize text-cyan-400">

      <GraduationCap size={14} />

      Student

    </span>
  );
}

/*
|--------------------------------------------------------------------------
| Status Badge
|--------------------------------------------------------------------------
*/

function StatusBadge({ status }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">

        <CheckCircle2 size={14} />

        Active

      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400">

      <XCircle size={14} />

      Inactive

    </span>
  );
}

/*
|--------------------------------------------------------------------------
| Role Icon
|--------------------------------------------------------------------------
*/

function getRoleIcon(role) {
  if (role === "admin") {
    return <ShieldCheck size={19} />;
  }

  if (role === "issuer") {
    return <BriefcaseBusiness size={19} />;
  }

  return <GraduationCap size={19} />;
}

/*
|--------------------------------------------------------------------------
| Date Formatter
|--------------------------------------------------------------------------
*/

function formatDate(date) {
  if (!date) {
    return "—";
  }

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}