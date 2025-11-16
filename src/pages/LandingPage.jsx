import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
<<<<<<< HEAD

export default function LandingPage() {
=======
import { useState, useEffect } from "react";
import { db } from "../services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const jobsQuery = query(collection(db, "jobs"), where("status", "==", "approved"));
      const institutionsQuery = query(collection(db, "institutions"), where("status", "==", "approved"));
      const [jobsSnap, instSnap] = await Promise.all([getDocs(jobsQuery), getDocs(institutionsQuery)]);

      const jobs = jobsSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: "job" }));
      const institutions = instSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: "institution" }));

      const allResults = [...jobs, ...institutions].filter(item =>
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(allResults);
    } catch (error) {
      console.error("Search error:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

>>>>>>> ff4c85ce332f66869dbd202f5419ac366b5aa3b5
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#0a0a1a] via-[#0a0a2a] to-black text-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-10 py-6">
        <div className="flex items-center space-x-3">
<<<<<<< HEAD
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
=======
          <h1 className="text-xl font-semibold tracking-tight">CareerSync</h1>
        </div>
        <div className="space-x-6 text-sm hidden md:flex">
          <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
          <a href="#tutorials" className="hover:text-blue-400 transition-colors">Tutorials</a>
          <a href="#help" className="hover:text-blue-400 transition-colors">Help Center</a>
        </div>
        <div className="flex items-center space-x-3">
          <Link to="/login"><Button variant="ghost" className="text-blue-400 hover:text-white">Sign In</Button></Link>
          <Link to="/register"><Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button></Link>
>>>>>>> ff4c85ce332f66869dbd202f5419ac366b5aa3b5
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center flex-1 text-center px-6">
<<<<<<< HEAD
        <motion.h2 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
=======
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
>>>>>>> ff4c85ce332f66869dbd202f5419ac366b5aa3b5
          transition={{ duration: 0.8 }}
          className="text-sm uppercase tracking-widest text-blue-400 mb-4"
        >
          Empower Your Career Journey
        </motion.h2>

<<<<<<< HEAD
        <motion.h1 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
=======
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
>>>>>>> ff4c85ce332f66869dbd202f5419ac366b5aa3b5
          transition={{ delay: 0.3, duration: 1 }}
          className="text-5xl md:text-6xl font-bold mb-6"
        >
          Discover <span className="text-blue-500">CareerSync</span>
        </motion.h1>

<<<<<<< HEAD
        <motion.p 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
=======
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
>>>>>>> ff4c85ce332f66869dbd202f5419ac366b5aa3b5
          transition={{ delay: 0.6, duration: 1 }}
          className="max-w-2xl text-gray-300 mb-8"
        >
          A modern platform connecting <strong>students</strong>, <strong>institutions</strong>, and <strong>companies</strong> — guiding every step of your career.
        </motion.p>

<<<<<<< HEAD
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

=======
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="flex w-full max-w-md bg-[#141426] rounded-full overflow-hidden shadow-md mb-4"
        >
          <Input
            type="text"
            placeholder="Search for opportunities..."
            className="flex-1 bg-transparent border-none text-white px-5"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 rounded-none">
            {loading ? "Searching..." : "Search"}
          </Button>
        </motion.div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-[#141426] rounded-lg p-4 mt-4"
          >
            <h3 className="text-white mb-2">Search Results</h3>
            {searchResults.map((result) => (
              <div key={result.id} className="text-gray-300 mb-1">
                {result.type === "job" ? `Job: ${result.title} at ${result.companyName}` : `Institution: ${result.name}`}
              </div>
            ))}
          </motion.div>
        )}
      </main>

      {/* Features Section */}
      <section id="features" className="py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-[rgba(255,255,255,0.02)] rounded-lg">
              <h3 className="text-xl font-semibold mb-4">For Students</h3>
              <p className="text-gray-300">Apply to courses and jobs, track applications, and get personalized recommendations.</p>
            </div>
            <div className="p-6 bg-[rgba(255,255,255,0.02)] rounded-lg">
              <h3 className="text-xl font-semibold mb-4">For Institutions</h3>
              <p className="text-gray-300">Manage courses, faculties, and admissions with ease.</p>
            </div>
            <div className="p-6 bg-[rgba(255,255,255,0.02)] rounded-lg">
              <h3 className="text-xl font-semibold mb-4">For Companies</h3>
              <p className="text-gray-300">Post jobs, review applicants, and conduct interviews seamlessly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tutorials Section */}
      <section id="tutorials" className="py-16 px-6 bg-[rgba(255,255,255,0.01)]">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Tutorials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-[rgba(255,255,255,0.02)] rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Getting Started</h3>
              <p className="text-gray-300">Learn how to create an account and navigate the platform.</p>
              <Button className="mt-4">Watch Video</Button>
            </div>
            <div className="p-6 bg-[rgba(255,255,255,0.02)] rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Advanced Features</h3>
              <p className="text-gray-300">Explore advanced tools for better career management.</p>
              <Button className="mt-4">Watch Video</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Help Center Section */}
      <section id="help" className="py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Help Center</h2>
          <p className="text-gray-300 mb-8">Find answers to common questions or contact support.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-[rgba(255,255,255,0.02)] rounded-lg">
              <h3 className="text-xl font-semibold mb-4">FAQs</h3>
              <p className="text-gray-300">Browse frequently asked questions.</p>
            </div>
            <div className="p-6 bg-[rgba(255,255,255,0.02)] rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Contact Support</h3>
              <p className="text-gray-300">Get in touch with our support team.</p>
            </div>
            <div className="p-6 bg-[rgba(255,255,255,0.02)] rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Community</h3>
              <p className="text-gray-300">Join discussions with other users.</p>
            </div>
          </div>
        </div>
      </section>

>>>>>>> ff4c85ce332f66869dbd202f5419ac366b5aa3b5
      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 text-sm border-t border-gray-800">
        © {new Date().getFullYear()} CareerSync. All rights reserved.
      </footer>
    </div>
  );
}
