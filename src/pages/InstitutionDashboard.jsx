<<<<<<< HEAD
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
=======
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Legend } from "recharts";
import { auth, db } from "../services/firebase";
import {
  collection, doc, query, where, getDocs, getDoc,
  addDoc, setDoc, updateDoc, serverTimestamp, orderBy
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

const ELECTRIC = "#3ee0ff";
const PURPLE = "#8b5cf6";
const BG = "#0b0f1a";

// Small Stats Card
const StatTile = ({ label, value }) => (
  <motion.div whileHover={{ y: -6 }} className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(62,224,255,0.04)]">
    <div className="text-sm text-gray-300">{label}</div>
    <div className="text-xl font-semibold text-white mt-2">{value}</div>
  </motion.div>
);

const SectionPanel = ({ section, onBack, institutionId }) => {
  const [profile, setProfile] = useState({});
  const [faculties, setFaculties] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [newFaculty, setNewFaculty] = useState({ name: "" });
  const [newCourse, setNewCourse] = useState({ name: "", facultyId: "", requiredSubjects: "", minMarks: 0 });

  // Load live Firestore data
  useEffect(() => {
    if (!institutionId) return;

    const loadProfile = async () => {
      const ref = doc(db, "institutions", institutionId);
      const snap = await getDoc(ref);
      if (snap.exists()) setProfile(snap.data());
    };

    const loadFaculties = async () => {
      const q = query(collection(db, "faculties"), where("institutionId", "==", institutionId));
      const data = await getDocs(q);
      setFaculties(data.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    const loadCourses = async () => {
      const q = query(collection(db, "courses"), where("institutionId", "==", institutionId));
      const data = await getDocs(q);
      setCourses(data.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    const loadStudents = async () => {
      const q = query(collection(db, "registrations"), where("institutionId", "==", institutionId), orderBy("createdAt", "asc"));
      const data = await getDocs(q);
      let regs = data.docs.map(d => ({ id: d.id, ...d.data() }));

      // Validate student application limits: each student can apply for only 2 courses per institution
      const studentApps = {};
      regs.forEach(reg => {
        if (!studentApps[reg.studentId]) studentApps[reg.studentId] = [];
        studentApps[reg.studentId].push(reg);
      });
      for (const studentId in studentApps) {
        const apps = studentApps[studentId];
        if (apps.length > 2) {
          // Reject extra applications
          for (let i = 2; i < apps.length; i++) {
            if (apps[i].status !== "rejected") {
              await updateDoc(doc(db, "registrations", apps[i].id), { status: "rejected" });
              apps[i].status = "rejected";
            }
          }
        }
      }

      setStudents(regs);
    };

    loadProfile();
    loadFaculties();
    loadCourses();
    loadStudents();
  }, [institutionId]);

  const handleAddFaculty = async () => {
    if (!newFaculty.name) return alert("Faculty name required");
    setLoading(true);
    try {
      // Check for duplicate faculty name under the same institution
      const q = query(collection(db, "faculties"), where("institutionId", "==", institutionId), where("name", "==", newFaculty.name));
      const existing = await getDocs(q);
      if (!existing.empty) {
        alert("Faculty name already exists");
        setLoading(false);
        return;
      }
      await addDoc(collection(db, "faculties"), { ...newFaculty, institutionId, createdAt: serverTimestamp() });
      setNewFaculty({ name: "" });
    } catch (e) { console.error(e); alert("Failed to add faculty"); }
    setLoading(false);
  };

  const handleAddCourse = async () => {
    if (!newCourse.name || !newCourse.facultyId) return alert("Course name and faculty required");
    setLoading(true);
    try {
      // Check for duplicate course name under the same faculty and institution
      const q = query(collection(db, "courses"), where("institutionId", "==", institutionId), where("facultyId", "==", newCourse.facultyId), where("name", "==", newCourse.name));
      const existing = await getDocs(q);
      if (!existing.empty) {
        alert("Course name already exists under this faculty");
        setLoading(false);
        return;
      }
      const requiredSubjects = newCourse.requiredSubjects.split(',').map(s => s.trim()).filter(s => s);
      await addDoc(collection(db, "courses"), { ...newCourse, requiredSubjects, institutionId, createdAt: serverTimestamp() });
      setNewCourse({ name: "", facultyId: "", requiredSubjects: "", minMarks: 0 });
    } catch (e) { console.error(e); alert("Failed to add course"); }
    setLoading(false);
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, "institutions", institutionId), profile);
      alert("Profile updated!");
    } catch (e) { console.error(e); alert("Failed to update profile"); }
    setLoading(false);
  };

  const handleStudentStatusChange = async (student, status) => {
    setLoading(true);
    try {
      // Check if admissions are published
      const instRef = doc(db, "institutions", institutionId);
      const instSnap = await getDoc(instRef);
      const instData = instSnap.data();
      if (instData.published && status !== "admitted") {
        alert("Admissions are published. Cannot change status from admitted.");
        setLoading(false);
        return;
      }

      // Update this student's status
      await updateDoc(doc(db, "registrations", student.id), { status });

      if (status === "admitted") {
        // Remove student from other institution programs
        const q = query(collection(db, "registrations"), where("studentId", "==", student.studentId), where("institutionId", "!=", institutionId));
        const otherRegs = await getDocs(q);
        for (let regDoc of otherRegs.docs) {
          await updateDoc(doc(db, "registrations", regDoc.id), { status: "removed" });

          // Promote waiting list in other institution
          const waitListQuery = query(collection(db, "registrations"), where("courseId", "==", regDoc.data().courseId), where("status", "==", "waiting"));
          const waitListSnap = await getDocs(waitListQuery);
          if (!waitListSnap.empty) {
            const firstWaiter = waitListSnap.docs[0];
            await updateDoc(doc(db, "registrations", firstWaiter.id), { status: "pending" });
          }
        }
      }

      if (status === "rejected" || status === "removed") {
        // Promote waiting list in this institution for the course
        const waitListQuery = query(collection(db, "registrations"), where("courseId", "==", student.courseId), where("institutionId", "==", institutionId), where("status", "==", "waiting"), orderBy("createdAt", "asc"));
        const waitListSnap = await getDocs(waitListQuery);
        if (!waitListSnap.empty) {
          const firstWaiter = waitListSnap.docs[0];
          await updateDoc(doc(db, "registrations", firstWaiter.id), { status: "pending" });
        }
      }

      // Refresh students list
      const q = query(collection(db, "registrations"), where("institutionId", "==", institutionId));
      const data = await getDocs(q);
      setStudents(data.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); alert("Failed to update student"); }
    setLoading(false);
  };

  const handlePublishAdmissions = async () => {
    if (!confirm("Are you sure you want to publish admissions? This action cannot be undone.")) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "institutions", institutionId), { published: true, publishedAt: serverTimestamp() });
      alert("Admissions published successfully!");
    } catch (e) { console.error(e); alert("Failed to publish admissions"); }
    setLoading(false);
  };

  const renderSection = () => {
    switch (section) {
      case "Dashboard":
        const areaData = [
          { name: "Faculties", count: faculties.length },
          { name: "Courses", count: courses.length },
          { name: "Students", count: students.length },
        ];
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatTile label="Faculties" value={faculties.length} />
              <StatTile label="Courses" value={courses.length} />
              <StatTile label="Students" value={students.length} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(62,224,255,0.04)]">
                <h3 className="text-xl font-semibold text-white mb-4">System Overview</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={areaData}>
                    <XAxis dataKey="name" stroke="white" tick={{ fill: 'white' }} />
                    <YAxis stroke="white" tick={{ fill: 'white' }} />
>>>>>>> ff4c85ce332f66869dbd202f5419ac366b5aa3b5
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke={ELECTRIC} fill={ELECTRIC + "22"} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
<<<<<<< HEAD

              <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(62,224,255,0.04)]">
                <h3 className="text-xl font-semibold text-white mb-4">System Health</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" stroke="gray" />
                    <YAxis stroke="gray" />
