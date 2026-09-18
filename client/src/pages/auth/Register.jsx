import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await register(
        form.name,
        form.email,
        form.password
      );

      navigate("/student/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md">

        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white">
            <ShieldCheck />
          </div>

          <h1 className="mt-4 text-3xl font-bold text-slate-950">
            Create your account
          </h1>

          <p className="mt-2 text-slate-600">
            Join Certify as a student
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
        >
          {error && (
            <div className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <label className="block text-sm font-medium text-slate-700">
            Full Name
          </label>

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="mt-2 mb-5 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            placeholder="Your name"
            required
          />

          <label className="block text-sm font-medium text-slate-700">
            Email
          </label>

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="mt-2 mb-5 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            placeholder="you@example.com"
            required
          />

          <label className="block text-sm font-medium text-slate-700">
            Password
          </label>

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            placeholder="Minimum 6 characters"
            minLength={6}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-slate-900"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}