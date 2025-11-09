import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#0a0a1a] via-[#0a0a2a] to-black text-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-10 py-6">
        <div className="flex items-center space-x-3">
          <img src="/logo.svg" alt="Logo" className="w-8 h-8" />
          <h1 className="text-xl font-semibold tracking-tight">CareerSync</h1>
        </div>
        <div className="space-x-6 text-sm hidden md:flex">
          <a href="#features" className="hover:text-blue-400">Features</a>
          <a href="#tutorials" className="hover:text-blue-400">Tutorials</a>
          <a href="#help" className="hover:text-blue-400">Help Center</a>
        </div>
        <div className="flex items-center space-x-3">
          <Link to="/login"><Button variant="ghost" className="text-blue-400 hover:text-white">Sign In</Button></Link>
          <Link to="/signup"><Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button></Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center flex-1 text-center px-6">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
          className="text-sm uppercase tracking-widest text-blue-400 mb-4"
        >
          Empower Your Career Journey
        </motion.h2>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3, duration: 1 }}
          className="text-5xl md:text-6xl font-bold mb-6"
        >
          Discover <span className="text-blue-500">CareerSync</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.6, duration: 1 }}
          className="max-w-2xl text-gray-300 mb-8"
        >
          A modern platform connecting <strong>students</strong>, <strong>institutions</strong>, and <strong>companies</strong> — guiding every step of your career.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 1, duration: 1 }}
          className="flex w-full max-w-md bg-[#141426] rounded-full overflow-hidden shadow-md"
        >
          <Input type="text" placeholder="Search for opportunities..." className="flex-1 bg-transparent border-none text-white px-5" />
          <Button className="bg-blue-600 hover:bg-blue-700 rounded-none">Search</Button>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 text-sm border-t border-gray-800">
        © {new Date().getFullYear()} CareerSync. All rights reserved.
      </footer>
    </div>
  );
}
