import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IoLeafOutline, IoLogoGoogle, IoMailOutline, IoLockClosedOutline, IoPersonOutline } from 'react-icons/io5';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

const Signup = () => {
  const { signUp, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await signUp(email, password, name);
      navigate('/dashboard');
    } catch (err) {
      console.error('Signup error:', err);
      if (err.message.includes('email-already-in-use')) {
        setError('An account with this email already exists.');
      } else if (err.message.includes('invalid-email')) {
        setError('Invalid email address.');
      } else {
        setError('Registration failed. Please try again.');
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
      navigate('/dashboard');
    } catch (err) {
      console.error('Google Sign In error:', err);
      setError('Google Sign-In failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-background px-4 select-none">
      <Card className="w-full max-w-md border border-border/80 p-8 flex flex-col gap-5">
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
          <span className="text-xs text-text-muted mt-1">Create an account to start saving food</span>
        </div>

        {/* Error Badge */}
        {error && (
          <div className="bg-danger/10 border border-danger/25 text-danger text-xs font-semibold p-3.5 rounded-custom text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col">
          <Input
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            icon={IoPersonOutline}
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            icon={IoMailOutline}
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            icon={IoLockClosedOutline}
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            icon={IoLockClosedOutline}
            required
          />

          <Button type="submit" isLoading={isLoading} className="w-full h-11 mt-4">
            Sign Up
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
          <span>Sign Up with Google</span>
        </Button>

        {/* Footer links */}
        <div className="text-center text-xs font-medium text-text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-bold">
            Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Signup;
