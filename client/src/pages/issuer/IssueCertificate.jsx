import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  ArrowLeft,
  FilePlus2,
  CheckCircle,
  AlertCircle,
  Download,
  ExternalLink,
  Sparkles,
  BrainCircuit,
  LockKeyhole,
  QrCode,
  Hash,
  Building2,
  GraduationCap,
} from "lucide-react";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

/*
|--------------------------------------------------------------------------
| Certificate Options
|--------------------------------------------------------------------------
*/

const certificateTypes = [
  "Course Completion",
  "Internship",
  "Workshop",
  "Training",
  "Participation",
  "Achievement",
  "Appreciation",
  "Excellence",
  "Graduation",
  "Custom",
];

const templates = [
  "Academic",
  "Corporate",
  "Minimal",
  "Achievement",
];

/*
|--------------------------------------------------------------------------
| Get Local Date
|--------------------------------------------------------------------------
*/

const getLocalDate = () => {
  const today = new Date();

  const year = today.getFullYear();

  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    today.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function IssueCertificate() {
  const { user } = useAuth();

  /*
  |--------------------------------------------------------------------------
  | Form State
  |--------------------------------------------------------------------------
  */

  const [formData, setFormData] = useState({
    studentName: "",
    studentEmail: "",
    course: "",
    duration: "",
    certificateType: "Course Completion",
    organization: "",
    issueDate: getLocalDate(),
    expiryDate: "",
    description: "",
    gradeScore: "",
    skillsAchievements: "",
    template: "Academic",
  });

  /*
  |--------------------------------------------------------------------------
  | UI State
  |--------------------------------------------------------------------------
  */

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | Handle Change
  |--------------------------------------------------------------------------
  */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Submit Certificate
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess(null);
    setLoading(true);

    try {
      const response = await api.post(
        "/certificates",
        formData
      );

      setSuccess(
        response.data.certificate
      );

      setFormData({
        studentName: "",
        studentEmail: "",
        course: "",
        duration: "",
        certificateType: "Course Completion",
        organization: "",
        issueDate: getLocalDate(),
        expiryDate: "",
        description: "",
        gradeScore: "",
        skillsAchievements: "",
        template: "Academic",
      });
    } catch (err) {
      console.error(
        "Certificate creation error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to issue certificate. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Download PDF
  |--------------------------------------------------------------------------
  */

  const handleDownloadPDF = () => {
    if (!success?.certificate_id) {
      return;
    }

    const pdfUrl =
      `http://localhost:5000/api/certificates/${encodeURIComponent(
        success.certificate_id
      )}/pdf`;

    window.open(pdfUrl, "_blank");
  };

  /*
  |--------------------------------------------------------------------------
  | Verify Certificate
  |--------------------------------------------------------------------------
  */

  const handleVerifyCertificate = () => {
    if (!success?.certificate_id) {
      return;
    }

    window.open(
      `/verify/${encodeURIComponent(
        success.certificate_id
      )}`,
      "_blank"
    );
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

        <div className="absolute left-[-180px] top-[-100px] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-3xl" />

        <div className="absolute right-[-180px] top-[100px] h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-3xl" />

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

          <div className="flex items-center gap-3">

            <Link
              to="/issuer/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-blue-400/20 hover:bg-blue-500/10 hover:text-white"
            >
              <ArrowLeft size={16} />
              Dashboard
            </Link>

          </div>

        </div>

      </header>

      {/* ================================================================
          MAIN
      ================================================================= */}

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-10 sm:py-14">

        {/* ================================================================
            PAGE HEADER
        ================================================================= */}

        <div className="mb-10">

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-300">

            <Sparkles size={14} />

            Secure Certificate Issuance

          </div>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 text-blue-400 ring-1 ring-blue-400/20">

              <FilePlus2 size={27} />

            </div>

            <div>

              <p className="text-sm font-medium text-blue-400">
                Issuer Workspace
              </p>

              <h1 className="mt-1 text-4xl font-black tracking-tight sm:text-5xl">
                Issue Certificate
              </h1>

            </div>

          </div>

          <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
            Create a secure digital certificate for a registered
            student. Certify automatically generates a unique
            Certificate ID, SHA-256 integrity hash, QR code and
            downloadable PDF.
          </p>

        </div>

        {/* ================================================================
            SUCCESS
        ================================================================= */}

        {success && (

          <div className="mb-8 overflow-hidden rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/[0.08] to-slate-900/80 shadow-xl shadow-black/20">

            <div className="p-7">

              <div className="flex items-start gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">

                  <CheckCircle size={25} />

                </div>

                <div className="flex-1">

                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
                    Certificate Created
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-emerald-300">
                    Certificate issued successfully!
                  </h2>

                  <p className="mt-4 text-sm text-slate-400">
                    Your certificate has been securely stored
                    and is ready for verification.
                  </p>

                </div>

              </div>

              {/* Certificate ID */}

              <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/70 p-5">

                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Certificate ID
                </p>

                <p className="mt-2 break-all font-mono text-xl font-bold text-blue-400">
                  {success.certificate_id}
                </p>

              </div>

              {/* Security Cards */}

              <div className="mt-5 grid gap-3 sm:grid-cols-3">

                <SuccessSecurityCard
                  icon={Hash}
                  title="SHA-256"
                  text="Integrity protected"
                />

                <SuccessSecurityCard
                  icon={QrCode}
                  title="QR Code"
                  text="Instant verification"
                />

                <SuccessSecurityCard
                  icon={ShieldCheck}
                  title="Secure"
                  text="Verified certificate"
                />

              </div>

              {/* Actions */}

              <div className="mt-6 flex flex-wrap gap-3">

                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-5 py-3 text-sm font-semibold shadow-lg shadow-blue-600/20 transition hover:from-blue-400 hover:to-violet-400"
                >

                  <Download size={17} />

                  Download PDF

                </button>

                <button
                  type="button"
                  onClick={handleVerifyCertificate}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-blue-400/20 hover:bg-blue-500/10 hover:text-white"
                >

                  <ExternalLink size={17} />

                  Verify Certificate

                </button>

                <Link
                  to="/issuer/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
                >

                  Back to Dashboard

                </Link>

              </div>

            </div>

          </div>
        )}

        {/* ================================================================
            ERROR
        ================================================================= */}

        {error && (

          <div className="mb-8 flex items-start gap-4 rounded-2xl border border-red-400/20 bg-red-500/[0.06] px-5 py-4">

            <AlertCircle
              size={21}
              className="mt-0.5 shrink-0 text-red-400"
            />

            <div>

              <p className="text-sm font-semibold text-red-300">
                Certificate issuance failed
              </p>

              <p className="mt-1 text-sm text-red-300/80">
                {error}
              </p>

            </div>

          </div>
        )}

        {/* ================================================================
            FORM
        ================================================================= */}

        <form
          onSubmit={handleSubmit}
          className="space-y-7"
        >

          {/* ==============================================================
              STUDENT DETAILS
          ============================================================== */}

          <FormSection
            number="01"
            icon={GraduationCap}
            title="Student Details"
            description="Enter the information of the registered student receiving the certificate."
          >

            <div className="grid gap-5 md:grid-cols-2">

              <Input
                label="Student Name"
                name="studentName"
                value={formData.studentName}
                onChange={handleChange}
                placeholder="Enter student's full name"
                required
              />

              <Input
                label="Student Email"
                name="studentEmail"
                type="email"
                value={formData.studentEmail}
                onChange={handleChange}
                placeholder="student@example.com"
                required
              />

            </div>

          </FormSection>

          {/* ==============================================================
              CERTIFICATE DETAILS
          ============================================================== */}

          <FormSection
            number="02"
            icon={FilePlus2}
            title="Certificate Details"
            description="Provide the academic or professional information that will appear on the certificate."
          >

            <div className="grid gap-5 md:grid-cols-2">

              <Input
                label="Course / Program"
                name="course"
                value={formData.course}
                onChange={handleChange}
                placeholder="e.g. Artificial Intelligence and Machine Learning"
                required
              />

              <Input
                label="Duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g. 4 Years"
              />

              <Select
                label="Certificate Type"
                name="certificateType"
                value={formData.certificateType}
                onChange={handleChange}
                options={certificateTypes}
                required
              />

              <Input
                label="Organization"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                placeholder="e.g. Santhiram Engineering College"
                required
              />

              <Input
                label="Issue Date"
                name="issueDate"
                type="date"
                value={formData.issueDate}
                onChange={handleChange}
                required
              />

              <Input
                label="Expiry Date"
                name="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={handleChange}
              />

              <Input
                label="Grade / Score"
                name="gradeScore"
                value={formData.gradeScore}
                onChange={handleChange}
                placeholder="e.g. A+ or 92%"
              />

            </div>

            <div className="mt-5">

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the course, achievement, event, or purpose of the certificate..."
                className="w-full resize-none rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />

            </div>

            <div className="mt-5">

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Skills / Achievements
              </label>

              <textarea
                name="skillsAchievements"
                value={formData.skillsAchievements}
                onChange={handleChange}
                rows={3}
                placeholder="e.g. Python, Machine Learning, React, PostgreSQL..."
                className="w-full resize-none rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />

            </div>

          </FormSection>

          {/* ==============================================================
              TEMPLATE
          ============================================================== */}

          <FormSection
            number="03"
            icon={Building2}
            title="Certificate Template"
            description="Choose the visual design that will be used for the generated certificate PDF."
          >

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              {templates.map((template) => (

                <label
                  key={template}
                  className={`group cursor-pointer rounded-2xl border p-5 transition duration-200 ${
                    formData.template === template
                      ? "border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-600/10"
                      : "border-white/10 bg-slate-950/60 hover:border-blue-400/20 hover:bg-white/[0.03]"
                  }`}
                >

                  <input
                    type="radio"
                    name="template"
                    value={template}
                    checked={
                      formData.template === template
                    }
                    onChange={handleChange}
                    className="sr-only"
                  />

                  <div className="flex items-center justify-between">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                      <FileTextIcon />
                    </div>

                    {formData.template ===
                      template && (
                      <CheckCircle
                        size={18}
                        className="text-blue-400"
                      />
                    )}

                  </div>

                  <p className="mt-4 font-semibold">
                    {template}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {template} certificate design
                  </p>

                </label>

              ))}

            </div>

          </FormSection>

          {/* ==============================================================
              SECURITY
          ============================================================== */}

          <section className="overflow-hidden rounded-3xl border border-blue-400/15 bg-gradient-to-br from-blue-500/[0.08] via-slate-900/80 to-violet-500/[0.06] p-7">

            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                <LockKeyhole size={23} />
              </div>

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
                  Automatic Security
                </p>

                <h3 className="mt-1 text-xl font-bold">
                  Protected Certificate Generation
                </h3>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Once issued, Certify automatically creates a
                  unique Certificate ID, SHA-256 integrity hash,
                  QR verification code and downloadable PDF.
                </p>

              </div>

            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">

              <SecurityFeature
                icon={ShieldCheck}
                title="Unique ID"
                text="Every certificate gets a unique identifier."
              />

              <SecurityFeature
                icon={Hash}
                title="SHA-256"
                text="Certificate integrity can be verified."
              />

              <SecurityFeature
                icon={QrCode}
                title="QR Verification"
                text="Scan to open public verification."
              />

            </div>

          </section>

          {/* ==============================================================
              ACTIONS
          ============================================================== */}

          <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-7 sm:flex-row sm:justify-end">

            <Link
              to="/issuer/dashboard"
              className="rounded-xl border border-white/10 px-6 py-3 text-center text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-7 py-3 text-sm font-semibold shadow-lg shadow-blue-600/20 transition hover:from-blue-400 hover:to-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Issuing Certificate...
                </>
              ) : (
                <>
                  <FilePlus2 size={17} />
                  Issue Certificate
                </>
              )}

            </button>

          </div>

        </form>

      </main>

      {/* ================================================================
          FOOTER
      ================================================================= */}

      <footer className="relative z-10 border-t border-white/10 px-6 py-8">

        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-3 text-xs text-slate-600 sm:flex-row">

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
| Form Section
|--------------------------------------------------------------------------
*/

function FormSection({
  number,
  icon: Icon,
  title,
  description,
  children,
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-7 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-8">

      <div className="mb-7 flex items-start gap-4">

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">

          <Icon size={22} />

        </div>

        <div className="flex-1">

          <div className="flex items-center gap-3">

            <span className="font-mono text-xs font-bold text-blue-500">
              {number}
            </span>

            <h2 className="text-xl font-bold">
              {title}
            </h2>

          </div>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {description}
          </p>

        </div>

      </div>

      {children}

    </section>
  );
}

/*
|--------------------------------------------------------------------------
| Input
|--------------------------------------------------------------------------
*/

function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium text-slate-300">

        {label}

        {required && (
          <span className="ml-1 text-blue-400">
            *
          </span>
        )}

      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
      />

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Select
|--------------------------------------------------------------------------
*/

function Select({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium text-slate-300">

        {label}

        {required && (
          <span className="ml-1 text-blue-400">
            *
          </span>
        )}

      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
      >

        {options.map((option) => (

          <option
            key={option}
            value={option}
          >
            {option}
          </option>

        ))}

      </select>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Security Feature
|--------------------------------------------------------------------------
*/

function SecurityFeature({
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
| Success Security Card
|--------------------------------------------------------------------------
*/

function SuccessSecurityCard({
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">

      <Icon
        size={18}
        className="text-emerald-400"
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
| Simple File Icon
|--------------------------------------------------------------------------
*/

function FileTextIcon() {
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
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h6" />
    </svg>
  );
}