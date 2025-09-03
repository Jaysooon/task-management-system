import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { FaArrowLeft } from "react-icons/fa6";
import "../../assets/animation.css";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    const res = await login(email, password);
    if (res.ok) nav("/dashboard");
    else setErr(res.error || "Login failed");
  }

  return (
    <>
      <Navbar isHidden={true}></Navbar>
      <div className="flex justify-center">
        <div className="relative max-w-xl rounded-3xl mt-20 border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-800">
          <div className="absolute inset-0 z-0 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-zinc-700 dark:to-zinc-600" />
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-black/5 dark:ring-white/5 z-10" />
          <main className="relative z-20 mx-auto w-full overflow-x-auto max-w-md rounded-xl bg-white/95 p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900" style={{animation: "fadeIn 1s"}}>
            <div className="mb-6 flex items-center justify-between">
              <Link
                to="/"
                className="text-sm font-semibold text-black dark:text-zinc-100 inline-flex items-center hover:text-zinc-500"
              >
                <FaArrowLeft className="mr-1" /> Back
              </Link>
            </div>
            <div className="rounded-3xl border p-6 border-zinc-200 dark:border-zinc-700">
              <h2 className="text-2xl font-bold text-amber-600">
                Welcome back
              </h2>
              <p className="text-sm mb-4 text-semi-bold text-zinc-600 dark:text-zinc-100">
                Please Enter your Account Details
              </p>
              <form onSubmit={submit} className="space-y-4">
                <label className="block">
                  <span className="text-sm text-zinc-600 dark:text-zinc-100">
                    Email
                  </span>
                  <input
                    className="mt-1 w-full rounded-xl border px-3 py-2 border-zinc-300 bg-zinc-50 outline-none transition focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 hover:border-zinc-400"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-zinc-600 dark:text-zinc-100">
                    Password
                  </span>
                  <input
                    className="mt-1 w-full rounded-xl border px-3 py-2 border-zinc-300 bg-zinc-50 outline-none transition focus:border-amber-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 hover:border-zinc-400"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </label>
                {err && <div className="text-sm text-red-600">{err}</div>}
                <div className="flex justify-between items-center">
                  <p className="text-sm text-zinc-600 dark:text-zinc-100">
                    Don't have an account yet?
                    <Link
                      to="/register"
                      className="ml-1 underline text-blue-500 hover:text-blue-900"
                    >
                      Sign up
                    </Link>
                  </p>
                </div>
                <div className="block">
                  <button className="w-full rounded-2xl bg-green-700 text-white px-5 py-2 hover:bg-green-950">
                    Log in
                  </button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
      <Footer></Footer>
    </>
  );
}
