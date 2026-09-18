import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ShieldCheck,
  FileText,
  CheckCircle2,
  XCircle,
  Clock3,
  Ban,
  RefreshCw,
  LogOut,
  ExternalLink,
  Download,
  SearchCheck,
  Users,
  Activity,
  BrainCircuit,
  Sparkles,
  AlertTriangle,
  Home,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [certificates, setCertificates] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    valid: 0,
    revoked: 0,
    expired: 0,
    invalid: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Fetch Certificate Data
  |--------------------------------------------------------------------------
  */

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError("");

      let response;

      try {
        // Preferred admin endpoint
        response = await api.get("/certificates/admin");
      } catch (adminError) {
        // Fallback if admin endpoint is unavailable
        response = await api.get("/certificates");
      }

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to load certificate information."
        );
      }

      const certificateData =
        response.data.certificates || [];

      setCertificates(certificateData);

      setStats(
        response.data.stats ||
          calculateStats(certificateData)
      );
    } catch (err) {
      console.error(
        "Admin certificate fetch error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load admin dashboard data."
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

    fetchCertificates();
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
  | Verify Certificate
  |--------------------------------------------------------------------------
  */

  const handleVerify = (certificateId) => {
    if (!certificateId) {
      return;
    }

    window.open(
      `/verify/${encodeURIComponent(
        certificateId
      )}`,
      "_blank"
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Download Certificate PDF
  |--------------------------------------------------------------------------
  */

  const handleDownloadPDF = (certificateId) => {
    if (!certificateId) {
      return;
    }

    const pdfUrl =
      `http://localhost:5000/api/certificates/${encodeURIComponent(
        certificateId
      )}/pdf`;

    window.open(pdfUrl, "_blank");
  };

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

              <div className="absolute inset-0 rounded-xl bg-blue-400/20 blur-md" />

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

          {/* Right Navigation */}

          <div className="flex items-center gap-3">

            <Link
              to="/"
              className="hidden items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white sm:flex"
            >
              <Home size={16} />
              Home
            </Link>

            <div className="hidden border-l border-white/10 pl-4 text-right sm:block">

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

        <section className="relative overflow-hidden rounded-3xl border border-blue-400/15 bg-gradient-to-br from-blue-500/[0.10] via-slate-900/80 to-violet-500/[0.08] p-7 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-9">

          <div className="pointer-events-none absolute right-[-100px] top-[-120px] h-[350px] w-[350px] rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">

            <div>

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-300">

                <Sparkles size={14} />

                Administration Center

              </div>

              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">

                Admin{" "}

                <span className="bg-gradient-to-r from-blue-400 to-violet-500 bg-clip-text text-transparent">
                  Dashboard
                </span>

              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                Monitor certificate issuance, certificate
                status and platform security from a centralized
                administration workspace.
              </p>

            </div>

            <div className="hidden shrink-0 lg:block">

              <div className="flex h-28 w-28 items-center justify-center rounded-3xl border border-violet-400/20 bg-violet-500/10">

                <ShieldCheck
                  size={52}
                  className="text-violet-400"
                />

              </div>

            </div>

          </div>

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
                Dashboard data could not be loaded
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

          <StatCard
            icon={FileText}
            title="Total"
            value={stats.total}
            description="All certificates"
            loading={loading}
            iconClass="bg-blue-500/10 text-blue-400"
          />

          <StatCard
            icon={CheckCircle2}
            title="Valid"
            value={stats.valid}
            description="Active certificates"
            loading={loading}
            iconClass="bg-emerald-500/10 text-emerald-400"
          />

          <StatCard
            icon={Ban}
            title="Revoked"
            value={stats.revoked}
            description="Withdrawn certificates"
            loading={loading}
            iconClass="bg-red-500/10 text-red-400"
          />

          <StatCard
            icon={Clock3}
            title="Expired"
            value={stats.expired}
            description="Past validity"
            loading={loading}
            iconClass="bg-amber-500/10 text-amber-400"
          />

          <StatCard
            icon={XCircle}
            title="Invalid"
            value={stats.invalid}
            description="Integrity/status issues"
            loading={loading}
            iconClass="bg-slate-500/10 text-slate-400"
          />

        </section>

        {/* ================================================================
            ADMIN TOOLS
        ================================================================= */}

        <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

          {/* ============================================================
              USER MANAGEMENT
          ============================================================= */}

          <Link
            to="/admin/users"
            className="block h-full"
          >

            <AdminTool
              icon={Users}
              title="User Management"
              text="Manage platform accounts and access."
              status="Module"
            />

          </Link>

          {/* ============================================================
              ACTIVITY LOGS
          ============================================================= */}

          <Link
  to="/admin/activity-logs"
  className="block h-full"
>
  <AdminTool
    icon={Activity}
    title="Activity Logs"
    text="Review important platform actions."
    status="Module"
  />
</Link>

          {/* ============================================================
              VERIFICATION
          ============================================================= */}

          <AdminTool
            icon={SearchCheck}
            title="Verification"
            text="Open public certificate verification."
            action={
              <Link
                to="/verify"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-400 transition hover:text-blue-300"
              >
                Open Verification
                <ExternalLink size={14} />
              </Link>
            }
          />

          {/* ============================================================
              AI SECURITY
          ============================================================= */}

          <Link
  to="/admin/ai-security"
  className="block h-full"
>
  <AdminTool
    icon={BrainCircuit}
    title="AI Security"
    text="AI-assisted anomaly and fraud analysis."
    status="Active"
  />
</Link>

        </section>

        {/* ================================================================
            SECURITY OVERVIEW
        ================================================================= */}

        <section className="mt-8 grid gap-5 lg:grid-cols-3">

          {/* Platform Security */}

          <div className="rounded-3xl border border-blue-400/15 bg-gradient-to-br from-blue-500/[0.08] to-slate-900/80 p-6 backdrop-blur-xl lg:col-span-2">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">

                <ShieldCheck size={24} />

              </div>

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
                  Platform Security
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  Certificate Protection
                </h2>

              </div>

            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">

              <SecurityItem
                icon={ShieldCheck}
                title="SHA-256"
                text="Certificate integrity"
              />

              <SecurityItem
                icon={SearchCheck}
                title="QR Verification"
                text="Public verification"
              />

              <SecurityItem
                icon={BrainCircuit}
                title="AI Detection"
                text="Anomaly analysis"
              />

            </div>

          </div>

          {/* AI Security */}

          <div className="rounded-3xl border border-violet-400/15 bg-gradient-to-br from-violet-500/[0.08] to-slate-900/80 p-6 backdrop-blur-xl">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">

              <BrainCircuit size={24} />

            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
              AI Security
            </p>

            <h2 className="mt-2 text-xl font-bold">
              Fraud Detection
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Verification behavior can be analyzed for unusual
              activity using the project's AI anomaly detection
              service.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">

              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

              AI SERVICE

            </div>

          </div>

        </section>

        {/* ================================================================
            CERTIFICATE RECORDS
        ================================================================= */}

        <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 shadow-2xl shadow-black/20 backdrop-blur-xl">

          {/* Header */}

          <div className="flex flex-col justify-between gap-5 border-b border-white/10 px-6 py-6 sm:flex-row sm:items-center sm:px-8">

            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">

                <FileText size={21} />

              </div>

              <div>

                <h2 className="text-xl font-bold">
                  Certificate Records
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Overview of certificates stored in the platform.
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={fetchCertificates}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-blue-400/20 hover:bg-blue-500/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >

              <RefreshCw
                size={16}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh

            </button>

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
                Loading certificate records...
              </p>

            </div>

          )}

          {/* Empty */}

          {!loading &&
            certificates.length === 0 && (

              <div className="px-6 py-20 text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">

                  <FileText size={30} />

                </div>

                <h3 className="mt-5 text-lg font-semibold">
                  No certificate records
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Certificate records will appear here once
                  certificates are issued.
                </p>

              </div>

            )}

          {/* Certificate Table */}

          {!loading &&
            certificates.length > 0 && (

              <div className="overflow-x-auto">

                <table className="w-full min-w-[1100px] text-left text-sm">

                  <thead>

                    <tr className="border-b border-white/10 bg-white/[0.015] text-xs uppercase tracking-wider text-slate-500">

                      <th className="px-6 py-4 font-semibold">
                        Certificate
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Student
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Course
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Organization
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Date
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Status
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Actions
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {certificates
                      .slice(0, 15)
                      .map((certificate) => (

                        <tr
                          key={certificate.id}
                          className="border-b border-white/5 transition last:border-0 hover:bg-blue-500/[0.025]"
                        >

                          {/* Certificate */}

                          <td className="px-6 py-5">

                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">

                                <AwardIcon />

                              </div>

                              <div>

                                <p className="font-mono text-xs font-semibold text-blue-400">
                                  {certificate.certificate_id}
                                </p>

                                <p className="mt-1 text-xs text-slate-600">
                                  Certificate
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* Student */}

                          <td className="px-6 py-5">

                            <p className="font-medium text-slate-200">
                              {certificate.student_name ||
                                "—"}
                            </p>

                            <p className="mt-1 text-xs text-slate-600">
                              {certificate.student_email ||
                                ""}
                            </p>

                          </td>

                          {/* Course */}

                          <td className="max-w-[220px] px-6 py-5">

                            <p className="truncate text-slate-400">
                              {certificate.course ||
                                "—"}
                            </p>

                          </td>

                          {/* Organization */}

                          <td className="px-6 py-5 text-slate-400">

                            {certificate.organization ||
                              "—"}

                          </td>

                          {/* Date */}

                          <td className="px-6 py-5 text-slate-500">

                            {formatDate(
                              certificate.issue_date
                            )}

                          </td>

                          {/* Status */}

                          <td className="px-6 py-5">

                            <StatusBadge
                              status={
                                certificate.status
                              }
                            />

                          </td>

                          {/* Actions */}

                          <td className="px-6 py-5">

                            <div className="flex items-center gap-2">

                              <button
                                type="button"
                                title="Verify Certificate"
                                onClick={() =>
                                  handleVerify(
                                    certificate.certificate_id
                                  )
                                }
                                className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5 text-slate-400 transition hover:border-blue-400/20 hover:bg-blue-500/10 hover:text-blue-400"
                              >

                                <ExternalLink
                                  size={16}
                                />

                              </button>

                              <button
                                type="button"
                                title="Download PDF"
                                onClick={() =>
                                  handleDownloadPDF(
                                    certificate.certificate_id
                                  )
                                }
                                className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5 text-slate-400 transition hover:border-emerald-400/20 hover:bg-emerald-500/10 hover:text-emerald-400"
                              >

                                <Download
                                  size={16}
                                />

                              </button>

                            </div>

                          </td>

                        </tr>

                      ))}

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
| Statistics Helper
|--------------------------------------------------------------------------
*/

function calculateStats(certificates) {
  return {
    total: certificates.length,

    valid: certificates.filter(
      (certificate) =>
        certificate.status?.toLowerCase() === "valid"
    ).length,

    revoked: certificates.filter(
      (certificate) =>
        certificate.status?.toLowerCase() === "revoked"
    ).length,

    expired: certificates.filter(
      (certificate) =>
        certificate.status?.toLowerCase() === "expired"
    ).length,

    invalid: certificates.filter(
      (certificate) =>
        certificate.status?.toLowerCase() === "invalid"
    ).length,
  };
}

/*
|--------------------------------------------------------------------------
| Stat Card
|--------------------------------------------------------------------------
*/

function StatCard({
  icon: Icon,
  title,
  value,
  description,
  loading,
  iconClass,
}) {
  return (
    <div className="group rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-black/10 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-blue-400/20">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="mt-3 text-4xl font-black tracking-tight">
            {loading ? "..." : value}
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
| Admin Tool
|--------------------------------------------------------------------------
*/

function AdminTool({
  icon: Icon,
  title,
  text,
  status,
  action,
}) {
  return (
    <div className="h-full rounded-3xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-blue-400/30 hover:bg-slate-900">

      <div className="flex items-center justify-between">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">

          <Icon size={21} />

        </div>

        {status && (

          <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            {status}
          </span>

        )}

      </div>

      <h3 className="mt-5 font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {text}
      </p>

      {action}

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Security Item
|--------------------------------------------------------------------------
*/

function SecurityItem({
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">

      <Icon
        size={19}
        className="text-blue-400"
      />

      <p className="mt-3 text-sm font-semibold">
        {title}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {text}
      </p>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Status Badge
|--------------------------------------------------------------------------
*/

function StatusBadge({ status }) {
  const normalized =
    status?.toLowerCase();

  if (normalized === "valid") {

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">

        <CheckCircle2 size={14} />

        Valid

      </span>
    );
  }

  if (normalized === "revoked") {

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400">

        <Ban size={14} />

        Revoked

      </span>
    );
  }

  if (normalized === "expired") {

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400">

        <Clock3 size={14} />

        Expired

      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/20 bg-slate-500/10 px-3 py-1.5 text-xs font-semibold text-slate-400">

      <XCircle size={14} />

      Invalid

    </span>
  );
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

/*
|--------------------------------------------------------------------------
| Award Icon
|--------------------------------------------------------------------------
*/

function AwardIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="6" />

      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.12" />

    </svg>
  );
}