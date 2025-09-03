import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaArrowLeft } from "react-icons/fa6";
import Navbar from "../Navbar";
import Footer from "../Footer";
import "../../assets/animation.css";

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e) {
    e.preventDefault();
    // Validate form
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setErr("All fields are required");
      return;
    }

    if (form.password.length < 6) {
      setErr("Password must be at least 6 characters long");
      return;
    }

    if (!form.email.includes('@')) {
      setErr("Please enter a valid email address");
      return;
    }

    setSubmitting(true);
    setErr("");

    try {
      const response = await register(form);
      if (response && response.ok) {
        setSent(true);
      } else {
        setErr(response?.error || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration submit error:", error);
      setErr("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <>
        <Navbar isHidden={true}></Navbar>
        <div className="flex justify-center">
          <div className="relative max-w-xl rounded-3xl mt-20 border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-800">
            <div className="absolute inset-0 z-0 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-zinc-700 dark:to-zinc-600" />
            <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-black/5 dark:ring-white/5 z-10" />
            <main
              className="relative z-20 mx-auto w-full overflow-x-auto max-w-md rounded-xl bg-white/95 p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
              style={{ animation: "fadeIn 1s" }}
            >
              <div className="mb-6 flex items-center justify-between">
                <Link
                  to="/"
                  className="text-sm inline-flex items-center text-black font-semibold dark:text-zinc-100 hover:text-zinc-500"
                >
                  <FaArrowLeft className="mr-1" /> Back
                </Link>
              </div>
              <div className="rounded-3xl border p-6 border-zinc-200 dark:border-zinc-700">
                <h2 className="text-2xl font-bold mb-2 text-amber-600">
                  Registration submitted
                </h2>
                <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-100">
                  An admin must approve your account before you can log in.
                </p>
                <Link
                  className="mt-4 inline-block rounded-xl border px-3 py-2 text-sm bg-blue-600 border-zinc-200 dark:border-zinc-700"
                  to="/"
                >
                  Go Home
                </Link>
              </div>
            </main>
          </div>
        </div>
        <Footer></Footer>
      </>
    );
  }

  return (
    <>
      <Navbar isHidden={true} />
      <div className="flex justify-center">
        <div className="relative max-w-xl rounded-3xl mt-20 border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-800">
          <div className="absolute inset-0 z-0 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-zinc-700 dark:to-zinc-600" />
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-black/5 dark:ring-white/5 z-10" />
          <main
            className="relative z-20 mx-auto w-full overflow-x-auto max-w-md rounded-xl bg-white/95 p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
            style={{ animation: "fadeIn 1s" }}
          >
            <div className="mb-6 flex items-center justify-between">
              <Link
                to="/"
                className="text-sm font-semibold text-black dark:text-zinc-100 inline-flex items-center hover:text-zinc-500"
              >
                <FaArrowLeft className="mr-1" /> Back
              </Link>
            </div>
            <div className="rounded-3xl border p-6 border-zinc-200 dark:border-zinc-700">
              <h2 className="text-2xl font-bold mb-4 text-amber-600">
                Create an Account
              </h2>
              <form onSubmit={submit} className="space-y-4">
                <label className="block">
                  <span className="text-sm text-zinc-600 dark:text-zinc-100">Name</span>
                  <input
                    className="mt-1 w-full rounded-xl border px-3 py-2 border-zinc-300 bg-zinc-50 outline-none transition focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 hover:border-zinc-400"
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    disabled={submitting}
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm text-zinc-600 dark:text-zinc-100">Email</span>
                  <input
                    className="mt-1 w-full rounded-xl border px-3 py-2 border-zinc-300 bg-zinc-50 outline-none transition focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 hover:border-zinc-400"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    disabled={submitting}
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm text-zinc-600 dark:text-zinc-100">Password</span>
                  <input
                    className="mt-1 w-full rounded-xl border px-3 py-2 border-zinc-300 bg-zinc-50 outline-none transition focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 hover:border-zinc-400"
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    disabled={submitting}
                    required
                    minLength={6}
                  />
                  <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Minimum 6 characters
                  </div>
                </label>

                {err && (
                  <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
                    {err}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <p className="text-sm text-zinc-600 dark:text-zinc-100">
                    Already have an account?
                    <Link
                      to="/login"
                      className="ml-1 underline text-blue-500 hover:text-blue-900"
                    >
                      Log in
                    </Link>
                  </p>
                </div>

                <div className="block">
                  <button 
                    type="submit" 
                    className="w-full rounded-2xl bg-blue-700 text-white px-5 py-2 hover:bg-blue-950 disabled:opacity-50 disabled:cursor-not-allowed" 
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Register"}
                  </button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
}
