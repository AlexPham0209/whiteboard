import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { login, error } = useAuth();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-purple-400 p-8 text-white text-center">
          <h2 className="text-3xl font-bold">Welcome Back</h2>
          <p className="text-white mt-2">Please enter your details</p>
        </div>

        {/* Form Section */}
        <form onSubmit={onSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600 ml-1">
              Username
            </label>
            <input
              name="username"
              value={username}
              onChange={(e) => setUsername(e.currentTarget.value)}
              required
              placeholder="e.g. alex_dev"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-purple-500 transition-all bg-gray-50 focus:bg-white"
              type="text"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600 ml-1">
              Password
            </label>
            <input
              name="password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-purple-500 transition-all bg-gray-50 focus:bg-white"
              type="password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-400 hover:bg-purple-500 active:scale-[0.98] text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-200 transition-all flex justify-center items-center"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Sign In"
            )}
          </button>

          {error && (
            <div className="text-center text-red-500 mt-4">{error}</div>
          )}

          {/* <div className="text-center mt-4">
            <a href="#" className="text-sm text-purple-400 hover:underline">
              Forgot password?
            </a>
          </div> */}
        </form>
      </div>
    </div>
  );
}
