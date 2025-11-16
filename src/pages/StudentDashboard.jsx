<<<<<<< HEAD
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
=======
// src/pages/StudentDashboard.jsx
import React, { useState, useEffect, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { auth, db, storage } from "../services/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  addDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../components/ui/chart";

const ELECTRIC = "#3ee0ff";
const PURPLE = "#8b5cf6";

const StatTile = ({ label, value }) => (
  <Card className="bg-[rgba(255,255,255,0.02)] border-[rgba(62,224,255,0.04)]">
    <CardContent className="p-6 flex flex-col items-center justify-center">
      <div className="text-sm text-white">{label}</div>
      <div className="text-3xl font-semibold text-white mt-2">{value}</div>
    </CardContent>
  </Card>
);

const SectionPanel = memo(({ section, onBack, user, profile, setProfile }) => {
  const [institutions, setInstitutions] = useState([]);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [courses, setCourses] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [jobNotifications, setJobNotifications] = useState([]);
  const [interviewNotifications, setInterviewNotifications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [choosing, setChoosing] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState({});
  const [enteredGrades, setEnteredGrades] = useState(null); // { marks: number, skills: array }
  const [gradesSubmitted, setGradesSubmitted] = useState(false);

  // Sync enteredGrades and gradesSubmitted with profile
  useEffect(() => {
    if (profile.enteredGrades) setEnteredGrades(profile.enteredGrades);
    if (profile.gradesSubmitted) setGradesSubmitted(profile.gradesSubmitted);
  }, [profile]);

  // 🔹 Institutions (only approved)
  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, "institutions"), where("status", "==", "approved")), (snap) => {
      setInstitutions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // 🔹 Courses (only from approved institutions)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "courses"), async (snap) => {
      const allCourses = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const approvedInstIds = institutions.map(inst => inst.id);
      const filteredCourses = allCourses.filter(course => approvedInstIds.includes(course.institutionId));

      // Add institutionName to each course
      const coursesWithInstName = await Promise.all(filteredCourses.map(async (course) => {
        const instDoc = await getDoc(doc(db, "institutions", course.institutionId));
        const institutionName = instDoc.exists() ? instDoc.data().name : "Unknown Institution";
        return { ...course, institutionName };
      }));

      setCourses(coursesWithInstName);
    });
    return () => unsub();
  }, [institutions]);

  // 🔹 Student registrations
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "registrations"), where("studentId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      setRegistrations(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  // 🔹 Jobs (only from approved companies)
  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, "companies"), where("status", "==", "approved")), async (compSnap) => {
      const approvedCompanyIds = compSnap.docs.map(d => d.id);
      const jobsUnsub = onSnapshot(collection(db, "jobs"), (snap) => {
        const jobsData = snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter(job => approvedCompanyIds.includes(job.companyId));
        setJobs(jobsData);
        const notif = jobsData.filter((job) => {
          const jobSkills = Array.isArray(job.skills) ? job.skills : [];
          const jobMarks = parseFloat(job.marks) || 0;
          const hasSkill = jobSkills.some(skill => profile.skills?.includes(skill));
          const hasMarks = (profile.marks || 0) >= jobMarks;
          return hasSkill && hasMarks;
        }).map(job => ({ ...job, type: "job_match" }));
        setJobNotifications(notif);
      });
      return () => jobsUnsub();
    });
    return () => unsub();
  }, [profile]);

  // 🔹 Interview Notifications
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "notifications"), where("studentId", "==", user.uid), where("type", "==", "interview_invitation"));
    const unsub = onSnapshot(q, (snap) => {
      const interviewNotifs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setNotifications(prev => [...prev.filter(n => !n.type || n.type !== "interview_invitation"), ...interviewNotifs]);
    });
    return () => unsub();
  }, [user]);

  // 🔹 Check eligibility for course
  const getCourseEligibility = (course) => {
    const institutionCourses = registrations.filter(
      (r) => r.institutionId === course.institutionId && r.type === "course"
    );
    if (institutionCourses.length >= 2) return { eligible: false, reason: "Max 2 courses per institution reached." };
    if (registrations.some((r) => r.courseId === course.id)) return { eligible: false, reason: "Already applied." };

    if (!enteredGrades) return { eligible: false, reason: "Please enter your grades first." };

    const requiredSubjects = course.requiredSubjects || [];
    const minMarks = course.minMarks || 0;
    const studentSubjects = enteredGrades.skills || [];
    const studentMarks = enteredGrades.marks || 0;

    const missingSubjects = requiredSubjects.filter(sub => !studentSubjects.some(s => s.toLowerCase().trim() === sub.toLowerCase().trim()));
    if (missingSubjects.length > 0) return { eligible: false, reason: `Missing skills: ${missingSubjects.join(', ')}` };
    if (studentMarks < minMarks) return { eligible: false, reason: `Marks too low: need ${minMarks}, have ${studentMarks}` };

    return { eligible: true, reason: "" };
  };

  // 🔹 Apply for course
  const handleApplyCourse = async (course) => {
    const eligibility = getCourseEligibility(course);
    if (!eligibility.eligible) return alert(eligibility.reason);

    // Check if admissions published and student has admitted status
    const instSnap = await getDoc(doc(db, "institutions", course.institutionId));
    if (instSnap.data().published && registrations.some(r => r.status === "admitted")) {
      return alert("Admissions are published. Cannot apply for new courses.");
    }

    try {
      await addDoc(collection(db, "registrations"), {
        studentId: user.uid,
        studentName: profile.name,
        courseId: course.id,
        courseName: course.name,
        institutionId: course.institutionId,
        institutionName: course.institutionName,
        status: "pending",
        type: "course",
        createdAt: serverTimestamp(),
      });
      alert("Applied for course successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Apply for job
  const handleApplyJob = async (job) => {
    if (registrations.some((r) => r.jobId === job.id))
      return alert("Already applied for this job!");

    // Check qualifications
    const jobSkills = Array.isArray(job.skills) ? job.skills : [];
    const minMarks = parseFloat(job.marks) || 0;
    if (!jobSkills.some(skill => profile.skills?.includes(skill))) {
      return alert("You do not have the required skills.");
    }
    if ((profile.marks || 0) < minMarks) {
      return alert("Your marks do not meet the minimum requirement.");
    }

    try {
      await addDoc(collection(db, "registrations"), {
        studentId: user.uid,
        jobId: job.id,
        jobTitle: job.title,
        companyId: job.companyId,
        companyName: job.companyName || "Unknown Company",
        status: "pending",
        type: "job",
        createdAt: serverTimestamp(),
      });
      alert("Job application submitted!");
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Upload documents
  const handleFileUpload = async (type) => {
    if (!selectedFile) return alert("Please select a file!");
    try {
      const fileRef = ref(storage, `students/${user.uid}/${type}/${selectedFile.name}`);
      // Check if exists
      await getDownloadURL(fileRef);
      return alert("File with this name already exists!");
    } catch {
      // Not exists, proceed
      await uploadBytes(fileRef, selectedFile);
      const downloadURL = await getDownloadURL(fileRef);
      const studentRef = doc(db, "students", user.uid);
      const currentFiles = profile[type] || [];
      await updateDoc(studentRef, { [type]: [...currentFiles, downloadURL] });
      setProfile((prev) => ({ ...prev, [type]: [...currentFiles, downloadURL] }));
      alert("File uploaded successfully!");
    }
  };

  // 🔹 Update profile
  const handleUpdateProfile = async () => {
    try {
      await updateDoc(doc(db, "students", user.uid), tempProfile);
      setProfile(tempProfile);
      setEditingProfile(false);
      alert("Profile updated!");
    } catch (e) {
      console.error(e);
      alert("Failed to update profile");
    }
  };

  // 🔹 Choose institution
  const handleChooseInstitution = async (chosen) => {
    const admitted = registrations.filter(r => r.type === "course" && r.status === "admitted");
    for (let reg of admitted) {
      if (reg.id !== chosen.id) {
        await updateDoc(doc(db, "registrations", reg.id), { status: "removed" });
        // Promote waiting list
        const q = query(collection(db, "registrations"), where("courseId", "==", reg.courseId), where("status", "==", "waiting"), orderBy("createdAt", "asc"));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const first = snap.docs[0];
          await updateDoc(doc(db, "registrations", first.id), { status: "pending" });
        }
      }
    }
    setChoosing(false);
  };

  // 🔹 Render sections
  const renderSection = () => {
    switch (section) {
      case "Dashboard": {
        const chartData = [
          { name: "Courses Applied", count: registrations.filter((r) => r.type === "course").length },
          { name: "Jobs Available", count: jobs.length },
        ];
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatTile label="Courses Applied" value={chartData[0].count} />
              <StatTile label="Jobs Available" value={chartData[1].count} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-[rgba(255,255,255,0.02)] border">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">System Overview</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={chartData}>
                      <XAxis dataKey="name" stroke="white" tick={{ fill: 'white' }} />
                      <YAxis stroke="white" tick={{ fill: 'white' }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="count" stroke={ELECTRIC} fill={ELECTRIC + "22"} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-[rgba(255,255,255,0.02)] border">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">System Health</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" stroke="white" tick={{ fill: 'white' }} />
                      <YAxis stroke="white" tick={{ fill: 'white' }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill={PURPLE} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {notifications.length > 0 && (
              <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border">
                <h3 className="text-white font-semibold mb-2">Notifications</h3>
                {notifications.map((n) => (
                  <div key={n.id} className="text-white mb-2 p-2 bg-[rgba(255,255,255,0.01)] rounded">
                    {n.type === "interview_invitation" ? n.message : `${n.title} matches your skills`}
                  </div>
>>>>>>> ff4c85ce332f66869dbd202f5419ac366b5aa3b5
                ))}
              </div>
            )}

<<<<<<< HEAD
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

=======
            <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border">
              <h3 className="text-xl font-semibold text-white mb-4">Admission Results</h3>
              {registrations.filter(r => r.type === "course").map(r => (
                <div key={r.id} className="text-white mb-2">
                  {r.courseName} at {r.institutionName}: {r.status}
                </div>
              ))}
            </div>

            {registrations.filter(r => r.type === "course" && r.status === "admitted").length > 1 && !choosing && (
              <div className="p-4 rounded-2xl bg-yellow-600 border">
                <h3 className="text-white font-semibold">You are admitted to multiple institutions. Please choose one.</h3>
                <Button onClick={() => setChoosing(true)} className="mt-2 px-4 py-2 bg-white text-black">Choose Institution</Button>
              </div>
            )}

            {choosing && (
              <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border">
                <h3 className="text-white font-semibold mb-4">Choose Your Institution</h3>
                {registrations.filter(r => r.type === "course" && r.status === "admitted").map(r => (
                  <Button key={r.id} onClick={() => handleChooseInstitution(r)} className="mr-2 px-4 py-2 bg-green-600">Choose {r.institutionName}</Button>
                ))}
              </div>
            )}
          </div>
        );
      }

      case "Institutions":
        if (selectedInstitution) {
          if (!gradesSubmitted) {
            return (
              <div>
                <Button onClick={onBack} variant="ghost" className="px-3 py-2 mb-4">
                  ← Back to Institutions
                </Button>
                <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border">
                  <h3 className="text-xl font-semibold text-white mb-4">Enter Your Grades for {selectedInstitution.name}</h3>
                  <input
                    type="number"
                    placeholder="Marks"
                    onChange={(e) => setEnteredGrades(prev => ({ ...prev, marks: parseFloat(e.target.value) || 0 }))}
                    className="p-2 rounded bg-[rgba(255,255,255,0.01)] border text-white mb-2 w-full"
                  />
                  <input
                    type="text"
                    placeholder="Skills (comma separated)"
                    onChange={(e) => setEnteredGrades(prev => ({ ...prev, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s) }))}
                    className="p-2 rounded bg-[rgba(255,255,255,0.01)] border text-white mb-4 w-full"
                  />
                  <Button
                    onClick={async () => {
                      if (!enteredGrades || !enteredGrades.marks || !enteredGrades.skills.length) {
                        alert("Please enter marks and skills.");
                      } else {
                        try {
                          await updateDoc(doc(db, "students", user.uid), {
                            enteredGrades,
                            gradesSubmitted: true,
                          });
                          setGradesSubmitted(true);
                          alert("Grades submitted successfully!");
                        } catch (err) {
                          console.error(err);
                          alert("Failed to submit grades.");
                        }
                      }
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-[#5eead4] to-[#06b6d4] font-semibold"
                  >
                    Submit Grades
                  </Button>
                </div>
              </div>
            );
          }
          const institutionCourses = courses.filter(
            (c) => c.institutionId === selectedInstitution.id
          );
          return (
            <div>
              <Button onClick={onBack} variant="ghost" className="px-3 py-2 mb-4">
                ← Back to Institutions
              </Button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {institutionCourses.map((course) => {
                  const applied = registrations.some((r) => r.courseId === course.id);
                  const eligibility = getCourseEligibility(course);
                  return (
                    <motion.div
                      key={course.id}
                      whileHover={{ scale: 1.03 }}
                      className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border"
                    >
                      <h3 className="text-xl font-semibold text-white">{course.name}</h3>
                      <p className="text-gray-300 mt-2">{course.description}</p>
                      <p className="text-gray-400 mt-1">Required Skills: {course.requiredSubjects?.join(', ') || 'None'}</p>
                      <p className="text-gray-400 mt-1">Min Marks: {course.minMarks || 0}</p>
                      {applied ? (
                        <div className="mt-4 text-gray-400">Already Applied</div>
                      ) : eligibility.eligible ? (
                        <Button
                          variant="ghost"
                          onClick={() => handleApplyCourse(course)}
                          className="mt-4 bg-gradient-to-r from-[#5eead4] to-[#06b6d4] !text-black"
                        >
                          Apply
                        </Button>
                      ) : (
                        <div className="mt-4">
                          <div className="text-red-400 text-sm mb-2">Not Eligible: {eligibility.reason}</div>
                          <Button
                            disabled
                            className="px-4 py-2 font-semibold bg-gray-500 cursor-not-allowed"
                          >
                            Apply
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        }

        // 🔹 Clickable Institutions
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {institutions.map((inst) => (
              <motion.div
                key={inst.id}
                whileHover={{ scale: 1.03 }}
                onClick={() => setSelectedInstitution(inst)}
                className="cursor-pointer transition-all hover:bg-[rgba(62,224,255,0.05)] p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border hover:border-[#3ee0ff]"
              >
                <h3 className="text-xl font-semibold text-white">{inst.name}</h3>
                <p className="text-gray-400 mt-2">{inst.description || "No description available"}</p>
              </motion.div>
            ))}
          </div>
        );

      case "Jobs":
        return (
          <div className="space-y-4">
            {jobs.map((job) => {
              const applied = registrations.some((r) => r.jobId === job.id);
              const jobSkills = Array.isArray(job.skills) ? job.skills : [];
              const minMarks = parseFloat(job.marks) || 0;
              const hasSkill = jobSkills.some(skill => profile.skills?.includes(skill));
              const hasMarks = (profile.marks || 0) >= minMarks;
              const eligible = hasSkill && hasMarks;
              return (
                <motion.div
                  key={job.id}
                  whileHover={{ scale: 1.03 }}
                  className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border"
                >
                  <h3 className="text-xl font-semibold text-white">{job.title}</h3>
                  <p className="text-gray-400">{job.companyName}</p>
                  <p className="text-gray-300 mt-2">{job.description}</p>
                  {applied ? (
                    <div className="mt-4 text-gray-400">Already Applied</div>
                  ) : eligible ? (
                    <Button
                      onClick={() => handleApplyJob(job)}
                      className="mt-4 bg-gradient-to-r from-[#5eead4] to-[#06b6d4] text-black"
                    >
                      Apply
                    </Button>
                  ) : (
                    <div className="mt-4">
                      <div className="text-red-400 text-sm mb-2">
                        Not Eligible: {!hasSkill ? `Missing skills: ${jobSkills.filter(s => !profile.skills?.includes(s)).join(', ')}` : `Marks too low: need ${minMarks}, have ${profile.marks || 0}`}
                      </div>
                      <Button
                        disabled
                        className="px-4 py-2 font-semibold bg-gray-500 cursor-not-allowed"
                      >
                        Apply
                      </Button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        );

      case "Applications":
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border">
              <h3 className="text-xl font-semibold text-white mb-4">Course Applications</h3>
              {registrations.filter(r => r.type === "course").map(r => (
                <div key={r.id} className="text-white mb-2 p-4 bg-[rgba(255,255,255,0.01)] rounded">
                  {r.courseName} at {r.institutionName}: {r.status}
                </div>
              ))}
            </div>
            <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border">
              <h3 className="text-xl font-semibold text-white mb-4">Job Applications</h3>
              {registrations.filter(r => r.type === "job").map(r => (
                <div key={r.id} className="text-white mb-2 p-4 bg-[rgba(255,255,255,0.01)] rounded">
                  {r.jobTitle} at {r.companyName}: {r.status}
                </div>
              ))}
            </div>
          </div>
        );

      case "Uploads":
        return (
          <div className="space-y-6">
            {["documents", "transcripts"].map((type) => (
              <div key={type} className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border">
                <h3 className="text-xl font-semibold text-white mb-4 capitalize">{type}</h3>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="mb-3 w-full text-black"
                />
                <Button
                  onClick={() => handleFileUpload(type)}
                  className="px-4 py-2 bg-gradient-to-r from-[#5eead4] to-[#06b6d4] font-semibold"
                >
                  Upload
                </Button>
              </div>
            ))}
          </div>
        );

      case "Profile":
        if (editingProfile) {
          return (
            <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border">
              <h3 className="text-xl font-semibold text-white mb-4">Edit Profile</h3>
              <input value={tempProfile.name || ""} onChange={e=>setTempProfile({...tempProfile, name:e.target.value})} className="p-2 rounded bg-[rgba(255,255,255,0.01)] border text-white mb-2 w-full" placeholder="Name" />
              <input value={tempProfile.phone || ""} onChange={e=>setTempProfile({...tempProfile, phone:e.target.value})} className="p-2 rounded bg-[rgba(255,255,255,0.01)] border text-white mb-2 w-full" placeholder="Phone" />
              <input value={tempProfile.location || ""} onChange={e=>setTempProfile({...tempProfile, location:e.target.value})} className="p-2 rounded bg-[rgba(255,255,255,0.01)] border text-white mb-2 w-full" placeholder="Location" />
              <input value={tempProfile.marks || ""} onChange={e=>setTempProfile({...tempProfile, marks:parseFloat(e.target.value) || 0})} className="p-2 rounded bg-[rgba(255,255,255,0.01)] border text-white mb-2 w-full" placeholder="Marks" type="number" />
              <input value={tempProfile.skills?.join(', ') || ""} onChange={e=>setTempProfile({...tempProfile, skills:e.target.value.split(',').map(s=>s.trim()).filter(s=>s)})} className="p-2 rounded bg-[rgba(255,255,255,0.01)] border text-white mb-2 w-full" placeholder="Skills (comma separated)" />
              <Button onClick={handleUpdateProfile} className="px-4 py-2 bg-gradient-to-r from-[#5eead4] to-[#06b6d4] font-semibold mr-2">Save</Button>
              <Button onClick={() => setEditingProfile(false)} variant="ghost" className="px-4 py-2">Cancel</Button>
            </div>
          );
        } else {
          return (
            <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border">
              <h3 className="text-xl font-semibold text-white mb-4">Profile</h3>
              <div className="text-white font-semibold text-lg">{profile.name || "Student Name"}</div>
              <div className="text-white mt-1">{profile.email || user.email}</div>
              <div className="text-white mt-1">Phone: {profile.phone || "N/A"}</div>
              <div className="text-white mt-1">Location: {profile.location || "N/A"}</div>
              <div className="text-white mt-1">Marks: {profile.marks || "N/A"}</div>
              <div className="text-white mt-1">Skills: {profile.skills?.join(', ') || "N/A"}</div>
              <button onClick={() => { setEditingProfile(true); setTempProfile({...profile}); }} className="mt-4 px-4 py-2 bg-gradient-to-r from-[#5eead4] to-[#06b6d4] rounded font-semibold">Edit Profile</button>
            </div>
          );
        }

      default:
        return null;
    }
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
      {section !== "Dashboard" && (
        <div className="mb-4 flex items-center gap-4">
          <Button onClick={onBack} variant="ghost" className="px-3 py-2">← Back</Button>
          <h2 className="text-2xl font-semibold text-white">{section}</h2>
        </div>
      )}
      {renderSection()}
    </motion.div>
  );
});

export default function StudentDashboard() {
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) return navigate("/login");
      if (!u.emailVerified) return navigate("/verify-email");
      setUser(u);
      const snap = await getDoc(doc(db, "students", u.uid));
      if (!snap.exists()) {
        await setDoc(doc(db, "students", u.uid), {
          name: u.displayName || "",
          email: u.email,
          phone: "",
          location: "",
          marks: 0,
          skills: [],
          documents: [],
          transcripts: []
   });
        setProfile({ name: u.displayName || "", email: u.email, phone: "", location: "", marks: 0, skills: [], documents: [], transcripts: [] });
      } else {
        setProfile(snap.data());
      }
    });
    return () => unsub();
  }, [navigate]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen w-full text-white bg-gradient-to-b from-[#0a0a1a] via-[#0a0a2a] to-black">
      <aside className="fixed left-0 top-0 h-full w-72 px-6 pt-8 pb-6 border-r hidden md:block">
        <div className="mb-6">
          <div className="text-2xl font-bold text-white tracking-wide">Student Portal</div>
          <div className="text-sm text-gray-400">Dashboard</div>
        </div>

        <nav className="space-y-2">
          {["Dashboard", "Institutions", "Jobs", "Applications", "Profile"].map((sec) => (
            <Button
              key={sec}
              onClick={() => setActiveSection(sec)}
              variant={activeSection === sec ? "default" : "ghost"}
              className="w-full justify-start"
            >
              {sec}
            </Button>
          ))}

          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full mt-4"
          >
            Logout
          </Button>
        </nav>
      </aside>

      <main className="ml-0 md:ml-72 p-6 pb-24 relative z-10">
        <AnimatePresence mode="wait">
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
>>>>>>> ff4c85ce332f66869dbd202f5419ac366b5aa3b5
