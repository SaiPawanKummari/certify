import { Link } from "react-router-dom";
import {
  ShieldCheck,
  QrCode,
  FileCheck2,
  BrainCircuit,
  LockKeyhole,
  Zap,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: QrCode,
    title: "QR Verification",
    description: "Verify certificates instantly by scanning a QR code.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Verification",
    description: "SHA-256 hashing helps protect certificate integrity.",
  },
  {
    icon: FileCheck2,
    title: "Digital Certificates",
    description: "Create professional certificates and downloadable PDFs.",
  },
  {
    icon: BrainCircuit,
    title: "Fraud Prevention",
    description: "AI-based anomaly detection helps identify suspicious certificates.",
  },
  {
    icon: LockKeyhole,
    title: "Certificate Management",
    description: "Manage certificates securely using role-based access.",
  },
  {
    icon: Zap,
    title: "Instant Verification",
    description: "Verify certificate status quickly using an ID or QR code.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <ShieldCheck size={22} />
            </div>

            <span className="text-xl font-bold tracking-tight">
              Certify
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/verify"
              className="hidden rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 sm:block"
            >
              Verify
            </Link>

            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main>
        <section className="mx-auto max-w-7xl px-6 pb-20 pt-24">
          <div className="mx-auto max-w-4xl text-center">

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
              <ShieldCheck size={16} />
              Secure Digital Certificate Authentication
            </div>

            <h1 className="text-5xl font-bold tracking-tight text-slate-950 sm:text-6xl">
              Verify Certificates.
              <span className="block text-slate-500">
                Build Trust.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Create, issue, manage, and verify trusted digital certificates
              with secure IDs, QR codes, cryptographic hashing, and
              intelligent fraud detection.
            </p>

            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/verify"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 font-semibold text-white shadow-lg hover:bg-slate-800"
              >
                Verify Certificate
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/register"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-800 hover:bg-slate-50"
              >
                Get Started
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-20">

            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Everything you need
              </p>

              <h2 className="mt-3 text-3xl font-bold text-slate-950">
                A complete certificate verification platform
              </h2>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                      <Icon size={21} />
                    </div>

                    <h3 className="text-lg font-semibold text-slate-950">
                      {feature.title}
                    </h3>

                    <p className="mt-2 leading-6 text-slate-600">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              How it works
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-950">
              Verify in seconds
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              ["01", "Enter Certificate ID", "Enter the certificate ID or scan its QR code."],
              ["02", "Check Authenticity", "Certify checks the certificate status and SHA-256 integrity."],
              ["03", "View Result", "See whether the certificate is valid, revoked, expired, or invalid."],
            ].map(([number, title, description]) => (
              <div
                key={number}
                className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
              >
                <span className="text-sm font-bold text-slate-400">
                  {number}
                </span>

                <h3 className="mt-4 text-xl font-semibold">
                  {title}
                </h3>

                <p className="mt-2 leading-6 text-slate-600">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-slate-900 px-6 py-20 text-center text-white">
          <h2 className="text-3xl font-bold">
            Ready to build trust with digital certificates?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            Issue secure certificates and allow anyone to verify their
            authenticity instantly.
          </p>

          <Link
            to="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-slate-900 hover:bg-slate-100"
          >
            Create your account
            <ArrowRight size={18} />
          </Link>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-6 py-8 text-center text-sm text-slate-500">
        © 2026 Certify. Digital Certificate Authentication & Verification.
      </footer>
    </div>
  );
}