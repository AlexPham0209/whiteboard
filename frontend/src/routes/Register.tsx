import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Register() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
      
    setLoading(true);
    try {
      await register(username, password);
    } catch (err) {
      console.error("Registration failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="background">
      <div className="w-full max-w-md bg-white rounded-4xl shadow-2xl border border-indigo-50 overflow-hidden">
        {/* Decorative Header */}
        <div className="h-32 bg-purple-400 flex items-center justify-center overflow-hidden">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Create Account
            </h2>
            <p className="text-white text-sm mt-1">Join Whiteboard today</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-8 space-y-5">
          {/* Username Field */}
          <div className="space-y-1.5">
            <label className="input-label">Username</label>
            <input
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="choose_a_unique_name"
              className="input-field"
              type="text"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="input-label">Password</label>
            <input
              name="password"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="input-field"
              type="password"
            />
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">
              Confirm Password
            </label>
            <input
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="input-field"
              type="password"
            />
          </div>

          <button type="submit" disabled={loading} className="button">
            {loading ? "Creating account..." : "Get Started"}
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-purple-600 font-semibold hover:underline"
            >
              Log in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
