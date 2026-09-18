import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  SearchCheck,
  QrCode,
  LockKeyhole,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  BrainCircuit,
  Fingerprint,
  Clock3,
  FileCheck2,
} from "lucide-react";
import api from "../services/api";

function VerifyCertificate() {
  const { certificateId: urlCertificateId } = useParams();
  const navigate = useNavigate();

  const [certificateId, setCertificateId] = useState(
    urlCertificateId || ""
  );

  const [certificate, setCertificate] = useState(null);
  const [verificationResult, setVerificationResult] =
    useState(null);

  const [aiAnalysis, setAiAnalysis] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Automatically verify direct URL / QR URL
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (urlCertificateId) {
      setCertificateId(urlCertificateId);
      verifyCertificate(urlCertificateId);
    }
  }, [urlCertificateId]);

  /*
  |--------------------------------------------------------------------------
  | Verify Certificate
  |--------------------------------------------------------------------------
  */

  const verifyCertificate = async (
    id = certificateId
  ) => {
    const normalizedId = id.trim();

    if (!normalizedId) {
      setError("Please enter a Certificate ID.");
      return;
    }

    setLoading(true);
    setError("");
    setCertificate(null);
    setVerificationResult(null);
    setAiAnalysis(null);

    try {
      const response = await api.get(
        `/certificates/verify/${encodeURIComponent(
          normalizedId
        )}`
      );

      const data = response.data;

      setVerificationResult(data.result);
      setCertificate(data.certificate);
      setAiAnalysis(data.aiAnalysis || null);
    } catch (err) {
      if (err.response?.status === 404) {
        setVerificationResult("Not Found");
        setCertificate(null);
        setAiAnalysis(null);

        setError(
          "No certificate was found with this Certificate ID."
        );
      } else {
        setVerificationResult("Error");
        setCertificate(null);
        setAiAnalysis(null);

        setError(
          err.response?.data?.message ||
            "Unable to verify the certificate. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  const handleSubmit = (event) => {
    event.preventDefault();

    const normalizedId = certificateId.trim();

    if (!normalizedId) {
      setError("Please enter a Certificate ID.");
      return;
    }

    navigate(
      `/verify/${encodeURIComponent(normalizedId)}`
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Reset
  |--------------------------------------------------------------------------
  */

  const handleReset = () => {
    setCertificateId("");
    setCertificate(null);
    setVerificationResult(null);
    setAiAnalysis(null);
    setError("");

    navigate("/verify");
  };

  /*
  |--------------------------------------------------------------------------
  | Verification states
  |--------------------------------------------------------------------------
  */

  const isValid = verificationResult === "Valid";
  const isRevoked = verificationResult === "Revoked";
  const isExpired = verificationResult === "Expired";
  const isInvalid = verificationResult === "Invalid";

  /*
  |--------------------------------------------------------------------------
  | AI states
  |--------------------------------------------------------------------------
  */

  const aiAvailable = aiAnalysis?.available === true;

  const aiRiskLevel =
    aiAnalysis?.riskLevel || "UNAVAILABLE";

  const aiRiskScore =
    aiAnalysis?.riskScore ?? null;

  const aiAnomalies =
    Array.isArray(aiAnalysis?.anomalies)
      ? aiAnalysis.anomalies
      : [];

  const aiStatistics =
    aiAnalysis?.statistics || null;

  /*
  |--------------------------------------------------------------------------
  | AI risk styling
  |--------------------------------------------------------------------------
  */

  const getRiskStyles = () => {
    if (aiRiskLevel === "HIGH") {
      return {
        container:
          "border-red-500/25 bg-red-500/[0.05]",
        icon:
          "border-red-400/20 bg-red-500/10 text-red-400",
        text: "text-red-400",
        badge:
          "border-red-400/20 bg-red-500/10 text-red-400",
        bar: "bg-red-500",
      };
    }

    if (aiRiskLevel === "MEDIUM") {
      return {
        container:
          "border-amber-500/25 bg-amber-500/[0.05]",
        icon:
          "border-amber-400/20 bg-amber-500/10 text-amber-400",
        text: "text-amber-400",
        badge:
          "border-amber-400/20 bg-amber-500/10 text-amber-400",
        bar: "bg-amber-500",
      };
    }

    return {
      container:
        "border-emerald-500/25 bg-emerald-500/[0.05]",
      icon:
        "border-emerald-400/20 bg-emerald-500/10 text-emerald-400",
      text: "text-emerald-400",
      badge:
        "border-emerald-400/20 bg-emerald-500/10 text-emerald-400",
      bar: "bg-emerald-500",
    };
  };

  const riskStyles = getRiskStyles();

  /*
  |--------------------------------------------------------------------------
  | Verification status styling
  |--------------------------------------------------------------------------
  */

  const getStatusStyles = () => {
    if (isValid) {
      return {
        wrapper:
          "border-emerald-400/20 bg-emerald-500/[0.06]",
        icon:
          "border-emerald-400/20 bg-emerald-500/10 text-emerald-400",
        title: "text-emerald-400",
        badge:
          "border-emerald-400/20 bg-emerald-500/10 text-emerald-400",
      };
    }

    if (isRevoked || isInvalid) {
      return {
        wrapper:
          "border-red-400/20 bg-red-500/[0.06]",
        icon:
          "border-red-400/20 bg-red-500/10 text-red-400",
        title: "text-red-400",
        badge:
          "border-red-400/20 bg-red-500/10 text-red-400",
      };
    }

    return {
      wrapper:
        "border-amber-400/20 bg-amber-500/[0.06]",
      icon:
        "border-amber-400/20 bg-amber-500/10 text-amber-400",
      title: "text-amber-400",
      badge:
        "border-amber-400/20 bg-amber-500/10 text-amber-400",
    };
  };

  const statusStyles = getStatusStyles();

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

        <div className="absolute left-[-150px] top-20 h-[450px] w-[450px] rounded-full bg-blue-600/10 blur-3xl" />

        <div className="absolute right-[-120px] top-0 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-3xl" />

        <div className="absolute bottom-[-150px] left-1/3 h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-3xl" />

      </div>

      {/* ================================================================
          NAVBAR
      ================================================================= */}

      <header className="relative z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">

        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-6">

          <button
            onClick={() => navigate("/")}
            className="group flex items-center gap-3"
          >

            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-600/25">

              <ShieldCheck
                size={24}
                strokeWidth={2.2}
              />

              <div className="absolute inset-0 rounded-xl bg-blue-400/20 blur-md" />

            </div>

            <div className="text-left">

              <p className="text-xl font-bold tracking-tight">
                Certify
              </p>

              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                Digital Trust Platform
              </p>

            </div>

          </button>

          <button
            onClick={() => navigate("/")}
            className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-blue-400/20 hover:bg-white/[0.06] hover:text-white"
          >

            <ArrowLeft
              size={16}
              className="transition-transform group-hover:-translate-x-0.5"
            />

            Back to Home

          </button>

        </div>

      </header>

      {/* ================================================================
          MAIN
      ================================================================= */}

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-14 sm:py-20">

        {/* ================================================================
            HEADER
        ================================================================= */}

        <div className="mx-auto max-w-3xl text-center">

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/25 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">

            <ShieldCheck size={16} />

            AI-Powered Certificate Authentication

            <Sparkles
              size={14}
              className="text-violet-300"
            />

          </div>

          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">

            Verify Certificates.

            <span className="block bg-gradient-to-r from-blue-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
              Build Trust.
            </span>

          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Verify certificate authenticity, cryptographic
            integrity, and AI-based behavioral risk in seconds.
          </p>

        </div>

        {/* ================================================================
            SEARCH CARD
        ================================================================= */}

        <div className="mx-auto mt-10 max-w-3xl">

          <form
            onSubmit={handleSubmit}
            className="relative overflow-hidden rounded-3xl border border-blue-400/15 bg-slate-900/70 p-5 shadow-2xl shadow-blue-950/20 backdrop-blur-xl sm:p-6"
          >

            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative">

              <div className="mb-4 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <SearchCheck size={20} />
                </div>

                <div>

                  <p className="font-semibold">
                    Certificate Verification
                  </p>

                  <p className="text-xs text-slate-500">
                    Enter your unique certificate ID
                  </p>

                </div>

              </div>

              <div className="flex flex-col gap-3 sm:flex-row">

                <input
                  type="text"
                  value={certificateId}
                  onChange={(event) =>
                    setCertificateId(
                      event.target.value.toUpperCase()
                    )
                  }
                  placeholder="e.g. CERT-2026-E1A59E21"
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950/80 px-5 py-4 font-mono text-sm text-white outline-none transition placeholder:font-sans placeholder:text-slate-600 focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/10"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-7 py-4 font-semibold shadow-lg shadow-blue-600/20 transition hover:from-blue-400 hover:to-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify Certificate
                      <ArrowRightIcon />
                    </>
                  )}

                </button>

              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">

                <span className="flex items-center gap-1.5">
                  <QrCode size={14} />
                  QR Verification
                </span>

                <span className="flex items-center gap-1.5">
                  <Fingerprint size={14} />
                  SHA-256 Integrity
                </span>

                <span className="flex items-center gap-1.5">
                  <BrainCircuit size={14} />
                  AI Analysis
                </span>

              </div>

            </div>

          </form>

        </div>

        {/* ================================================================
            LOADING
        ================================================================= */}

        {loading && (

          <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-blue-400/15 bg-blue-500/[0.04] p-8 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">

              <div className="h-7 w-7 animate-spin rounded-full border-2 border-blue-400/20 border-t-blue-400" />

            </div>

            <h3 className="mt-5 font-semibold">
              Verifying Certificate
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Checking certificate status, SHA-256 integrity,
              and AI fraud risk...
            </p>

          </div>

        )}

        {/* ================================================================
            NOT FOUND
        ================================================================= */}

        {!loading &&
          error &&
          verificationResult === "Not Found" && (

            <div className="mx-auto mt-8 max-w-3xl rounded-3xl border border-red-400/20 bg-red-500/[0.05] p-7">

              <div className="flex items-start gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                  <AlertTriangle size={23} />
                </div>

                <div>

                  <h3 className="text-lg font-bold text-red-300">
                    Certificate Not Found
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {error}
                  </p>

                  <button
                    onClick={handleReset}
                    className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
                  >
                    Try Another Certificate
                  </button>

                </div>

              </div>

            </div>
          )}

        {/* ================================================================
            GENERAL ERROR
        ================================================================= */}

        {!loading &&
          error &&
          verificationResult === "Error" && (

            <div className="mx-auto mt-8 max-w-3xl rounded-3xl border border-amber-400/20 bg-amber-500/[0.05] p-7">

              <div className="flex items-start gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                  <AlertTriangle size={23} />
                </div>

                <div>

                  <h3 className="text-lg font-bold text-amber-300">
                    Verification Error
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {error}
                  </p>

                </div>

              </div>

            </div>
          )}

        {/* ================================================================
            RESULT
        ================================================================= */}

        {!loading &&
          certificate &&
          verificationResult && (

            <div className="mx-auto mt-10 max-w-4xl">

              {/* ==========================================================
                  STATUS
              =========================================================== */}

              <div
                className={`rounded-3xl border p-7 shadow-2xl shadow-black/20 sm:p-9 ${statusStyles.wrapper}`}
              >

                <div className="flex flex-col items-center text-center">

                  <div
                    className={`flex h-20 w-20 items-center justify-center rounded-3xl border ${statusStyles.icon}`}
                  >

                    {isValid ? (
                      <CheckCircle2 size={42} />
                    ) : (
                      <AlertTriangle size={42} />
                    )}

                  </div>

                  <p className="mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                    Verification Result
                  </p>

                  <h2
                    className={`mt-2 text-4xl font-black ${statusStyles.title}`}
                  >
                    {verificationResult}
                  </h2>

                  <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">

                    {isValid &&
                      "This certificate was found in the Certify system and its digital integrity has been successfully verified."}

                    {isRevoked &&
                      "This certificate exists in the Certify system but has been revoked by the issuing authority."}

                    {isExpired &&
                      "This certificate exists in the Certify system but its validity period has expired."}

                    {isInvalid &&
                      "The certificate data could not be verified against its stored integrity hash."}

                  </p>

                  <div
                    className={`mt-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold ${statusStyles.badge}`}
                  >

                    <CheckCircle2 size={14} />

                    {isValid
                      ? "AUTHENTICATED"
                      : verificationResult.toUpperCase()}

                  </div>

                </div>

              </div>

              {/* ==========================================================
                  CERTIFICATE DETAILS
              =========================================================== */}

              <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 shadow-2xl shadow-black/20 backdrop-blur-xl">

                <div className="border-b border-white/10 bg-gradient-to-r from-blue-500/[0.06] to-violet-500/[0.04] px-6 py-6 sm:px-8">

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500">

                        <FileCheck2 size={14} />

                        Certificate ID

                      </div>

                      <p className="mt-2 font-mono text-lg font-bold text-white">
                        {certificate.certificateId}
                      </p>

                    </div>

                    <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">

                      <CheckCircle2 size={14} />

                      Verified Record

                    </div>

                  </div>

                </div>

                <div className="grid gap-px bg-white/5 sm:grid-cols-2">

                  <Detail
                    label="Student Name"
                    value={certificate.studentName}
                  />

                  <Detail
                    label="Course"
                    value={certificate.course}
                  />

                  <Detail
                    label="Certificate Type"
                    value={certificate.certificateType}
                  />

                  <Detail
                    label="Organization"
                    value={certificate.organization}
                  />

                  <Detail
                    label="Issuer"
                    value={certificate.issuer}
                  />

                  <Detail
                    label="Duration"
                    value={
                      certificate.duration ||
                      "Not specified"
                    }
                  />

                  <Detail
                    label="Issue Date"
                    value={
                      certificate.issueDate ||
                      "Not specified"
                    }
                  />

                  <Detail
                    label="Expiry Date"
                    value={
                      certificate.expiryDate ||
                      "No expiry"
                    }
                  />

                  <Detail
                    label="Grade / Score"
                    value={
                      certificate.gradeScore ||
                      "Not specified"
                    }
                  />

                  <Detail
                    label="Template"
                    value={
                      certificate.template ||
                      "Academic"
                    }
                  />

                </div>

                {certificate.description && (
                  <div className="border-t border-white/10 px-6 py-6 sm:px-8">

                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Description
                    </p>

                    <p className="mt-3 text-sm leading-7 text-slate-300">
                      {certificate.description}
                    </p>

                  </div>
                )}

                {certificate.skillsAchievements && (
                  <div className="border-t border-white/10 px-6 py-6 sm:px-8">

                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Skills & Achievements
                    </p>

                    <p className="mt-3 text-sm leading-7 text-slate-300">
                      {certificate.skillsAchievements}
                    </p>

                  </div>
                )}

              </div>

              {/* ==========================================================
                  SECURITY LAYERS
              =========================================================== */}

              <div className="mt-6 grid gap-5 sm:grid-cols-2">

                {/* SHA */}

                <div className="rounded-3xl border border-blue-400/20 bg-blue-500/[0.05] p-6">

                  <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-400">
                      <Fingerprint size={23} />
                    </div>

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                        Cryptographic Security
                      </p>

                      <h3 className="mt-1 font-bold">
                        SHA-256 Integrity
                      </h3>

                    </div>

                  </div>

                  <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-400/15 bg-emerald-500/[0.05] px-4 py-3">

                    <CheckCircle2
                      size={17}
                      className="text-emerald-400"
                    />

                    <span className="text-sm text-emerald-300">
                      Integrity Verified
                    </span>

                  </div>

                  <p className="mt-4 text-xs leading-5 text-slate-500">
                    Certificate data matches the stored
                    cryptographic hash and has not been modified
                    in the system.
                  </p>

                </div>

                {/* QR */}

                <div className="rounded-3xl border border-violet-400/20 bg-violet-500/[0.05] p-6">

                  <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-400">
                      <QrCode size={23} />
                    </div>

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                        Quick Verification
                      </p>

                      <h3 className="mt-1 font-bold">
                        QR Enabled
                      </h3>

                    </div>

                  </div>

                  <p className="mt-5 text-sm leading-6 text-slate-400">
                    This certificate can be verified quickly
                    using its unique QR verification link.
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-xs text-violet-300">
                    <LockKeyhole size={14} />
                    Secure verification endpoint
                  </div>

                </div>

              </div>

              {/* ==========================================================
                  AI FRAUD ANALYSIS
              =========================================================== */}

              <div
                className={`mt-6 rounded-3xl border p-6 shadow-2xl shadow-black/20 sm:p-8 ${riskStyles.container}`}
              >

                {/* AI header */}

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-center gap-4">

                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${riskStyles.icon}`}
                    >
                      <BrainCircuit size={27} />
                    </div>

                    <div>

                      <div className="flex items-center gap-2">

                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                          AI Security Layer
                        </p>

                        <Sparkles
                          size={13}
                          className="text-violet-400"
                        />

                      </div>

                      <h3 className="mt-1 text-2xl font-bold">
                        Fraud & Anomaly Analysis
                      </h3>

                    </div>

                  </div>

                  {aiAvailable && (
                    <span
                      className={`w-fit rounded-full border px-4 py-2 text-xs font-bold ${riskStyles.badge}`}
                    >
                      {aiRiskLevel} RISK
                    </span>
                  )}

                </div>

                {/* AI unavailable */}

                {!aiAvailable && (

                  <div className="mt-7 rounded-2xl border border-white/10 bg-slate-950/40 p-5">

                    <div className="flex items-center gap-3">

                      <AlertTriangle
                        size={18}
                        className="text-amber-400"
                      />

                      <p className="font-medium text-slate-300">
                        AI analysis unavailable
                      </p>

                    </div>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Certificate verification and SHA-256
                      integrity verification are still available.
                    </p>

                  </div>
                )}

                {/* AI available */}

                {aiAvailable && (
                  <>

                    {/* Score + model */}

                    <div className="mt-7 grid gap-5 sm:grid-cols-2">

                      <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">

                        <p className="text-sm text-slate-500">
                          AI Risk Score
                        </p>

                        <div className="mt-2 flex items-end gap-2">

                          <span
                            className={`text-5xl font-black ${riskStyles.text}`}
                          >
                            {aiRiskScore}
                          </span>

                          <span className="mb-1 text-sm text-slate-500">
                            / 100
                          </span>

                        </div>

                        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">

                          <div
                            className={`h-full rounded-full transition-all duration-700 ${riskStyles.bar}`}
                            style={{
                              width: `${Math.min(
                                Math.max(
                                  Number(
                                    aiRiskScore || 0
                                  ),
                                  0
                                ),
                                100
                              )}%`,
                            }}
                          />

                        </div>

                      </div>

                      <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">

                        <div className="flex items-center gap-2 text-slate-500">

                          <BrainCircuit size={16} />

                          <p className="text-sm">
                            Detection Model
                          </p>

                        </div>

                        <p className="mt-3 text-xl font-bold">
                          {aiAnalysis.model ||
                            "Isolation Forest"}
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          Machine-learning based behavioral
                          anomaly detection
                        </p>

                      </div>

                    </div>

                    {/* Assessment */}

                    <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/40 p-5">

                      <p className="text-sm font-medium text-slate-500">
                        AI Assessment
                      </p>

                      <p className="mt-2 text-sm leading-7 text-slate-300">
                        {aiAnalysis.summary}
                      </p>

                    </div>

                    {/* Anomalies */}

                    {aiAnomalies.length > 0 && (

                      <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] p-5">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                            <AlertTriangle size={18} />
                          </div>

                          <div>

                            <h4 className="font-semibold text-amber-300">
                              Detected Anomalies
                            </h4>

                            <p className="text-xs text-slate-500">
                              Behavioral patterns identified by
                              the AI analysis
                            </p>

                          </div>

                        </div>

                        <div className="mt-4 space-y-3">

                          {aiAnomalies.map(
                            (anomaly, index) => (

                              <div
                                key={index}
                                className="flex items-start gap-3 rounded-xl border border-white/5 bg-slate-950/50 p-4"
                              >

                                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />

                                <p className="text-sm leading-6 text-slate-300">
                                  {anomaly}
                                </p>

                              </div>

                            )
                          )}

                        </div>

                      </div>
                    )}

                    {/* Statistics */}

                    {aiStatistics && (

                      <div className="mt-6">

                        <div className="mb-3 flex items-center gap-2">

                          <Clock3
                            size={16}
                            className="text-slate-500"
                          />

                          <p className="text-sm font-medium text-slate-500">
                            Verification Behavior
                          </p>

                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

                          <Stat
                            label="Total Attempts"
                            value={
                              aiStatistics.totalAttempts
                            }
                          />

                          <Stat
                            label="Successful"
                            value={
                              aiStatistics.successfulAttempts
                            }
                          />

                          <Stat
                            label="Failed"
                            value={
                              aiStatistics.failedAttempts
                            }
                          />

                          <Stat
                            label="Revoked"
                            value={
                              aiStatistics.revokedAttempts
                            }
                          />

                          <Stat
                            label="Recent"
                            value={
                              aiStatistics.recentAttempts
                            }
                          />

                          <Stat
                            label="Unique Days"
                            value={
                              aiStatistics.uniqueDays
                            }
                          />

                        </div>

                      </div>
                    )}

                    {/* Explanation */}

                    <div className="mt-5 flex gap-3 rounded-xl border border-white/10 bg-slate-950/30 p-4">

                      <LockKeyhole
                        size={16}
                        className="mt-0.5 shrink-0 text-slate-500"
                      />

                      <p className="text-xs leading-5 text-slate-500">
                        AI analysis evaluates verification
                        behavior for unusual patterns. It is an
                        additional security signal and does not
                        replace the certificate's cryptographic
                        SHA-256 integrity check.
                      </p>

                    </div>

                  </>
                )}

              </div>

              {/* ==========================================================
                  FINAL ACTIONS
              =========================================================== */}

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">

                <button
                  onClick={handleReset}
                  className="group flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3.5 font-medium text-slate-300 transition hover:border-blue-400/20 hover:bg-white/[0.06] hover:text-white"
                >

                  <SearchCheck size={17} />

                  Verify Another Certificate

                </button>

                <button
                  onClick={() => navigate("/")}
                  className="group flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-5 py-3.5 font-semibold shadow-lg shadow-blue-600/20 transition hover:from-blue-400 hover:to-violet-400"
                >

                  Back to Certify

                  <ArrowRightIcon />

                </button>

              </div>

            </div>
          )}

      </main>

      {/* ================================================================
          FOOTER
      ================================================================= */}

      <footer className="relative z-10 border-t border-white/10 bg-slate-950/70">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-7 text-center sm:flex-row sm:text-left">

          <div className="flex items-center gap-2">

            <ShieldCheck
              size={18}
              className="text-blue-400"
            />

            <span className="text-sm font-semibold">
              Certify
            </span>

          </div>

          <p className="text-xs text-slate-500">
            AI-Enhanced Digital Certificate Authentication System
          </p>

        </div>

      </footer>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Arrow Icon
|--------------------------------------------------------------------------
*/

function ArrowRightIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-transform group-hover:translate-x-1"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

/*
|--------------------------------------------------------------------------
| Certificate Detail
|--------------------------------------------------------------------------
*/

function Detail({ label, value }) {
  return (
    <div className="bg-slate-950/60 px-6 py-5">

      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-medium text-slate-200">
        {value}
      </p>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| AI Statistics
|--------------------------------------------------------------------------
*/

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-white">
        {value}
      </p>

    </div>
  );
}

export default VerifyCertificate;