=======
              <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(62,224,255,0.04)]">
                <h3 className="text-xl font-semibold text-white mb-4">System Health</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={areaData}>
                    <XAxis dataKey="name" stroke="white" tick={{ fill: 'white' }} />
                    <YAxis stroke="white" tick={{ fill: 'white' }} />
>>>>>>> ff4c85ce332f66869dbd202f5419ac366b5aa3b5
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill={PURPLE} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );

<<<<<<< HEAD
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
=======
      case "Faculties":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Manage Faculties</h3>
            <div className="flex gap-2">
              <input placeholder="Faculty Name" value={newFaculty.name} onChange={e=>setNewFaculty({name:e.target.value})} className="p-2 rounded bg-[rgba(255,255,255,0.01)] border text-white" />
              <button onClick={handleAddFaculty} className="px-3 py-1 bg-gradient-to-r from-[#5eead4] to-[#06b6d4] rounded font-semibold">Add</button>
            </div>
            <ul>
              {faculties.map(f => <li key={f.id} className="text-white">{f.name}</li>)}
            </ul>
          </div>
        );

      case "Courses":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Manage Courses</h3>
            <div className="flex gap-2 flex-wrap">
              <input placeholder="Course Name" value={newCourse.name} onChange={e=>setNewCourse({...newCourse, name:e.target.value})} className="p-2 rounded bg-[rgba(255,255,255,0.01)] border text-white" />
              <select value={newCourse.facultyId} onChange={e=>setNewCourse({...newCourse, facultyId:e.target.value})} className="p-2 rounded bg-[rgba(255,255,255,0.01)] border text-white">
                <option value="">Select Faculty</option>
                {faculties.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
              <input placeholder="Required Subjects (comma separated)" value={newCourse.requiredSubjects} onChange={e=>setNewCourse({...newCourse, requiredSubjects:e.target.value})} className="p-2 rounded bg-[rgba(255,255,255,0.01)] border text-white" />
              <input placeholder="Min Marks" type="number" value={newCourse.minMarks} onChange={e=>setNewCourse({...newCourse, minMarks:parseFloat(e.target.value) || 0})} className="p-2 rounded bg-[rgba(255,255,255,0.01)] border text-white" />
              <button onClick={handleAddCourse} className="px-3 py-1 bg-gradient-to-r from-[#5eead4] to-[#06b6d4] rounded font-semibold">Add</button>
            </div>
            <ul>
              {courses.map(c => {
                const faculty = faculties.find(f=>f.id===c.facultyId);
                return <li key={c.id} className="text-white">{c.name} ({faculty?.name || "No faculty"}) - Req: {c.requiredSubjects?.join(', ') || 'None'}, Min Marks: {c.minMarks || 0}</li>;
              })}
            </ul>
          </div>
        );

      case "Students":
        return (
          <div className="overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Student Applications</h3>
              {!profile.published && (
                <button onClick={handlePublishAdmissions} className="px-4 py-2 bg-gradient-to-r from-[#5eead4] to-[#06b6d4] rounded font-semibold">
                  Publish Admissions
                </button>
              )}
              {profile.published && (
                <span className="text-green-400 font-semibold">Admissions Published</span>
              )}
            </div>
            <table className="min-w-full text-left divide-y divide-[rgba(255,255,255,0.04)]">
              <thead>
                <tr className="text-sm text-gray-400">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="text-white">
                {students.map(s => {
                  const course = courses.find(c=>c.id===s.courseId);
                  return (
                    <tr key={s.id} className="hover:bg-[rgba(255,255,255,0.01)]">
                      <td className="py-3 px-4">{s.studentName}</td>
                      <td className="py-3 px-4">{course?.name || "N/A"}</td>
                      <td className="py-3 px-4">{s.status}</td>
                      <td className="py-3 px-4 flex gap-2">
                        <button onClick={()=>handleStudentStatusChange(s, "admitted")} className="px-2 py-1 bg-green-600 rounded">Admit</button>
                        <button onClick={()=>handleStudentStatusChange(s, "rejected")} className="px-2 py-1 bg-red-600 rounded">Reject</button>
                        <button onClick={()=>handleStudentStatusChange(s, "pending")} className="px-2 py-1 bg-yellow-600 rounded">Pending</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
>>>>>>> ff4c85ce332f66869dbd202f5419ac366b5aa3b5
          </div>
        );

      case "Profile":
        return (
<<<<<<< HEAD
          <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(62,224,255,0.04)]">
            <h3 className="text-xl font-semibold text-white mb-4">Profile</h3>
            <div className="text-white font-semibold text-lg">{profile.name || "Student Name"}</div>
            <div className="text-gray-400 mt-1">{profile.email || user.email}</div>
=======
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Institution Profile</h3>
            <input value={profile.name || ""} onChange={e=>setProfile({...profile, name:e.target.value})} className="p-2 rounded bg-[rgba(255,255,255,0.01)] border text-white" placeholder="Institution Name" />
            <input value={profile.email || ""} onChange={e=>setProfile({...profile, email:e.target.value})} className="p-2 rounded bg-[rgba(255,255,255,0.01)] border text-white" placeholder="Email" />
            <input value={profile.location || ""} onChange={e=>setProfile({...profile, location:e.target.value})} className="p-2 rounded bg-[rgba(255,255,255,0.01)] border text-white" placeholder="Location" />
            <button onClick={handleUpdateProfile} className="px-4 py-2 bg-gradient-to-r from-[#5eead4] to-[#06b6d4] rounded font-semibold">{loading?"Updating...":"Update Profile"}</button>
>>>>>>> ff4c85ce332f66869dbd202f5419ac366b5aa3b5
          </div>
        );

      default:
        return null;
    }
  };

  return (
<<<<<<< HEAD
    <motion.div layout initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:8 }}>
      {section !== "Dashboard" && (
        <div className="mb-4 flex items-center gap-4">
          <button onClick={onBack} className="px-3 py-2 rounded-lg bg-[rgba(139,92,246,0.08)] text-[rgba(62,224,255,0.9)]">← Back</button>
=======
    <motion.div layout initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:8 }} className="w-full">
      {section !== "Dashboard" && (
        <div className="mb-4 flex items-center gap-4">
          <Button onClick={onBack} variant="ghost" className="px-3 py-2">← Back</Button>
>>>>>>> ff4c85ce332f66869dbd202f5419ac366b5aa3b5
          <h2 className="text-2xl font-semibold text-white">{section}</h2>
        </div>
      )}
      {renderSection()}
    </motion.div>
  );
};

