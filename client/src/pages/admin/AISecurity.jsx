import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ShieldCheck,
  BrainCircuit,
  RefreshCw,
  LogOut,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Activity,
  SearchCheck,
  Ban,
  FileWarning,
  Zap,
  TrendingUp,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

export default function AISecurity() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [analyses, setAnalyses] =
    useState([]);

  const [stats, setStats] = useState({
    totalCertificates: 0,
    analyzedCertificates: 0,
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0,
    anomalies: 0,
    totalVerificationAttempts: 0,
    failedVerificationAttempts: 0,
    revokedVerificationAttempts: 0,
    averageRiskScore: 0,
  });

  const [model, setModel] =
    useState("Isolation Forest");

  const [aiService, setAIService] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Fetch AI Security Data
  |--------------------------------------------------------------------------
  */

  const fetchAISecurity =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            "/ai-security/dashboard"
          );

        if (
          !response.data?.success
        ) {
          throw new Error(
            response.data?.message ||
              "Failed to load AI security data."
          );
        }

        setAnalyses(
          response.data.analyses ||
            []
        );

        setStats(
          response.data.stats || {}
        );

        setModel(
          response.data.model ||
            "Isolation Forest"
        );

        setAIService(
          Boolean(
            response.data.aiService
          )
        );

      } catch (err) {
        console.error(
          "AI security error:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
            err.message ||
            "Unable to load AI security data."
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

    fetchAISecurity();
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
  | High Risk Records
  |--------------------------------------------------------------------------
  */

  const highRiskRecords =
    useMemo(
      () =>
        analyses.filter(
          (item) =>
            item.riskLevel ===
            "HIGH"
        ),
      [analyses]
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

          <Link
            to="/"
            className="flex items-center gap-3"
          >

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-600/25">

              <ShieldCheck
                size={24}
              />

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
              onClick={
                handleLogout
              }
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-red-400/20 hover:bg-red-500/10 hover:text-red-300"
            >

              <LogOut
                size={16}
              />

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

          <ArrowLeft
            size={16}
          />

          Back to Admin Dashboard

        </Link>

        {/* ================================================================
            HEADER
        ================================================================= */}

        <section className="mt-7 relative overflow-hidden rounded-3xl border border-violet-400/15 bg-gradient-to-br from-violet-500/[0.10] via-slate-900/80 to-blue-500/[0.08] p-7 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-9">

          <div className="pointer-events-none absolute right-[-100px] top-[-120px] h-[350px] w-[350px] rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">

            <div>

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-300">

                <BrainCircuit
                  size={14}
                />

                AI Security Center

              </div>

              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">

                AI{" "}

                <span className="bg-gradient-to-r from-blue-400 to-violet-500 bg-clip-text text-transparent">
                  Security
                </span>

              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                Analyze certificate verification behavior
                and identify unusual activity using the
                platform's AI anomaly detection service.
              </p>

            </div>

            <div className="hidden shrink-0 lg:block">

              <div className="flex h-28 w-28 items-center justify-center rounded-3xl border border-violet-400/20 bg-violet-500/10">

                <BrainCircuit
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
                AI security data could not be loaded
              </p>

              <p className="mt-1 text-sm text-red-300/80">
                {error}
              </p>

            </div>

          </div>

        )}

        {/* ================================================================
            AI STATUS
        ================================================================= */}

        <section className="mt-8 flex flex-col justify-between gap-4 rounded-2xl border border-violet-400/15 bg-violet-500/[0.05] px-5 py-4 sm:flex-row sm:items-center">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">

              <BrainCircuit
                size={19}
              />

            </div>

            <div>

              <p className="text-sm font-semibold text-slate-200">
                AI Detection Engine
              </p>

              <p className="text-xs text-slate-500">
                Model: {model}
              </p>

            </div>

          </div>

          <div className="flex items-center gap-3">

            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                aiService
                  ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-400"
                  : "border-red-400/20 bg-red-500/10 text-red-400"
              }`}
            >

              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  aiService
                    ? "bg-emerald-400"
                    : "bg-red-400"
                }`}
              />

              {aiService
                ? "AI SERVICE ONLINE"
                : "AI SERVICE UNAVAILABLE"}

            </span>

            <button
              type="button"
              onClick={
                fetchAISecurity
              }
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium text-slate-300 transition hover:border-violet-400/20 hover:bg-violet-500/10 hover:text-white disabled:opacity-50"
            >

              <RefreshCw
                size={14}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh

            </button>

          </div>

        </section>

        {/* ================================================================
            STATISTICS
        ================================================================= */}

        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <SecurityStat
            icon={FileWarning}
            title="Anomalies"
            value={
              loading
                ? "..."
                : stats.anomalies || 0
            }
            description="Detected unusual certificates"
            iconClass="bg-red-500/10 text-red-400"
          />

          <SecurityStat
            icon={AlertTriangle}
            title="High Risk"
            value={
              loading
                ? "..."
                : stats.highRisk || 0
            }
            description="High risk certificates"
            iconClass="bg-orange-500/10 text-orange-400"
          />

          <SecurityStat
            icon={Activity}
            title="Verifications"
            value={
              loading
                ? "..."
                : stats.totalVerificationAttempts ||
                  0
            }
            description="Total verification attempts"
            iconClass="bg-blue-500/10 text-blue-400"
          />

          <SecurityStat
            icon={TrendingUp}
            title="Average Risk"
            value={
              loading
                ? "..."
                : `${stats.averageRiskScore || 0}%`
            }
            description="Average AI risk score"
            iconClass="bg-violet-500/10 text-violet-400"
          />

        </section>

        {/* ================================================================
            RISK DISTRIBUTION
        ================================================================= */}

        <section className="mt-8 grid gap-5 lg:grid-cols-3">

          <RiskCard
            title="High Risk"
            value={
              stats.highRisk || 0
            }
            description="Requires administrator attention"
            icon={AlertTriangle}
            className="border-red-400/15 bg-red-500/[0.05]"
            iconClass="bg-red-500/10 text-red-400"
            textClass="text-red-400"
          />

          <RiskCard
            title="Medium Risk"
            value={
              stats.mediumRisk || 0
            }
            description="Potentially unusual behavior"
            icon={Activity}
            className="border-amber-400/15 bg-amber-500/[0.05]"
            iconClass="bg-amber-500/10 text-amber-400"
            textClass="text-amber-400"
          />

          <RiskCard
            title="Low Risk"
            value={
              stats.lowRisk || 0
            }
            description="No significant anomaly detected"
            icon={CheckCircle2}
            className="border-emerald-400/15 bg-emerald-500/[0.05]"
            iconClass="bg-emerald-500/10 text-emerald-400"
            textClass="text-emerald-400"
          />

        </section>

        {/* ================================================================
            HIGH RISK ALERTS
        ================================================================= */}

        <section className="mt-8 overflow-hidden rounded-3xl border border-red-400/15 bg-slate-900/70 backdrop-blur-xl">

          <div className="border-b border-white/10 px-6 py-6 sm:px-8">

            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-400">

                <AlertTriangle
                  size={21}
                />

              </div>

              <div>

                <h2 className="text-xl font-bold">
                  Security Alerts
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Certificates requiring additional attention based on AI analysis.
                </p>

              </div>

            </div>

          </div>

          {highRiskRecords.length === 0 ? (

            <div className="px-6 py-12 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">

                <CheckCircle2
                  size={27}
                />

              </div>

              <h3 className="mt-4 font-semibold">
                No high-risk certificates detected
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                The current verification data does not contain certificates classified as high risk.
              </p>

            </div>

          ) : (

            <div className="divide-y divide-white/5">

              {highRiskRecords
                .slice(0, 10)
                .map((item) => (

                  <div
                    key={
                      item.certificateId
                    }
                    className="flex flex-col gap-5 px-6 py-5 transition hover:bg-red-500/[0.025] lg:flex-row lg:items-center lg:justify-between"
                  >

                    <div className="flex items-start gap-4">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">

                        <FileWarning
                          size={20}
                        />

                      </div>

                      <div>

                        <p className="font-mono text-sm font-semibold text-red-400">
                          {item.certificateId}
                        </p>

                        <p className="mt-1 font-medium text-slate-200">
                          {item.studentName ||
                            "Unknown Student"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {item.course ||
                            "Certificate"}
                        </p>

                      </div>

                    </div>

                    <div className="flex flex-wrap items-center gap-3">

                      <RiskBadge
                        level={
                          item.riskLevel
                        }
                        score={
                          item.riskScore
                        }
                      />

                      <Link
                        to={`/verify/${encodeURIComponent(
                          item.certificateId
                        )}`}
                        target="_blank"
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-blue-400/20 hover:bg-blue-500/10 hover:text-blue-400"
                      >

                        <SearchCheck
                          size={14}
                        />

                        Verify

                      </Link>

                    </div>

                  </div>

                ))}

            </div>

          )}

        </section>

        {/* ================================================================
            AI ANALYSIS TABLE
        ================================================================= */}

        <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 shadow-2xl shadow-black/20 backdrop-blur-xl">

          <div className="border-b border-white/10 px-6 py-6 sm:px-8">

            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">

                <BrainCircuit
                  size={21}
                />

              </div>

              <div>

                <h2 className="text-xl font-bold">
                  Certificate AI Analysis
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Risk assessment generated from verification behavior.
                </p>

              </div>

            </div>

          </div>

          {loading ? (

            <div className="px-6 py-20 text-center">

              <RefreshCw
                size={27}
                className="mx-auto animate-spin text-violet-400"
              />

              <p className="mt-5 text-sm text-slate-500">
                Running AI security analysis...
              </p>

            </div>

          ) : analyses.length === 0 ? (

            <div className="px-6 py-20 text-center">

              <BrainCircuit
                size={35}
                className="mx-auto text-violet-400"
              />

              <p className="mt-5 font-semibold">
                No certificates available
              </p>

              <p className="mt-2 text-sm text-slate-500">
                AI analysis will appear when certificate records exist.
              </p>

            </div>

          ) : (

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
                      Risk Score
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Risk Level
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Verification Attempts
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      AI Result
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {analyses.map(
                    (item) => (

                      <tr
                        key={
                          item.certificateId
                        }
                        className="border-b border-white/5 transition last:border-0 hover:bg-violet-500/[0.025]"
                      >

                        <td className="px-6 py-5">

                          <p className="font-mono text-xs font-semibold text-blue-400">
                            {item.certificateId}
                          </p>

                        </td>

                        <td className="px-6 py-5">

                          <p className="font-medium text-slate-300">
                            {item.studentName ||
                              "Unknown"}
                          </p>

                          <p className="mt-1 text-xs text-slate-600">
                            {item.course ||
                              ""}
                          </p>

                        </td>

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-3">

                            <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-800">

                              <div
                                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                                style={{
                                  width: `${Math.min(
                                    Number(
                                      item.riskScore ||
                                        0
                                    ),
                                    100
                                  )}%`,
                                }}
                              />

                            </div>

                            <span className="font-semibold text-slate-300">
                              {item.riskScore ===
                              null
                                ? "—"
                                : `${item.riskScore}%`}
                            </span>

                          </div>

                        </td>

                        <td className="px-6 py-5">

                          <RiskBadge
                            level={
                              item.riskLevel
                            }
                            score={
                              item.riskScore
                            }
                          />

                        </td>

                        <td className="px-6 py-5">

                          <span className="text-slate-400">
                            {item.statistics
                              ?.total_attempts ||
                              0}
                          </span>

                        </td>

                        <td className="px-6 py-5">

                          {item.isAnomaly ? (

                            <span className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400">

                              <AlertTriangle
                                size={14}
                              />

                              Anomaly

                            </span>

                          ) : (

                            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">

                              <CheckCircle2
                                size={14}
                              />

                              Normal

                            </span>

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

            <ShieldCheck
              size={14}
            />

            Secure • Verified • AI-Assisted

          </div>

        </div>

      </footer>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Security Stat
|--------------------------------------------------------------------------
*/

function SecurityStat({
  icon: Icon,
  title,
  value,
  description,
  iconClass,
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-black/10 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-violet-400/20">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="mt-3 text-4xl font-black tracking-tight">
            {value}
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
| Risk Card
|--------------------------------------------------------------------------
*/

function RiskCard({
  title,
  value,
  description,
  icon: Icon,
  className,
  iconClass,
  textClass,
}) {
  return (
    <div
      className={`rounded-3xl border p-6 backdrop-blur-xl ${className}`}
    >

      <div className="flex items-center justify-between">

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >

          <Icon size={21} />

        </div>

        <span
          className={`text-3xl font-black ${textClass}`}
        >
          {value}
        </span>

      </div>

      <h3 className="mt-5 font-bold">
        {title}
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        {description}
      </p>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Risk Badge
|--------------------------------------------------------------------------
*/

function RiskBadge({
  level,
  score,
}) {
  if (level === "HIGH") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400">

        <AlertTriangle
          size={14}
        />

        HIGH
        {score !== null &&
          score !== undefined
          ? ` • ${score}%`
          : ""}

      </span>
    );
  }

  if (level === "MEDIUM") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400">

        <Activity
          size={14}
        />

        MEDIUM
        {score !== null &&
          score !== undefined
          ? ` • ${score}%`
          : ""}

      </span>
    );
  }

  if (level === "LOW") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">

        <CheckCircle2
          size={14}
        />

        LOW
        {score !== null &&
          score !== undefined
          ? ` • ${score}%`
          : ""}

      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-400/20 bg-slate-500/10 px-3 py-1.5 text-xs font-semibold text-slate-400">

      <Zap size={14} />

      UNAVAILABLE

    </span>
  );
}