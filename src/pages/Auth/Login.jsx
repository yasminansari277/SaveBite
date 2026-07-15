import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IoLeafOutline, IoLogoGoogle, IoMailOutline, IoLockClosedOutline } from 'react-icons/io5';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

const Login = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      if (err.message.includes('user-not-found') || err.message.includes('auth/invalid-credential')) {
        setError('Invalid email or password.');
      } else if (err.message.includes('wrong-password')) {
        setError('Incorrect password.');
      } else {
        setError('Login failed. Please check your network or try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Google Sign In error:', err);
      setError('Google Sign-In failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-background px-4 select-none">
      <Card className="w-full max-w-md border border-border/80 p-8 flex flex-col gap-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 text-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white">
              <IoLeafOutline className="text-xl" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-text-main">
              Save<span className="text-primary">Bite</span>
            </span>
          </Link>
          <span className="text-xs text-text-muted mt-1">Sign in to manage your kitchen sustainability</span>
        </div>

        {/* Error Badge */}
        {error && (
          <div className="bg-danger/10 border border-danger/25 text-danger text-xs font-semibold p-3.5 rounded-custom text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            icon={IoMailOutline}
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={IoLockClosedOutline}
            required
          />

          <div className="flex items-center justify-between text-xs font-medium text-text-muted mb-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-primary border-border focus:ring-primary/20 cursor-pointer"
              />
              <span>Remember Me</span>
            </label>
            <Link to="/forgot-password" className="text-primary hover:underline">
              Forgot Password?
            </Link>
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full h-11">
            Sign In
          </Button>
        </form>

        <div className="relative my-2 flex items-center justify-center">
          <div className="absolute border-t border-border w-full" />
          <span className="relative bg-card px-3 text-[10px] uppercase font-bold text-text-muted select-none">
            Or continue with
          </span>
        </div>

        {/* Google Sign In */}
        <Button
          onClick={handleGoogleLogin}
          variant="outline"
          className="w-full h-11 border-border/80 hover:bg-background select-none flex items-center justify-center gap-2"
          disabled={isLoading}
        >
          <IoLogoGoogle className="text-lg text-red-500" />
          <span>Sign In with Google</span>
        </Button>

        {/* Footer links */}
        <div className="text-center text-xs font-medium text-text-muted">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary hover:underline font-bold">
            Sign Up
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;
