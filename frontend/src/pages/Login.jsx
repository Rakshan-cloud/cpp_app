import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, Sparkles } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const DEMO_EMAILS = ['admin@rakshan.com', 'demo.user@rakshan.com'];

  const useAdminDemo = () => {
    setEmail('admin@rakshan.com');
    setPassword('admin123');
  };

  const useUserDemo = () => {
    setEmail('demo.user@rakshan.com');
    setPassword('demo1234');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { requires_verification } = await login(email, password);
      // Demo accounts bypass Cognito email verification — token is still valid for API calls.
      if (requires_verification && !DEMO_EMAILS.includes(email.trim().toLowerCase())) {
        navigate('/verify-email', { state: { email } });
      } else {
        navigate('/events');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text mb-1">Welcome back</h1>
          <p className="text-text-muted text-sm">Sign in to your account</p>
        </div>

        <div className="mb-5 space-y-2">
          <button
            type="button"
            onClick={useAdminDemo}
            className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-md border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              <div>
                <div className="text-xs font-semibold text-primary leading-tight">Try the Admin Demo</div>
                <div className="text-[11px] text-text-muted leading-tight">admin@rakshan.com &middot; admin123</div>
              </div>
            </div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-primary">Use</span>
          </button>

          <button
            type="button"
            onClick={useUserDemo}
            className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-md border border-dashed border-accent/40 bg-accent/5 hover:bg-accent/10 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent shrink-0" />
              <div>
                <div className="text-xs font-semibold text-accent leading-tight">Try the User Demo</div>
                <div className="text-[11px] text-text-muted leading-tight">demo.user@rakshan.com &middot; demo1234</div>
              </div>
            </div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-accent">Use</span>
          </button>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-border"></div>
          <span className="text-[10px] uppercase tracking-wider text-text-muted font-medium">or sign in</span>
          <div className="flex-1 h-px bg-border"></div>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-danger px-3 py-2.5 rounded-md mb-5 text-sm border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-text mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full bg-white border border-border rounded-md py-2.5 pl-10 pr-3 text-text text-sm placeholder-text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-text mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full bg-white border border-border rounded-md py-2.5 pl-10 pr-3 text-text text-sm placeholder-text-muted/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-medium py-2.5 rounded-md transition-colors cursor-pointer border-none text-sm"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="text-center text-text-muted text-sm mt-5">
            No account?{' '}
            <Link to="/register" className="text-accent hover:text-accent-light no-underline font-medium">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
