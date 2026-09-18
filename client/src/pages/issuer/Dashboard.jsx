import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  FilePlus2,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  Ban,
  Download,
  ExternalLink,
  X,
  AlertTriangle,
  CheckCircle2,
  Home,
  LogOut,
  Sparkles,
  BrainCircuit,
  SearchCheck,
} from "lucide-react";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function IssuerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 0,
    valid: 0,
    revoked: 0,
    expired: 0,
    invalid: 0,
  });

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [revokeCertificate, setRevokeCertificate] = useState(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [revoking, setRevoking] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Fetch Certificates
  |--------------------------------------------------------------------------
  */

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/certificates/issuer");

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to load certificates."
        );
      }

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
        "Failed to fetch issuer certificates:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load certificate information."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Load Dashboard
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
  | Revoke Modal
  |--------------------------------------------------------------------------
  */

  const openRevokeModal = (certificate) => {
    setError("");
    setSuccessMessage("");
    setRevokeCertificate(certificate);
    setRevokeReason("");
  };

  const closeRevokeModal = () => {
    if (revoking) {
      return;
    }

    setRevokeCertificate(null);
    setRevokeReason("");
  };

  /*
  |--------------------------------------------------------------------------
  | Revoke Certificate
  |--------------------------------------------------------------------------
  */

  const handleRevoke = async () => {
    if (!revokeCertificate) {
      return;
    }

    const reason = revokeReason.trim();

    if (!reason) {
      setError(
        "Please enter a reason for revoking the certificate."
      );

      return;
    }

    try {
      setRevoking(true);
      setError("");
      setSuccessMessage("");

      const response = await api.patch(
        `/certificates/${encodeURIComponent(
          revokeCertificate.certificate_id
        )}/revoke`,
        {
          reason,
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to revoke certificate."
        );
      }

      setRevokeCertificate(null);
      setRevokeReason("");

      setSuccessMessage(
        `Certificate ${revokeCertificate.certificate_id} was revoked successfully.`
      );

      await fetchCertificates();
    } catch (err) {
      console.error(
        "Certificate revocation error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to revoke certificate."
      );
    } finally {
      setRevoking(false);
    }
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

    const url =
      `http://localhost:5000/api/certificates/${encodeURIComponent(
        certificateId
      )}/pdf`;

    window.open(url, "_blank");
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
  | Status Styling
  |--------------------------------------------------------------------------
  */

  const getStatusClass = (status) => {
    switch (status) {
      case "valid":
        return "border-emerald-400/20 bg-emerald-500/10 text-emerald-400";

      case "revoked":
        return "border-red-400/20 bg-red-500/10 text-red-400";

      case "expired":
        return "border-amber-400/20 bg-amber-500/10 text-amber-400";

      case "invalid":
        return "border-slate-400/20 bg-slate-500/10 text-slate-400";

      default:
        return "border-slate-400/20 bg-slate-500/10 text-slate-400";
    }
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

        <div className="absolute left-[-160px] top-10 h-[450px] w-[450px] rounded-full bg-blue-600/10 blur-3xl" />

        <div className="absolute right-[-150px] top-0 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-3xl" />

        <div className="absolute bottom-[-180px] left-1/3 h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-3xl" />

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

          {/* Navigation */}

          <div className="flex items-center gap-3">

            <Link
              to="/"
              className="hidden items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white sm:flex"
            >
              <Home size={16} />
              Home
            </Link>

            <Link
              to="/issuer/issue"
              className="hidden items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white sm:flex"
            >
              <FilePlus2 size={16} />
              Issue
            </Link>

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

        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">

          <div>

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-300">

              <Sparkles size={14} />

              Issuer Workspace

            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">

              Welcome,{" "}

              <span className="bg-gradient-to-r from-blue-400 to-violet-500 bg-clip-text text-transparent">
                {user?.name || "Issuer"}
              </span>{" "}

              👋

            </h1>

            <p className="mt-4 max-w-xl text-slate-400">
              Issue, manage and securely verify your digital
              certificates from one place.
            </p>

          </div>

          <Link
            to="/issuer/issue"
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-6 py-3.5 font-semibold shadow-lg shadow-blue-600/20 transition hover:from-blue-400 hover:to-violet-400"
          >
            <FilePlus2 size={18} />
            Issue Certificate
            <ArrowRight
              size={17}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>

        </div>

        {/* ================================================================
            MESSAGES
        ================================================================= */}

        {successMessage && (

          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.06] px-5 py-4">

            <CheckCircle2
              size={20}
              className="mt-0.5 shrink-0 text-emerald-400"
            />

            <p className="text-sm text-emerald-300">
              {successMessage}
            </p>

            <button
              type="button"
              onClick={() => setSuccessMessage("")}
              className="ml-auto text-emerald-400 hover:text-white"
            >
              <X size={18} />
            </button>

          </div>
        )}

        {error && (

          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/[0.06] px-5 py-4">

            <AlertTriangle
              size={20}
              className="mt-0.5 shrink-0 text-red-400"
            />

            <p className="text-sm text-red-300">
              {error}
            </p>

            <button
              type="button"
              onClick={() => setError("")}
              className="ml-auto text-red-400 hover:text-white"
            >
              <X size={18} />
            </button>

          </div>
        )}

        {/* ================================================================
            MAIN STATISTICS
        ================================================================= */}

        <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <DashboardCard
            icon={FileText}
            title="Total Certificates"
            value={stats.total}
            description="Certificates issued by you"
            loading={loading}
            iconClass="bg-blue-500/10 text-blue-400"
          />

          <DashboardCard
            icon={CheckCircle2}
            title="Valid"
            value={stats.valid}
            description="Currently active certificates"
            loading={loading}
            iconClass="bg-emerald-500/10 text-emerald-400"
          />

          <DashboardCard
            icon={Ban}
            title="Revoked"
            value={stats.revoked}
            description="Certificates withdrawn"
            loading={loading}
            iconClass="bg-red-500/10 text-red-400"
          />

          <DashboardCard
            icon={AlertTriangle}
            title="Expired"
            value={stats.expired}
            description="Certificates past validity"
            loading={loading}
            iconClass="bg-amber-500/10 text-amber-400"
          />

        </section>

        {/* ================================================================
            SECURITY OVERVIEW
        ================================================================= */}

        <section className="mt-6 grid gap-5 lg:grid-cols-3">

          <div className="rounded-3xl border border-blue-400/15 bg-gradient-to-br from-blue-500/[0.08] to-slate-900/80 p-6 backdrop-blur-xl lg:col-span-2">

            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10 text-blue-400">
                  <ShieldCheck size={28} />
                </div>

                <div>

                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                    Security Layer
                  </p>

                  <h2 className="mt-1 text-xl font-bold">
                    Multi-Layer Certificate Protection
                  </h2>

                </div>

              </div>

              <span className="w-fit rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400">
                PROTECTED
              </span>

            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">

              <SecurityItem
                icon={ShieldCheck}
                title="Secure Issuance"
                text="Role-based access"
              />

              <SecurityItem
                icon={FileText}
                title="SHA-256"
                text="Integrity protection"
              />

              <SecurityItem
                icon={BrainCircuit}
                title="AI Detection"
                text="Anomaly analysis"
              />

            </div>

          </div>

          <div className="rounded-3xl border border-violet-400/15 bg-gradient-to-br from-violet-500/[0.08] to-slate-900/80 p-6 backdrop-blur-xl">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
              <BrainCircuit size={24} />
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
              AI Security
            </p>

            <h2 className="mt-2 text-xl font-bold">
              Fraud Detection
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Verification behavior is analyzed using the
              Isolation Forest machine-learning model.
            </p>

          </div>

        </section>

        {/* ================================================================
            MANAGEMENT HEADER
        ================================================================= */}

        <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 shadow-2xl shadow-black/20 backdrop-blur-xl">

          <div className="flex flex-col justify-between gap-5 border-b border-white/10 px-6 py-6 sm:flex-row sm:items-center sm:px-8">

            <div>

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <SearchCheck size={20} />
                </div>

                <div>

                  <h2 className="text-xl font-bold">
                    Certificate Management
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    View and manage certificates issued by you.
                  </p>

                </div>

              </div>

            </div>

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={fetchCertificates}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-blue-400/20 hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
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

              <Link
                to="/issuer/issue"
                className="hidden items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold transition hover:bg-blue-500 sm:flex"
              >

                <FilePlus2 size={16} />

                New Certificate

              </Link>

            </div>

          </div>

          {/* ==============================================================
              TABLE
          ============================================================== */}

          {loading && (

            <div className="px-6 py-20 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">

                <RefreshCw
                  size={25}
                  className="animate-spin text-blue-400"
                />

              </div>

              <p className="mt-5 font-medium text-slate-400">
                Loading certificates...
              </p>

              <p className="mt-1 text-sm text-slate-600">
                Retrieving your certificate records.
              </p>

            </div>

          )}

          {!loading &&
            certificates.length === 0 && (

              <div className="px-6 py-20 text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">

                  <FileText size={30} />

                </div>

                <h3 className="mt-5 text-lg font-semibold">
                  No certificates yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  Create your first digital certificate and
                  it will appear here.
                </p>

                <Link
                  to="/issuer/issue"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-5 py-3 text-sm font-semibold"
                >
                  <FilePlus2 size={17} />
                  Issue Certificate
                </Link>

              </div>
            )}

          {!loading &&
            certificates.length > 0 && (

              <div className="overflow-x-auto">

                <table className="w-full min-w-[1050px] text-left text-sm">

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
                        Status
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Issue Date
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Actions
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {certificates
                      .slice(0, 10)
                      .map((certificate) => (

                        <tr
                          key={certificate.id}
                          className="border-b border-white/5 transition last:border-0 hover:bg-blue-500/[0.025]"
                        >

                          {/* Certificate */}

                          <td className="px-6 py-5">

                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                                <FileText size={18} />
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

                          {/* Student */}

                          <td className="px-6 py-5">

                            <p className="font-medium text-slate-200">
                              {certificate.student_name}
                            </p>

                            <p className="mt-1 text-xs text-slate-600">
                              {certificate.student_email}
                            </p>

                          </td>

                          {/* Course */}

                          <td className="max-w-[240px] px-6 py-5">

                            <p className="truncate text-slate-400">
                              {certificate.course}
                            </p>

                          </td>

                          {/* Status */}

                          <td className="px-6 py-5">

                            <span
                              className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${getStatusClass(
                                certificate.status
                              )}`}
                            >
                              {certificate.status}
                            </span>

                          </td>

                          {/* Date */}

                          <td className="px-6 py-5 text-slate-500">
                            {certificate.issue_date ||
                              "-"}
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
                                <ExternalLink size={16} />
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
                                <Download size={16} />
                              </button>

                              {certificate.status !==
                                "revoked" ? (
                                <button
                                  type="button"
                                  title="Revoke Certificate"
                                  onClick={() =>
                                    openRevokeModal(
                                      certificate
                                    )
                                  }
                                  className="rounded-xl border border-red-400/15 bg-red-500/[0.04] p-2.5 text-red-400 transition hover:bg-red-500/10"
                                >
                                  <Ban size={16} />
                                </button>
                              ) : (
                                <span
                                  title="Certificate already revoked"
                                  className="rounded-xl border border-red-400/10 bg-red-500/[0.03] p-2.5 text-red-500/40"
                                >
                                  <Ban size={16} />
                                </span>
                              )}

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
          REVOKE MODAL
      ================================================================= */}

      {revokeCertificate && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-6 backdrop-blur-md">

          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-red-400/15 bg-slate-900 shadow-2xl shadow-black/50">

            {/* Header */}

            <div className="flex items-start justify-between border-b border-white/10 px-6 py-6">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                  <Ban size={21} />
                </div>

                <div>

                  <h2 className="text-lg font-bold">
                    Revoke Certificate
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Change the certificate's verification status.
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={closeRevokeModal}
                disabled={revoking}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
              >
                <X size={19} />
              </button>

            </div>

            {/* Body */}

            <div className="px-6 py-6">

              <div className="rounded-2xl border border-amber-400/20 bg-amber-500/[0.05] p-4">

                <div className="flex gap-3">

                  <AlertTriangle
                    size={19}
                    className="mt-0.5 shrink-0 text-amber-400"
                  />

                  <div>

                    <p className="text-sm font-semibold text-amber-300">
                      Important
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      After revocation, public verification
                      will show this certificate as revoked.
                    </p>

                  </div>

                </div>

              </div>

              {/* Certificate ID */}

              <div className="mt-5">

                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Certificate ID
                </p>

                <p className="mt-2 rounded-xl border border-white/10 bg-slate-950 px-4 py-3 font-mono text-sm text-blue-400">
                  {revokeCertificate.certificate_id}
                </p>

              </div>

              {/* Student */}

              <div className="mt-5">

                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Student
                </p>

                <p className="mt-2 text-sm text-slate-200">
                  {revokeCertificate.student_name}
                </p>

              </div>

              {/* Reason */}

              <div className="mt-5">

                <label className="mb-2 block text-sm font-medium text-slate-300">

                  Reason for Revocation

                  <span className="ml-1 text-red-400">
                    *
                  </span>

                </label>

                <textarea
                  value={revokeReason}
                  onChange={(event) =>
                    setRevokeReason(
                      event.target.value
                    )
                  }
                  rows={4}
                  disabled={revoking}
                  placeholder="Enter the reason for revoking this certificate..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-red-400/50 focus:ring-4 focus:ring-red-500/10 disabled:opacity-50"
                />

              </div>

            </div>

            {/* Footer */}

            <div className="flex flex-col-reverse gap-3 border-t border-white/10 px-6 py-5 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={closeRevokeModal}
                disabled={revoking}
                className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleRevoke}
                disabled={
                  revoking ||
                  !revokeReason.trim()
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {revoking ? (
                  <>
                    <RefreshCw
                      size={16}
                      className="animate-spin"
                    />
                    Revoking...
                  </>
                ) : (
                  <>
                    <Ban size={16} />
                    Revoke Certificate
                  </>
                )}

              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Dashboard Card
|--------------------------------------------------------------------------
*/

function DashboardCard({
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

      <p className="mt-1 text-xs text-slate-500">
        {text}
      </p>

    </div>
  );
}