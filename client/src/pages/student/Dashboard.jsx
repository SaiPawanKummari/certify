import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  LogOut,
  Sparkles,
  ExternalLink,
  Download,
  SearchCheck,
  Award,
  CalendarDays,
  Building2,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

export default function Dashboard() {
  const { user, logout } = useAuth();

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
  | Fetch Student Certificates
  |--------------------------------------------------------------------------
  */

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/certificates/my"
      );

      setCertificates(
        response.data.certificates || []
      );

      setStats(
        response.data.stats || {
          total: 0,
          valid: 0,
          revoked: 0,
          expired: 0,
          invalid: 0,
        }
      );
    } catch (err) {
      console.error(
        "Certificate fetch error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load certificates."
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
    fetchCertificates();
  }, []);

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
  | Open Verification
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
  | Download PDF
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

        <div className="absolute right-[-180px] top-[80px] h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-3xl" />

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

          {/* User / Logout */}

          <div className="flex items-center gap-4">

            <div className="hidden text-right sm:block">

              <p className="text-sm font-medium text-slate-200">
                {user?.name || "Student"}
              </p>

              <p className="text-xs text-slate-600">
                Student Account
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
            HERO / WELCOME
        ================================================================= */}

        <section className="relative overflow-hidden rounded-3xl border border-blue-400/15 bg-gradient-to-br from-blue-500/[0.10] via-slate-900/80 to-violet-500/[0.08] p-7 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-9">

          <div className="pointer-events-none absolute right-[-80px] top-[-100px] h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">

            <div>

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-300">

                <Sparkles size={14} />

                Student Dashboard

              </div>

              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">

                Welcome,{" "}

                <span className="bg-gradient-to-r from-blue-400 to-violet-500 bg-clip-text text-transparent">
                  {user?.name || "Student"}
                </span>{" "}

                👋

              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                Manage your digital certificates, check their
                verification status and access secure certificate
                documents from one place.
              </p>

            </div>

            <div className="hidden shrink-0 lg:block">

              <div className="flex h-28 w-28 items-center justify-center rounded-3xl border border-blue-400/20 bg-blue-500/10">

                <Award
                  size={52}
                  className="text-blue-400"
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

            <XCircle
              size={20}
              className="mt-0.5 shrink-0 text-red-400"
            />

            <div>

              <p className="text-sm font-semibold text-red-300">
                Unable to load certificates
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

        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            icon={FileText}
            title="My Certificates"
            value={stats.total}
            description="Certificates issued to you"
            loading={loading}
            iconClass="bg-blue-500/10 text-blue-400"
          />

          <StatCard
            icon={CheckCircle}
            title="Valid"
            value={stats.valid}
            description="Currently valid certificates"
            loading={loading}
            iconClass="bg-emerald-500/10 text-emerald-400"
          />

          <StatCard
            icon={XCircle}
            title="Revoked"
            value={stats.revoked}
            description="Revoked certificates"
            loading={loading}
            iconClass="bg-red-500/10 text-red-400"
          />

          <StatCard
            icon={Clock}
            title="Expired"
            value={stats.expired}
            description="Expired certificates"
            loading={loading}
            iconClass="bg-amber-500/10 text-amber-400"
          />

        </section>

        {/* ================================================================
            SECURITY / QUICK ACTION
        ================================================================= */}

        <section className="mt-8 grid gap-5 lg:grid-cols-3">

          {/* Secure Verification */}

          <div className="rounded-3xl border border-blue-400/15 bg-gradient-to-br from-blue-500/[0.08] to-slate-900/80 p-6 backdrop-blur-xl lg:col-span-2">

            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">

                  <SearchCheck size={27} />

                </div>

                <div>

                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
                    Certificate Security
                  </p>

                  <h2 className="mt-1 text-xl font-bold">
                    Verify Your Certificate
                  </h2>

                </div>

              </div>

              <Link
                to="/verify"
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500"
              >

                Verify

                <ArrowRight size={16} />

              </Link>

            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">

              <SecurityItem
                icon={ShieldCheck}
                title="Secure"
                text="Protected certificate records"
              />

              <SecurityItem
                icon={FileText}
                title="SHA-256"
                text="Integrity verification"
              />

              <SecurityItem
                icon={SearchCheck}
                title="Public Verify"
                text="Easy certificate validation"
              />

            </div>

          </div>

          {/* Account */}

          <div className="rounded-3xl border border-violet-400/15 bg-gradient-to-br from-violet-500/[0.08] to-slate-900/80 p-6 backdrop-blur-xl">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">

              <GraduationCapIcon />

            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
              Account
            </p>

            <h2 className="mt-2 truncate text-xl font-bold">
              {user?.name || "Student"}
            </h2>

            <p className="mt-2 truncate text-sm text-slate-500">
              {user?.email || "Student account"}
            </p>

          </div>

        </section>

        {/* ================================================================
            CERTIFICATES
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
                  My Certificates
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Digital certificates issued to your account.
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
                Loading your certificates...
              </p>

              <p className="mt-1 text-sm text-slate-600">
                Retrieving your secure certificate records.
              </p>

            </div>

          )}

          {/* Empty */}

          {!loading &&
            certificates.length === 0 && (

              <div className="px-6 py-20 text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">

                  <FileText size={31} />

                </div>

                <h3 className="mt-5 text-lg font-semibold">
                  No certificates yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Certificates issued to your student account
                  will appear here.
                </p>

              </div>
            )}

          {/* Certificates */}

          {!loading &&
            certificates.length > 0 && (

              <div className="overflow-x-auto">

                <table className="w-full min-w-[1000px] text-left text-sm">

                  <thead>

                    <tr className="border-b border-white/10 bg-white/[0.015] text-xs uppercase tracking-wider text-slate-500">

                      <th className="px-6 py-4 font-semibold">
                        Certificate
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Course
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Organization
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Issue Date
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

                    {certificates.map(
                      (certificate) => (

                        <tr
                          key={certificate.id}
                          className="border-b border-white/5 transition last:border-0 hover:bg-blue-500/[0.025]"
                        >

                          {/* Certificate */}

                          <td className="px-6 py-5">

                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">

                                <Award size={18} />

                              </div>

                              <div>

                                <p className="font-mono text-xs font-semibold text-blue-400">
                                  {certificate.certificate_id}
                                </p>

                                <p className="mt-1 text-xs text-slate-600">
                                  Digital Certificate
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* Course */}

                          <td className="max-w-[230px] px-6 py-5">

                            <p className="truncate font-medium text-slate-300">
                              {certificate.course}
                            </p>

                          </td>

                          {/* Organization */}

                          <td className="px-6 py-5">

                            <div className="flex items-center gap-2 text-slate-400">

                              <Building2
                                size={15}
                                className="shrink-0 text-slate-600"
                              />

                              <span>
                                {certificate.organization ||
                                  "—"}
                              </span>

                            </div>

                          </td>

                          {/* Date */}

                          <td className="px-6 py-5">

                            <div className="flex items-center gap-2 text-slate-500">

                              <CalendarDays
                                size={15}
                                className="text-slate-600"
                              />

                              {formatDate(
                                certificate.issue_date
                              )}

                            </div>

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
                                title="Download Certificate PDF"
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

      <p className="mt-1 text-xs leading-5 text-slate-500">
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

        <CheckCircle size={14} />

        Valid

      </span>
    );
  }

  if (normalized === "revoked") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400">

        <XCircle size={14} />

        Revoked

      </span>
    );
  }

  if (normalized === "expired") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400">

        <Clock size={14} />

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
| Graduation Icon
|--------------------------------------------------------------------------
*/

function GraduationCapIcon() {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m22 10-10-5-10 5 10 5 10-5Z" />
      <path d="M6 12v5c3 2 9 2 12 0v-5" />
      <path d="M22 10v6" />
    </svg>
  );
}