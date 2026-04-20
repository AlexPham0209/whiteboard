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
    <div className="background">
      <div className="max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-purple-400 p-8 text-white text-center">
          <h2 className="text-3xl font-bold">Welcome Back</h2>
          <p className="text-white mt-2">Please enter your details</p>
        </div>

        {/* Form Section */}
        <form onSubmit={onSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="input-label">Username</label>
            <input
              name="username"
              value={username}
              onChange={(e) => setUsername(e.currentTarget.value)}
              required
              placeholder="e.g. test_user"
              className="input-field"
              type="text"
            />
          </div>

          <div className="space-y-2">
            <label className="input-label">Password</label>
            <input
              name="password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="input-field"
              type="password"
            />
          </div>

          <button type="submit" disabled={loading} className="button">
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Sign In"
            )}
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{" "}
            <a
              href="/register"
              className="text-purple-600 font-semibold hover:underline"
            >
              Register
            </a>
          </p>

          {error && (
            <div className="text-center text-red-500 mt-4">{error}</div>
          )}
        </form>
      </div>
    </div>
  );
}
