import { Link } from "react-router-dom";
import {
  ShieldCheck,
  QrCode,
  FileCheck2,
  LockKeyhole,
  SearchCheck,
  ArrowRight,
  Zap,
  Database,
  Users,
  Sparkles,
  CheckCircle2,
  ScanLine,
} from "lucide-react";

const features = [
  {
    icon: QrCode,
    title: "QR Verification",
    description:
      "Scan a certificate QR code and instantly verify its authenticity.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Verification",
    description:
      "Verify certificate status and integrity using secure authentication.",
  },
  {
    icon: FileCheck2,
    title: "Digital Certificates",
    description:
      "Create and manage professional digital certificates with unique IDs.",
  },
  {
    icon: SearchCheck,
    title: "Fraud Prevention",
    description:
      "Detect revoked, expired, invalid, or tampered certificates.",
  },
  {
    icon: LockKeyhole,
    title: "Secure Records",
    description:
      "Protect certificate information with role-based access control.",
  },
];

const trustFeatures = [
  {
    icon: ShieldCheck,
    title: "Secure Issuance",
    description: "Create and issue tamper-resistant digital certificates.",
  },
  {
    icon: Zap,
    title: "Instant Verification",
    description: "Validate certificates in seconds with trusted authenticity.",
  },
  {
    icon: Database,
    title: "Easy Management",
    description: "Organize, track and manage certificates in one place.",
  },
  {
    icon: Users,
    title: "Built for Everyone",
    description: "For students, professionals, institutions and organizations.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#020617] text-white">

      {/* ================================================================
          BACKGROUND GLOW
      ================================================================= */}

      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-blue-600/15 blur-3xl" />
        <div className="absolute right-[-120px] top-10 h-[500px] w-[500px] rounded-full bg-violet-600/15 blur-3xl" />
        <div className="absolute bottom-[-150px] left-1/3 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      {/* ================================================================
          NAVBAR
      ================================================================= */}

      <header className="relative z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-6">

          {/* Logo */}

          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-600/30">
              <ShieldCheck size={25} strokeWidth={2.2} />

              <div className="absolute inset-0 rounded-xl bg-blue-400/20 blur-md" />
            </div>

            <span className="text-2xl font-bold tracking-tight">
              Certify
            </span>
          </Link>

          {/* Navigation */}

          <nav className="hidden items-center gap-8 md:flex">

            <a
              href="#home"
              className="relative text-sm font-medium text-white transition"
            >
              Home
              <span className="absolute -bottom-7 left-0 h-0.5 w-full bg-blue-500" />
            </a>

            <a
              href="#features"
              className="text-sm font-medium text-slate-400 transition hover:text-white"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-400 transition hover:text-white"
            >
              How It Works
            </a>

            <a
              href="#about"
              className="text-sm font-medium text-slate-400 transition hover:text-white"
            >
              About
            </a>
          </nav>

          {/* Right actions */}

          <div className="flex items-center gap-3">

            <Link
              to="/verify"
              className="hidden rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-white sm:block"
            >
              Verify
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 hover:shadow-blue-500/30"
            >
              Login
            </Link>

          </div>
        </div>
      </header>

      {/* ================================================================
          HERO
      ================================================================= */}

      <main>

        <section
          id="home"
          className="relative"
        >
          <div className="mx-auto max-w-7xl px-6">

            <div className="grid min-h-[570px] items-center gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">

              {/* LEFT */}

              <div className="relative z-10">

                {/* Badge */}

                <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-300 shadow-lg shadow-blue-900/10 backdrop-blur-sm">

                  <ShieldCheck size={16} />

                  <span>
                    AI-Powered Certificate Authentication
                  </span>

                  <Sparkles
                    size={15}
                    className="text-violet-300"
                  />

                </div>

                {/* Heading */}

                <h1 className="max-w-3xl text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">

                  Verify Certificates.

                  <span className="block bg-gradient-to-r from-blue-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
                    Build Trust.
                  </span>

                </h1>

                {/* Description */}

                <p className="mt-7 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
                  Certify is a secure digital certificate authentication
                  platform that makes issuing, managing, and verifying
                  certificates fast, reliable, and fraud-resistant.
                </p>

                {/* Buttons */}

                <div className="mt-9 flex flex-col gap-4 sm:flex-row">

                  <Link
                    to="/verify"
                    className="group inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-7 py-3.5 font-semibold shadow-xl shadow-blue-600/20 transition duration-300 hover:-translate-y-0.5 hover:from-blue-400 hover:to-violet-400 hover:shadow-blue-500/30"
                  >
                    Verify Certificate

                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </Link>

                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.03] px-7 py-3.5 font-semibold text-slate-200 backdrop-blur-sm transition hover:border-blue-400/30 hover:bg-white/[0.06]"
                  >
                    Get Started
                  </Link>

                </div>

                {/* Security indicators */}

                <div className="mt-8 flex flex-wrap gap-5 text-sm text-slate-400">

                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      size={16}
                      className="text-blue-400"
                    />
                    SHA-256 Integrity
                  </div>

                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      size={16}
                      className="text-blue-400"
                    />
                    QR Verification
                  </div>

                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      size={16}
                      className="text-violet-400"
                    />
                    AI Anomaly Detection
                  </div>

                </div>

              </div>

              {/* RIGHT VISUAL */}

              <div className="relative flex min-h-[430px] items-center justify-center">

                {/* Glow */}

                <div className="absolute h-[330px] w-[330px] rounded-full bg-blue-600/20 blur-3xl" />

                <div className="absolute h-[250px] w-[250px] rounded-full bg-violet-600/20 blur-3xl" />

                {/* Orbit */}

                <div className="absolute h-[350px] w-[350px] rounded-full border border-blue-400/20" />

                <div className="absolute h-[430px] w-[430px] rounded-full border border-violet-500/10" />

                {/* Orbit dots */}

                <div className="absolute right-[12%] top-[16%] h-2 w-2 rounded-full bg-blue-400 shadow-lg shadow-blue-400" />

                <div className="absolute left-[12%] bottom-[23%] h-2 w-2 rounded-full bg-violet-400 shadow-lg shadow-violet-400" />

                <div className="absolute right-[23%] bottom-[12%] h-1.5 w-1.5 rounded-full bg-cyan-300" />

                {/* Certificate */}

                <div className="relative z-10 w-[280px] rotate-[-4deg] rounded-2xl border border-blue-300/30 bg-gradient-to-br from-slate-800 via-slate-900 to-blue-950 p-3 shadow-2xl shadow-blue-900/50">

                  <div className="rounded-xl border border-white/10 bg-slate-950/90 p-7">

                    {/* Certificate icon */}

                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 shadow-xl shadow-blue-500/30">

                      <ShieldCheck
                        size={43}
                        strokeWidth={1.7}
                      />

                    </div>

                    <p className="mt-5 text-center text-xs uppercase tracking-[0.25em] text-blue-300">
                      Certificate
                    </p>

                    <div className="mt-5 space-y-3">

                      <div className="h-2 rounded-full bg-blue-400/50" />

                      <div className="mx-auto h-2 w-4/5 rounded-full bg-blue-400/30" />

                      <div className="mx-auto h-2 w-3/5 rounded-full bg-violet-400/30" />

                    </div>

                    <div className="mt-7 flex items-center justify-between">

                      <div>
                        <div className="h-2 w-20 rounded-full bg-white/20" />
                        <div className="mt-2 h-1.5 w-14 rounded-full bg-white/10" />
                      </div>

                      <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-blue-400/20 bg-blue-500/10">
                        <QrCode
                          size={25}
                          className="text-blue-300"
                        />
                      </div>

                    </div>

                  </div>

                </div>

                {/* Shield floating element */}

                <div className="absolute bottom-[11%] left-[13%] z-20 flex h-20 w-20 items-center justify-center rounded-2xl border border-blue-400/30 bg-slate-900/90 shadow-2xl shadow-blue-900/40 backdrop-blur-xl">

                  <ShieldCheck
                    size={40}
                    className="text-blue-400"
                  />

                </div>

                {/* Fast Verification */}

                <div className="absolute right-[1%] top-[13%] z-20 flex items-center gap-3 rounded-2xl border border-blue-400/20 bg-slate-900/85 px-4 py-3 shadow-xl shadow-blue-950/30 backdrop-blur-xl">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                    <Zap size={20} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-white">
                      Fast
                    </p>
                    <p className="text-xs text-slate-400">
                      Verification
                    </p>
                  </div>

                </div>

                {/* Fraud Resistant */}

                <div className="absolute bottom-[24%] right-[0%] z-20 flex items-center gap-3 rounded-2xl border border-violet-400/20 bg-slate-900/85 px-4 py-3 shadow-xl shadow-violet-950/30 backdrop-blur-xl">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400">
                    <ShieldCheck size={20} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-white">
                      Fraud
                    </p>
                    <p className="text-xs text-slate-400">
                      Resistant
                    </p>
                  </div>

                </div>

                {/* Secure */}

                <div className="absolute bottom-[5%] right-[22%] z-20 hidden items-center gap-3 rounded-2xl border border-cyan-400/20 bg-slate-900/85 px-4 py-3 shadow-xl backdrop-blur-xl sm:flex">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400">
                    <LockKeyhole size={19} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-white">
                      Secure
                    </p>
                    <p className="text-xs text-slate-400">
                      & Reliable
                    </p>
                  </div>

                </div>

              </div>
            </div>

          </div>

          {/* ============================================================
              TRUST STRIP
          ============================================================= */}

          <div className="relative z-10 -mb-1 rounded-2xl border border-blue-400/10 bg-gradient-to-r from-blue-950/50 via-slate-900/80 to-violet-950/40 shadow-2xl shadow-black/20 backdrop-blur-xl">

            <div className="grid divide-y divide-white/10 md:grid-cols-2 md:divide-x md:divide-y-0 lg:grid-cols-4">

              {trustFeatures.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="flex items-center gap-4 px-6 py-6"
                  >

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-blue-400/20 bg-blue-500/10 text-blue-400">
                      <Icon size={22} />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        {feature.title}
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        {feature.description}
                      </p>
                    </div>

                  </div>
                );
              })}

            </div>

          </div>
        </section>

        {/* ================================================================
            FEATURES
        ================================================================= */}

        <section
          id="features"
          className="relative border-t border-white/10 py-24"
        >

          <div className="mx-auto max-w-7xl px-6">

            <div className="mx-auto max-w-2xl text-center">

              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
                Platform Features
              </p>

              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Everything needed for trusted certificates
              </h2>

              <p className="mt-4 text-slate-400">
                A secure platform combining authentication,
                cryptographic integrity, QR verification and
                AI-powered anomaly detection.
              </p>

            </div>

            <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-5">

              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-400/30 hover:bg-blue-500/[0.04] hover:shadow-xl hover:shadow-blue-950/20"
                  >

                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-blue-400/15 bg-gradient-to-br from-blue-500/15 to-violet-500/10 text-blue-400 transition group-hover:from-blue-500/25 group-hover:to-violet-500/20">

                      <Icon size={22} />

                    </div>

                    <h3 className="font-semibold">
                      {feature.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      {feature.description}
                    </p>

                  </div>
                );
              })}

            </div>

          </div>

        </section>

        {/* ================================================================
            HOW IT WORKS
        ================================================================= */}

        <section
          id="how-it-works"
          className="border-y border-white/10 bg-gradient-to-b from-slate-900/40 to-blue-950/10 py-24"
        >

          <div className="mx-auto max-w-7xl px-6">

            <div className="text-center">

              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
                How It Works
              </p>

              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                Verify a certificate in seconds
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-slate-400">
                Certify combines certificate lookup, integrity
                verification and AI analysis into one simple process.
              </p>

            </div>

            <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">

              {[
                [
                  "01",
                  "Enter Certificate ID",
                  "Enter the unique certificate ID or scan its QR code.",
                  ScanLine,
                ],
                [
                  "02",
                  "Verify Authenticity",
                  "Certify checks certificate status and SHA-256 integrity.",
                  ShieldCheck,
                ],
                [
                  "03",
                  "View Result",
                  "Instantly see the certificate result and AI security analysis.",
                  SearchCheck,
                ],
              ].map(([number, title, description, Icon]) => (

                <div
                  key={number}
                  className="relative rounded-2xl border border-white/10 bg-slate-900/70 p-7 backdrop-blur-sm"
                >

                  <div className="flex items-center justify-between">

                    <span className="text-5xl font-black text-blue-500/40">
                      {number}
                    </span>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                      <Icon size={21} />
                    </div>

                  </div>

                  <h3 className="mt-7 text-xl font-semibold">
                    {title}
                  </h3>

                  <p className="mt-3 leading-6 text-slate-400">
                    {description}
                  </p>

                </div>

              ))}

            </div>

          </div>

        </section>

        {/* ================================================================
            ABOUT
        ================================================================= */}

        <section
          id="about"
          className="mx-auto max-w-7xl px-6 py-24"
        >

          <div className="grid items-center gap-12 lg:grid-cols-2">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
                About Certify
              </p>

              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                Digital certificates built for trust and security.
              </h2>

              <p className="mt-6 leading-7 text-slate-400">
                Certify provides a centralized platform for issuing,
                managing and verifying digital certificates. Every
                certificate is protected using a unique identifier,
                QR code and SHA-256 integrity verification.
              </p>

              <p className="mt-4 leading-7 text-slate-400">
                The platform also analyzes verification behavior using
                machine-learning based anomaly detection to identify
                unusual verification patterns.
              </p>

              <Link
                to="/verify"
                className="group mt-8 inline-flex items-center gap-2 font-semibold text-blue-400 transition hover:text-blue-300"
              >
                Verify a certificate

                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

            </div>

            {/* Security panel */}

            <div className="relative">

              <div className="absolute -inset-5 rounded-3xl bg-blue-600/10 blur-3xl" />

              <div className="relative rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">

                <div className="flex items-center gap-4">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-600/20">
                    <ShieldCheck size={29} />
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      Multi-Layer Security
                    </h3>

                    <p className="text-sm text-slate-400">
                      Protection at every verification stage
                    </p>
                  </div>

                </div>

                <div className="mt-8 space-y-4">

                  {[
                    "Unique certificate identification",
                    "SHA-256 cryptographic integrity",
                    "QR-based public verification",
                    "Verification history tracking",
                    "AI behavioral anomaly detection",
                  ].map((item) => (

                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.025] px-4 py-3"
                    >

                      <CheckCircle2
                        size={18}
                        className="shrink-0 text-blue-400"
                      />

                      <span className="text-sm text-slate-300">
                        {item}
                      </span>

                    </div>

                  ))}

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ================================================================
            CTA
        ================================================================= */}

        <section className="mx-auto max-w-6xl px-6 pb-24">

          <div className="relative overflow-hidden rounded-3xl border border-blue-400/20 bg-gradient-to-br from-blue-600/15 via-violet-600/10 to-slate-900 p-10 text-center shadow-2xl shadow-blue-950/20 sm:p-14">

            <div className="absolute left-1/2 top-0 h-40 w-96 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400">
                <ShieldCheck size={28} />
              </div>

              <h2 className="mt-6 text-3xl font-bold sm:text-4xl">
                Ready to verify a certificate?
              </h2>

              <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-400">
                Quickly check whether a digital certificate is
                authentic, valid, revoked, expired, or invalid.
              </p>

              <Link
                to="/verify"
                className="group mt-8 inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-7 py-3.5 font-semibold shadow-xl shadow-blue-600/20 transition hover:from-blue-400 hover:to-violet-400"
              >
                Verify Now

                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

            </div>

          </div>

        </section>

      </main>

      {/* ================================================================
          FOOTER
      ================================================================= */}

      <footer className="border-t border-white/10 bg-slate-950/80">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-center sm:flex-row sm:text-left">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600">
              <ShieldCheck size={19} />
            </div>

            <div>
              <p className="font-semibold">
                Certify
              </p>

              <p className="text-xs text-slate-500">
                AI-Enhanced Certificate Authentication
              </p>
            </div>

          </div>

          <p className="text-sm text-slate-500">
            © 2026 Certify — AI-Enhanced Digital Certificate Authentication System
          </p>

        </div>

      </footer>

    </div>
  );
}