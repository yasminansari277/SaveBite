import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IoLeafOutline, IoMailOutline, IoArrowBack } from 'react-icons/io5';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please fill in your email.');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      await resetPassword(email);
      setMessage('Check your inbox (and spam folder) for a link to reset your password.');
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Failed to send password reset email. Please try again.');
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
          <span className="text-xs text-text-muted mt-1">Recover your kitchen password</span>
        </div>

        {/* Error Badge */}
        {error && (
          <div className="bg-danger/10 border border-danger/25 text-danger text-xs font-semibold p-3.5 rounded-custom text-center">
            {error}
          </div>
        )}

        {/* Success Badge */}
        {message && (
          <div className="bg-primary/10 border border-primary/20 text-primary text-xs font-semibold p-3.5 rounded-custom text-center">
            {message}
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
            disabled={isLoading || !!message}
          />

          <Button type="submit" isLoading={isLoading} className="w-full h-11 mt-4" disabled={!!message}>
            Send Reset Instructions
          </Button>
        </form>

        {/* Footer links */}
        <div className="text-center text-xs font-medium text-text-muted mt-2">
          <Link to="/login" className="text-primary hover:underline font-semibold flex items-center justify-center gap-1.5">
            <IoArrowBack /> Back to Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPassword;
