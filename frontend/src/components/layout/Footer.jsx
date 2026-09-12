import React from 'react';
import { Link } from 'react-router-dom';
import { IoLeafOutline, IoLogoTwitter, IoLogoGithub, IoLogoInstagram } from 'react-icons/io5';

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12 px-6 md:px-12 select-none">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand column */}
        <div className="flex flex-col gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
              <IoLeafOutline className="text-lg" />
            </div>
            <span className="font-display font-bold text-xl text-text-main">
              Save<span className="text-primary">Bite</span>
            </span>
          </Link>
          <p className="text-xs text-text-muted leading-relaxed">
            Empowering households to reduce food waste, save money, and cook delicious meals with AI-driven inventory tracking.
          </p>
          <div className="flex items-center gap-3 mt-2">
            <a href="#" className="p-2 rounded-full hover:bg-background text-text-muted hover:text-primary transition-colors">
              <IoLogoTwitter className="text-lg" />
            </a>
            <a href="#" className="p-2 rounded-full hover:bg-background text-text-muted hover:text-primary transition-colors">
              <IoLogoInstagram className="text-lg" />
            </a>
            <a href="#" className="p-2 rounded-full hover:bg-background text-text-muted hover:text-primary transition-colors">
              <IoLogoGithub className="text-lg" />
            </a>
          </div>
        </div>

        {/* Product Column */}
        <div>
          <h4 className="font-display font-semibold text-sm text-text-main mb-4">Product</h4>
          <ul className="flex flex-col gap-2.5 text-xs text-text-muted">
            <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
            <li><a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Recipe Engine</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Expiry Tracker</a></li>
          </ul>
        </div>

        {/* Company Column */}
        <div>
          <h4 className="font-display font-semibold text-sm text-text-main mb-4">Company</h4>
          <ul className="flex flex-col gap-2.5 text-xs text-text-muted">
            <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Sustainability Impact</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Partners</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
          </ul>
        </div>

        {/* Newsletter Column */}
        <div className="flex flex-col gap-4">
          <h4 className="font-display font-semibold text-sm text-text-main">Join the Movement</h4>
          <p className="text-xs text-text-muted leading-relaxed">
            Subscribe to our weekly circular for zero-waste recipes and pantry organization hacks.
          </p>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="w-full h-9 px-3 bg-background border border-border rounded-custom text-xs focus:outline-none focus:border-primary placeholder:text-text-muted/40"
            />
            <button className="bg-primary text-white text-xs font-semibold px-4 rounded-custom hover:bg-primary-hover transition-colors">
              Join
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-border mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-text-muted">
        <span>&copy; {new Date().getFullYear()} SaveBite Inc. All rights reserved.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-primary transition-colors">Cookie Preferences</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
