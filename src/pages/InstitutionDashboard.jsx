// src/pages/StudentDashboard.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Legend } from "recharts";
import { auth, db, storage } from "../services/firebase";
import { collection, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";

const BG = "#0b0f1a";
const ELECTRIC = "#3ee0ff";
const PURPLE = "#8b5cf6";

const StatTile = ({ label, value }) => (
  <motion.div
    whileHover={{ y: -6 }}
    className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(62,224,255,0.04)] flex flex-col items-center justify-center"
  >
    <div className="text-sm text-gray-300">{label}</div>
    <div className="text-3xl font-semibold text-white mt-2">{value}</div>
  </motion.div>
);

const SectionPanel = ({ section, onBack, user, profile, setProfile }) => {
  const [courses, setCourses] = useState([]);
  const [appliedCourses, setAppliedCourses] = useState(profile?.coursesApplied || []);
  const [jobs, setJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();

  // Load courses
  useEffect(() => {
    const loadCourses = async () => {
      const data = await getDocs(collection(db, "courses"));
      setCourses(data.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    loadCourses();
  }, []);

  // Load jobs
  useEffect(() => {
    const loadJobs = async () => {
      const q = collection(db, "jobs");
      const snapshot = await getDocs(q);
      const jobsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setJobs(jobsData);

      // Notifications
      const newNotifications = jobsData.filter(
        job => profile.skills?.includes(job.field) && !notifications.some(n => n.id === job.id)
      );
      setNotifications(newNotifications);
    };
    if (user) loadJobs();
  }, [profile, user]);

  // Apply to course
  const handleApplyCourse = async (courseId) => {
    if (appliedCourses.length >= 2) return alert("Max 2 courses per institution!");
    try {
      await updateDoc(doc(db, "students", user.uid), {
        coursesApplied: [...appliedCourses, courseId],
      });
      setAppliedCourses([...appliedCourses, courseId]);
      alert("Course applied successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  // File upload
  const handleFileUpload = async (type) => {
    if (!selectedFile) return alert("Select a file!");
    try {
      const fileRef = ref(storage, `students/${user.uid}/${type}/${selectedFile.name}`);
      await uploadBytes(fileRef, selectedFile);
      const downloadURL = await getDownloadURL(fileRef);
      await updateDoc(doc(db, "students", user.uid), {
        [type]: [...(profile[type] || []), downloadURL],
      });
      setProfile(prev => ({
        ...prev,
        [type]: [...(prev[type] || []), downloadURL],
      }));
      alert("File uploaded!");
    } catch (err) {
      console.error(err);
    }
  };

  // Render content per section
  const renderSection = () => {
    switch (section) {
      case "Dashboard":
        const chartData = [
          { name: "Courses Applied", count: appliedCourses.length },
          { name: "Jobs Available", count: jobs.length },
        ];
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatTile label="Courses Applied" value={appliedCourses.length} />
              <StatTile label="Jobs Available" value={jobs.length} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(62,224,255,0.04)]">
                <h3 className="text-xl font-semibold text-white mb-4">System Overview</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData}>
                    <XAxis dataKey="name" stroke="gray" />
                    <YAxis stroke="gray" />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke={ELECTRIC} fill={ELECTRIC + "22"} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(62,224,255,0.04)]">
                <h3 className="text-xl font-semibold text-white mb-4">System Health</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" stroke="gray" />
                    <YAxis stroke="gray" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill={PURPLE} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );

      case "Courses":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map(course => (
              <motion.div
                key={course.id}
                className="p-6 bg-[rgba(255,255,255,0.02)] border border-[rgba(62,224,255,0.04)] rounded-2xl"
                whileHover={{ scale: 1.03 }}
              >
                <h3 className="text-xl font-semibold text-white">{course.name}</h3>
                <p className="text-gray-300 mt-2">{course.description}</p>
                <button
                  disabled={appliedCourses.includes(course.id)}
                  className={`mt-4 px-4 py-2 rounded font-semibold ${
                    appliedCourses.includes(course.id) ? "bg-gray-500 cursor-not-allowed" : "bg-gradient-to-r from-[#5eead4] to-[#06b6d4] text-black"
                  }`}
                  onClick={() => handleApplyCourse(course.id)}
                >
                  {appliedCourses.includes(course.id) ? "Applied" : "Apply"}
                </button>
              </motion.div>
            ))}
          </div>
        );

      case "Jobs":
        return (
          <div className="space-y-4">
            {jobs.map(job => (
              <motion.div
                key={job.id}
                className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(62,224,255,0.04)]"
                whileHover={{ scale: 1.03 }}
              >
                <h3 className="text-xl font-semibold text-white">{job.title}</h3>
                <p className="text-gray-400">{job.company}</p>
                <p className="text-gray-300 mt-2">{job.description}</p>
                <button className="mt-4 px-4 py-2 rounded bg-gradient-to-r from-[#5eead4] to-[#06b6d4] text-black font-semibold">
                  Apply
                </button>
              </motion.div>
            ))}
          </div>
        );

      case "Uploads":
        return (
          <div className="space-y-6">
            {["documents", "transcripts"].map(type => (
              <div key={type} className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(62,224,255,0.04)]">
                <h3 className="text-xl font-semibold text-white mb-4">{type.charAt(0).toUpperCase() + type.slice(1)}</h3>
                <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} className="mb-3 w-full text-black" />
                <button
                  onClick={() => handleFileUpload(type)}
                  className="px-4 py-2 rounded bg-gradient-to-r from-[#5eead4] to-[#06b6d4] text-black font-semibold"
                >
                  Upload
                </button>

                <div className="mt-4 space-y-2">
                  {profile[type]?.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-[#3ee0ff] underline block">
                      {url.split("/").pop()}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case "Profile":
        return (
          <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(62,224,255,0.04)]">
            <h3 className="text-xl font-semibold text-white mb-4">Profile</h3>
            <div className="text-white font-semibold text-lg">{profile.name || "Student Name"}</div>
            <div className="text-gray-400 mt-1">{profile.email || user.email}</div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div layout initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:8 }}>
      {section !== "Dashboard" && (
        <div className="mb-4 flex items-center gap-4">
          <button onClick={onBack} className="px-3 py-2 rounded-lg bg-[rgba(139,92,246,0.08)] text-[rgba(62,224,255,0.9)]">← Back</button>
          <h2 className="text-2xl font-semibold text-white">{section}</h2>
        </div>
      )}
      {renderSection()}
    </motion.div>
  );
};

export default function StudentDashboard() {
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (!u) return navigate("/login");
      setUser(u);
      const snap = await getDoc(doc(db, "students", u.uid));
      if (snap.exists()) setProfile(snap.data());
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen w-full text-white" style={{ background: BG }}>
      <aside className="fixed left-0 top-0 h-full w-72 px-6 pt-8 pb-6 border-r hidden md:block">
        <div className="mb-6">
          <div className="text-2xl font-bold text-white tracking-wide">Student Portal</div>
          <div className="text-sm text-gray-400">Dashboard</div>
        </div>

        <nav className="space-y-2">
          {["Dashboard","Courses","Jobs","Uploads","Profile"].map(sec => (
            <button
              key={sec}
              onClick={() => setActiveSection(sec)}
              className={`w-full text-left px-3 py-2 rounded-lg ${activeSection===sec ? "bg-[rgba(62,224,255,0.04)]" : "hover:bg-[rgba(255,255,255,0.02)]"}`}
            >
              {sec}
            </button>
          ))}

          <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 mt-4">Logout</button>
        </nav>
      </aside>

      <main className="ml-0 md:ml-72 p-6 pb-24 relative z-10">
        <AnimatePresence exitBeforeEnter>
          <SectionPanel
            key={activeSection}
            section={activeSection}
            onBack={() => setActiveSection("Dashboard")}
            user={user}
            profile={profile}
            setProfile={setProfile}
          />
        </AnimatePresence>
      </main>
    </div>
  );
}