<<<<<<< HEAD
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
=======
// Main Component
export default function InstitutionDashboard() {
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [institutionId, setInstitutionId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      // Fetch institution document where firebaseUid matches user's uid
      const fetchInstitutionId = async () => {
        const q = query(collection(db, "institutions"), where("firebaseUid", "==", user.uid));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setInstitutionId(snap.docs[0].id);
        } else {
          alert("Institution not found. Please ensure your registration is approved by admin.");
          navigate("/login");
        }
      };
      fetchInstitutionId();
    } else {
      navigate("/login");
    }
>>>>>>> ff4c85ce332f66869dbd202f5419ac366b5aa3b5
  }, [navigate]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

<<<<<<< HEAD
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
=======
  const sections = ["Dashboard","Faculties","Courses","Students","Profile"];

  return (
    <div className="min-h-screen w-full text-white bg-gradient-to-b from-[#0a0a1a] via-[#0a0a2a] to-black">
      <aside className="fixed left-0 top-0 h-full w-72 px-6 pt-8 pb-6 border-r hidden md:block">
        <div className="mb-6">
          <div className="text-2xl font-bold text-white tracking-wide">Institution Portal</div>
          <div className="text-sm text-gray-400">Admin Dashboard</div>
        </div>
        <nav className="space-y-2">
          {sections.map(sec => (
            <button key={sec} onClick={()=>setActiveSection(sec)} className={`w-full text-left px-3 py-2 rounded-lg ${activeSection===sec?"bg-[rgba(62,224,255,0.04)]":"hover:bg-[rgba(255,255,255,0.02)]"}`}>
              {sec}
            </button>
          ))}
          <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 mt-4">Logout</button>
        </nav>
      </aside>
      <main className="ml-0 md:ml-72 p-6 pb-24 relative z-10">
        <AnimatePresence exitBeforeEnter>
          <SectionPanel key={activeSection} section={activeSection} onBack={()=>setActiveSection("Dashboard")} institutionId={institutionId} />
>>>>>>> ff4c85ce332f66869dbd202f5419ac366b5aa3b5
        </AnimatePresence>
      </main>
    </div>
  );
}
