import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  onSnapshot,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../services/firebase";
import { FaUserCircle, FaBook, FaBriefcase, FaUpload, FaSignOutAlt } from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({});
  const [courses, setCourses] = useState([]);
  const [appliedCourses, setAppliedCourses] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  // ========== AUTH ==========
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const profileDoc = await getDoc(doc(db, "students", currentUser.uid));
        if (profileDoc.exists()) setProfile(profileDoc.data());
        else setProfile({});
      } else {
        setUser(null);
        setProfile({});
      }
    });
    return () => unsubscribe();
  }, []);

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        registerEmail,
        registerPassword
      );
      await sendEmailVerification(userCredential.user);
      await setDoc(doc(db, "students", userCredential.user.uid), {
        email: registerEmail,
        name: "",
        coursesApplied: [],
        documents: [],
        transcripts: [],
        skills: [],
      });
      alert("Registration successful! Check your email for verification.");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setActiveTab("dashboard");
  };

  // ========== COURSE APPLICATION ==========
  const handleApplyCourse = async (courseId) => {
    if (appliedCourses.length >= 2) {
      alert("Maximum 2 courses per institution.");
      return;
    }
    try {
      await updateDoc(doc(db, "students", user.uid), {
        coursesApplied: [...appliedCourses, courseId],
      });
      setAppliedCourses([...appliedCourses, courseId]);
    } catch (err) {
      console.error(err);
    }
  };

  // ========== FILE UPLOAD ==========
  const handleFileUpload = async (type) => {
    if (!selectedFile) return alert("Select a file first!");
    try {
      const fileRef = ref(storage, `students/${user.uid}/${type}/${selectedFile.name}`);
      await uploadBytes(fileRef, selectedFile);
      const downloadURL = await getDownloadURL(fileRef);
      await updateDoc(doc(db, "students", user.uid), {
        [type]: [...(profile[type] || []), downloadURL],
      });
      setProfile((prev) => ({
        ...prev,
        [type]: [...(prev[type] || []), downloadURL],
      }));
    } catch (err) {
      console.error(err);
    }
  };

  // ========== JOBS & NOTIFICATIONS ==========
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "jobs"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setJobs(jobsData);
      const newNotifications = jobsData.filter(
        (job) => profile.skills?.includes(job.field) && !notifications.some(n => n.id === job.id)
      );
      setNotifications(newNotifications);
    });
    return () => unsubscribe();
  }, [profile, user]);

  // ========== Chart Data ==========
  const chartData = {
    labels: ["Applied Courses", "Available Jobs", "Uploaded Files"],
    datasets: [
      {
        label: "Overview",
        data: [
          appliedCourses.length,
          jobs.length,
          (profile.documents?.length || 0) + (profile.transcripts?.length || 0),
        ],
        backgroundColor: ["#4fd1c5", "#f87171", "#fde68a"],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Student Dashboard Overview", color: "#ffffff" },
    },
    scales: {
      y: {
        ticks: { color: "#ffffff" },
        beginAtZero: true,
      },
      x: { ticks: { color: "#ffffff" } },
    },
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b0b1b] text-white p-6">
        <motion.h1
          className="text-4xl font-bold mb-6 text-[#4fd1c5]"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          Student Dashboard Login/Register
        </motion.h1>
        <div className="flex flex-col gap-4 w-full max-w-md">
          <input
            type="email"
            placeholder="Email"
            className="p-3 rounded bg-gray-800 text-white"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="p-3 rounded bg-gray-800 text-white"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
          />
          <button
            className="p-3 bg-[#4fd1c5] rounded font-bold text-black"
            onClick={handleLogin}
          >
            Login
          </button>
          <hr className="border-gray-700 my-4" />
          <input
            type="email"
            placeholder="Register Email"
            className="p-3 rounded bg-gray-800 text-white"
            value={registerEmail}
            onChange={(e) => setRegisterEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Register Password"
            className="p-3 rounded bg-gray-800 text-white"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
          />
          <button
            className="p-3 bg-[#f87171] rounded font-bold text-white"
            onClick={handleRegister}
          >
            Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <motion.div
        className="w-72 bg-gray-800 p-6 flex flex-col"
        initial={{ x: -300 }}
        animate={{ x: 0 }}
      >
        <h2 className="text-2xl font-bold text-[#4fd1c5] mb-6 flex items-center gap-2">
          <FaUserCircle /> {profile.name || "Student"}
        </h2>
        {[
          { name: "Dashboard", key: "dashboard", icon: <FaBook /> },
          { name: "Courses", key: "courses", icon: <FaBook /> },
          { name: "Jobs", key: "jobs", icon: <FaBriefcase /> },
          { name: "Profile", key: "profile", icon: <FaUserCircle /> },
          { name: "Uploads", key: "uploads", icon: <FaUpload /> },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`mb-3 flex items-center gap-2 px-4 py-2 rounded transition-colors ${
              activeTab === tab.key ? "bg-[#4fd1c5] text-black font-bold" : "hover:bg-gray-700"
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon} {tab.name}
          </button>
        ))}
        <button
          className="mt-auto flex items-center gap-2 px-4 py-2 rounded bg-[#f87171] hover:bg-red-600 font-bold"
          onClick={handleLogout}
        >
          <FaSignOutAlt /> Logout
        </button>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <AnimatePresence exitBeforeEnter>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-3xl font-bold text-[#4fd1c5] mb-6">
              {activeTab === "dashboard" && `Welcome, ${profile.name || user.email}!`}
              {activeTab === "courses" && "Available Courses"}
              {activeTab === "jobs" && "Job Opportunities"}
              {activeTab === "profile" && "Your Profile"}
              {activeTab === "uploads" && "Upload Documents & Transcripts"}
            </h1>

            {/* Dashboard */}
            {activeTab === "dashboard" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  className="bg-gray-800 p-6 rounded shadow-md flex flex-col items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <h3 className="text-xl font-bold mb-2 text-[#4fd1c5]">Applied Courses</h3>
                  <p className="text-5xl">{appliedCourses.length}</p>
                </motion.div>
                <motion.div
                  className="bg-gray-800 p-6 rounded shadow-md flex flex-col items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <h3 className="text-xl font-bold mb-2 text-[#f87171]">Available Jobs</h3>
                  <p className="text-5xl">{jobs.length}</p>
                </motion.div>
                <motion.div
                  className="bg-gray-800 p-6 rounded shadow-md flex flex-col items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <h3 className="text-xl font-bold mb-2 text-[#fde68a]">Uploaded Files</h3>
                  <p className="text-5xl">{(profile.documents?.length || 0) + (profile.transcripts?.length || 0)}</p>
                </motion.div>

                {/* Bar Chart */}
                <motion.div className="col-span-1 md:col-span-3 bg-gray-800 p-6 rounded shadow-md mt-6">
                  <Bar data={chartData} options={chartOptions} />
                </motion.div>
              </div>
            )}

            {/* Courses */}
            {activeTab === "courses" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.length === 0 && (
                  <p className="text-center col-span-full">No courses available.</p>
                )}
                {courses.map((course) => (
                  <motion.div
                    key={course.id}
                    className="bg-gray-800 p-6 rounded shadow-md flex flex-col justify-center items-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <h3 className="text-xl font-bold mb-2">{course.name}</h3>
                    <p className="text-center mb-4">{course.description}</p>
                    <button
                      disabled={appliedCourses.includes(course.id)}
                      onClick={() => handleApplyCourse(course.id)}
                      className={`px-4 py-2 rounded ${
                        appliedCourses.includes(course.id)
                          ? "bg-gray-500 cursor-not-allowed"
                          : "bg-[#4fd1c5] text-black font-bold"
                      }`}
                    >
                      {appliedCourses.includes(course.id) ? "Applied" : "Apply"}
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Jobs */}
            {activeTab === "jobs" && (
              <div>
                {notifications.length > 0 && (
                  <div className="mb-4 p-4 bg-[#fde68a] text-black rounded">
                    <h3 className="font-bold mb-2">New Jobs Matching Your Profile:</h3>
                    {notifications.map((job) => (
                      <p key={job.id}>{job.title} at {job.company}</p>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {jobs.map((job) => (
                    <motion.div
                      key={job.id}
                      className="bg-gray-800 p-6 rounded shadow-md flex flex-col justify-center items-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <h3 className="text-xl font-bold mb-2">{job.title}</h3>
                      <p className="text-center mb-2">{job.company}</p>
                      <p className="text-center mb-4">{job.description}</p>
                      <button
                        className="px-4 py-2 bg-[#4fd1c5] text-black rounded font-bold"
                        onClick={() => alert("Applied for job!")}
                      >
                        Apply
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Profile */}
            {activeTab === "profile" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div className="bg-gray-800 p-6 rounded shadow-md flex flex-col justify-center items-center">
                  <h3 className="text-xl font-bold mb-2">Name</h3>
                  <p>{profile.name || "N/A"}</p>
                </motion.div>
                <motion.div className="bg-gray-800 p-6 rounded shadow-md flex flex-col justify-center items-center">
                  <h3 className="text-xl font-bold mb-2">Email</h3>
                  <p>{profile.email || user.email}</p>
                </motion.div>
                <motion.div className="bg-gray-800 p-6 rounded shadow-md flex flex-col justify-center items-center">
                  <h3 className="text-xl font-bold mb-2">Skills</h3>
                  <p>{profile.skills?.join(", ") || "N/A"}</p>
                </motion.div>
                <motion.div className="bg-gray-800 p-6 rounded shadow-md flex flex-col justify-center items-center">
                  <h3 className="text-xl font-bold mb-2">Applied Courses</h3>
                  <p>{appliedCourses.length > 0 ? appliedCourses.join(", ") : "None"}</p>
                </motion.div>
              </div>
            )}

            {/* Uploads */}
            {activeTab === "uploads" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div className="bg-gray-800 p-6 rounded shadow-md flex flex-col justify-center items-center">
                  <h3 className="text-xl font-bold mb-2">Upload Document</h3>
                  <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
                  <button
                    className="mt-2 px-4 py-2 bg-[#4fd1c5] text-black rounded font-bold"
                    onClick={() => handleFileUpload("documents")}
                  >
                    Upload
                  </button>
                  {profile.documents?.length > 0 && (
                    <ul className="mt-2 text-center">
                      {profile.documents.map((doc, i) => (
                        <li key={i}>
                          <a href={doc} target="_blank" rel="noopener noreferrer" className="text-[#4fd1c5] hover:underline">
                            Document {i + 1}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
                <motion.div className="bg-gray-800 p-6 rounded shadow-md flex flex-col justify-center items-center">
                  <h3 className="text-xl font-bold mb-2">Upload Transcript</h3>
                  <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
                  <button
                    className="mt-2 px-4 py-2 bg-[#f87171] text-white rounded font-bold"
                    onClick={() => handleFileUpload("transcripts")}
                  >
                    Upload
                  </button>
                  {profile.transcripts?.length > 0 && (
                    <ul className="mt-2 text-center">
                      {profile.transcripts.map((doc, i) => (
                        <li key={i}>
                          <a href={doc} target="_blank" rel="noopener noreferrer" className="text-[#fde68a] hover:underline">
                            Transcript {i +1}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudentDashboard;

