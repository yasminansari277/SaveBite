import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  IoLeafOutline, IoTimeOutline, IoRestaurantOutline, 
  IoListOutline, IoStatsChartOutline, IoShieldCheckmarkOutline,
  IoArrowForward, IoCheckmarkCircle
} from 'react-icons/io5';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Footer from '../../components/layout/Footer';
import heroImg from '../../assets/hero.png';



const Landing = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/signup');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background select-none">
      {/* Navbar Header */}
      <header className="h-20 px-6 md:px-12 flex items-center justify-between border-b border-border/50 bg-card/60 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white">
            <IoLeafOutline className="text-xl" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-text-main">
            Save<span className="text-primary">Bite</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-semibold text-text-muted hover:text-primary transition-colors">
            Sign In
          </Link>
          <Button onClick={handleGetStarted} variant="primary" size="sm">
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-16 md:py-24 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-6"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/15 border border-secondary/35 text-xs font-semibold text-primary w-fit">
            <IoLeafOutline /> Redefining Kitchen Sustainability
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-text-main leading-tight">
            Reduce Food Waste. <br />
            <span className="text-primary">Save Money.</span> <br />
            Eat Smarter.
          </h1>
          <p className="text-sm md:text-base text-text-muted leading-relaxed max-w-lg">
            SaveBite is your intelligent kitchen companion. Track ingredient expiry dates automatically, generate customized AI recipes, organize shopping lists, and optimize your carbon footprint in one elegant dashboard.
          </p>
          <div className="flex items-center gap-4 mt-2">
            <Button onClick={handleGetStarted} variant="primary" size="lg" className="h-12">
              Start Free Today <IoArrowForward className="ml-2" />
            </Button>
            <a href="#features" className="text-sm font-semibold text-text-muted hover:text-text-main transition-colors flex items-center gap-1.5">
              Learn More
            </a>
          </div>
        </motion.div>

        {/* Hero Interactive Illustration */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative flex items-center justify-center"
        >
          <div className="w-80 h-80 md:w-96 md:h-96 rounded-full bg-gradient-to-tr from-accent/20 to-secondary/10 absolute -z-10 blur-3xl" />
          <div className="w-full max-w-lg bg-card/45 backdrop-blur-md border border-border/80 shadow-2xl rounded-custom p-4 relative overflow-hidden animate-float">
            <img 
              src={heroImg} 
              alt="SaveBite Smart Kitchen Visualizer" 
              className="w-full h-auto rounded-[16px] object-cover" 
            />
            <div className="absolute top-8 right-8 bg-[#EF5350]/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 animate-bounce">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              Waste down 30%
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats section */}
      <section className="bg-card border-y border-border py-12 select-none">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="flex flex-col">
            <span className="text-3xl md:text-4xl font-display font-extrabold text-primary">30%</span>
            <span className="text-xs text-text-muted mt-1">Average Waste Reduction</span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl md:text-4xl font-display font-extrabold text-primary">$1,500+</span>
            <span className="text-xs text-text-muted mt-1">Annual Savings Per Family</span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl md:text-4xl font-display font-extrabold text-primary">24k+</span>
            <span className="text-xs text-text-muted mt-1">AI Recipes Suggested</span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl md:text-4xl font-display font-extrabold text-primary">5★</span>
            <span className="text-xs text-text-muted mt-1">Sustainability Rated</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 max-w-7xl mx-auto w-full select-none">
        <div className="text-center flex flex-col items-center gap-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">App Features</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text-main">
            Everything you need to eat greener
          </h2>
          <p className="text-sm text-text-muted max-w-xl leading-relaxed">
            Thoughtfully built to simplify kitchen organization, reduce ecological footprint, and eliminate the constant question of "what should I cook tonight?"
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {/* Feature 1 */}
          <motion.div variants={itemVariants}>
            <Card hoverable className="h-full flex flex-col gap-4">
              <div className="w-12 h-12 rounded-custom bg-danger/10 border border-danger/10 text-danger flex items-center justify-center">
                <IoTimeOutline className="text-2xl" />
              </div>
              <h3 className="font-display font-bold text-lg text-text-main">Automatic Expiry Tracker</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Color-coded warning systems classify stock. Receive automatic reminders before ingredients spoil, enabling zero-waste planning.
              </p>
            </Card>
          </motion.div>

          {/* Feature 2 */}
          <motion.div variants={itemVariants}>
            <Card hoverable className="h-full flex flex-col gap-4">
              <div className="w-12 h-12 rounded-custom bg-primary/10 border border-primary/10 text-primary flex items-center justify-center">
                <IoRestaurantOutline className="text-2xl" />
              </div>
              <h3 className="font-display font-bold text-lg text-text-main">AI-Powered Recipe Matcher</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Browse meal suggestions sorted by ingredients you already have. Get smart food replacement suggestions for missing ingredients.
              </p>
            </Card>
          </motion.div>

          {/* Feature 3 */}
          <motion.div variants={itemVariants}>
            <Card hoverable className="h-full flex flex-col gap-4">
              <div className="w-12 h-12 rounded-custom bg-secondary/15 border border-secondary/25 text-primary flex items-center justify-center">
                <IoListOutline className="text-2xl" />
              </div>
              <h3 className="font-display font-bold text-lg text-text-main">Auto Shopping Lists</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Generate list entries automatically for missing ingredients when browsing recipes. Group items by aisles, print list, or export to CSV.
              </p>
            </Card>
          </motion.div>

          {/* Feature 4 */}
          <motion.div variants={itemVariants}>
            <Card hoverable className="h-full flex flex-col gap-4">
              <div className="w-12 h-12 rounded-custom bg-accent/20 text-primary flex items-center justify-center">
                <IoStatsChartOutline className="text-2xl" />
              </div>
              <h3 className="font-display font-bold text-lg text-text-main">Waste & Savings Analytics</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Monitor money saved, track waste weight logs, and see your top food categories visually via beautiful analytical dashboard charts.
              </p>
            </Card>
          </motion.div>

          {/* Feature 5 */}
          <motion.div variants={itemVariants}>
            <Card hoverable className="h-full flex flex-col gap-4">
              <div className="w-12 h-12 rounded-custom bg-purple-500/10 border border-purple-500/20 text-purple-600 flex items-center justify-center">
                <IoLeafOutline className="text-2xl" />
              </div>
              <h3 className="font-display font-bold text-lg text-text-main">Weekly Meal Planner</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Plan breakfast, lunch, and dinner. Schedule calendar items, drag and drop recipes, and optimize cooking routines based on shelf-lives.
              </p>
            </Card>
          </motion.div>

          {/* Feature 6 */}
          <motion.div variants={itemVariants}>
            <Card hoverable className="h-full flex flex-col gap-4">
              <div className="w-12 h-12 rounded-custom bg-[#E3F2FD] border border-[#BBDEFB] text-[#1565C0] flex items-center justify-center">
                <IoShieldCheckmarkOutline className="text-2xl" />
              </div>
              <h3 className="font-display font-bold text-lg text-text-main">PWA & Offline Support</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Add SaveBite to your phone's home screen. Log items offline, scan barcodes in-store, and access shopping lists without internet.
              </p>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="bg-card border-y border-border py-20 px-6 select-none">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center flex flex-col items-center gap-3 mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Easy Process</span>
            <h2 className="font-display text-3xl font-bold text-text-main">How SaveBite Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-display font-bold text-lg">
                1
              </div>
              <h4 className="font-semibold text-base text-text-main">Log Inventory</h4>
              <p className="text-xs text-text-muted leading-relaxed max-w-xs">
                Scan barcode, take photo, or type in your fresh ingredients. Fill in purchase and expiry dates.
              </p>
            </div>

            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-display font-bold text-lg">
                2
              </div>
              <h4 className="font-semibold text-base text-text-main">Get Expiry Alerts</h4>
              <p className="text-xs text-text-muted leading-relaxed max-w-xs">
                Receive color-coded visual indicator updates. Receive phone notification pings before vegetables spoil.
              </p>
            </div>

            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-display font-bold text-lg">
                3
              </div>
              <h4 className="font-semibold text-base text-text-main">Cook Smarter Recipes</h4>
              <p className="text-xs text-text-muted leading-relaxed max-w-xs">
                Select matching recipes, follow cooking progress steps, and automatically add missing items to your shopping list.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-20 max-w-7xl mx-auto w-full select-none">
        <div className="text-center flex flex-col items-center gap-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">User Reviews</span>
          <h2 className="font-display text-3xl font-bold text-text-main">Loved by eco-conscious cooks</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="flex flex-col gap-4 border border-border/80">
            <p className="text-xs text-text-muted italic leading-relaxed">
              "SaveBite totally changed how we grocery shop. I used to throw out half my greens. Now, the expiry alerts help me build meals, and we've saved almost $150 a month!"
            </p>
            <div className="flex items-center gap-3 mt-2 border-t border-border pt-4">
              <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=sarah" alt="User Sarah" className="w-10 h-10 rounded-full border" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-text-main">Sarah K.</span>
                <span className="text-[10px] text-text-muted">Home Chef</span>
              </div>
            </div>
          </Card>

          <Card className="flex flex-col gap-4 border border-border/80">
            <p className="text-xs text-text-muted italic leading-relaxed">
              "The AI recipe match is pure magic. It suggests dishes based on things I actually have, especially vegetables nearing their end date. Highly recommended!"
            </p>
            <div className="flex items-center gap-3 mt-2 border-t border-border pt-4">
              <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=mark" alt="User Mark" className="w-10 h-10 rounded-full border" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-text-main">Mark L.</span>
                <span className="text-[10px] text-text-muted">Zero-Waste Advocate</span>
              </div>
            </div>
          </Card>

          <Card className="flex flex-col gap-4 border border-border/80">
            <p className="text-xs text-text-muted italic leading-relaxed">
              "I love the calendar meal planner and shopping list link. Checking purchased items automatically moves them to my pantry stock. Perfect workflow!"
            </p>
            <div className="flex items-center gap-3 mt-2 border-t border-border pt-4">
              <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=jessica" alt="User Jessica" className="w-10 h-10 rounded-full border" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-text-main">Jessica T.</span>
                <span className="text-[10px] text-text-muted">Busy Parent</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Call to action */}
      <section className="bg-primary text-white py-16 px-6 text-center flex flex-col items-center gap-6 select-none relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-secondary/35 via-primary to-primary-hover -z-10" />
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Ready to stop wasting food?</h2>
        <p className="text-sm opacity-90 max-w-md leading-relaxed">
          Join thousands of households cooking smarter, saving dollars, and conserving our planet. Sign up takes less than 2 minutes.
        </p>
        <Button onClick={handleGetStarted} variant="outline" className="bg-white text-primary border-none hover:bg-white/90 shadow-2xl shadow-black/20 font-bold px-8 h-12 text-sm">
          Get Started For Free
        </Button>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};




export default Landing;
