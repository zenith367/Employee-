import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Legend } from "recharts";
import { auth, db } from "../services/firebase";
<<<<<<< HEAD
import { 
  collection, doc, query, where, getDocs, getDoc,
  addDoc, serverTimestamp 
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const ELECTRIC = "#3ee0ff";
const PURPLE = "#8b5cf6";
const BG = "#0b0f1a";

// Compute Qualification Score
const computeQualification = (app, job) => {
  let score = 0;

  if (app.academicScore >= job.minAcademicScore) score += 40;

  score += Math.min(app.experienceYears, job.minExperienceYears) * 10;

  score += app.certificates?.length * 10;

  let matches = 0;
  job.requirements.forEach(req => {
    if (app.skills?.includes(req)) matches++;
  });
=======
import {
  collection, doc, query, where, getDocs, getDoc,
  addDoc, setDoc, updateDoc, serverTimestamp, onSnapshot
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../components/ui/chart";

const TEAL = "#4fd1c5";
const ELECTRIC = "#3ee0ff";
const PURPLE = "#8b5cf6";

// Compute Qualification Score
const computeQualification = (student, job) => {
  let score = 0;

  // a. Academic performance (marks)
  if (student.marks >= job.marks) score += 40;

  // c. Work experience (assume experienceYears in profile, default 0)
  const experienceYears = student.experienceYears || 0;
  score += Math.min(experienceYears, job.minExperienceYears) * 10;

  // b. Extra certificates (documents length)
  score += (student.documents?.length || 0) * 10;

  // d. Relevance to job post (skills match)
  let matches = 0;
  if (job.skills && Array.isArray(job.skills)) {
    job.skills.forEach(req => {
      if (student.skills?.includes(req)) matches++;
    });
  }
>>>>>>> ff4c85ce332f66869dbd202f5419ac366b5aa3b5
  score += matches * 10;

  let status = "not_qualified";
  if (score >= 60) status = "qualified";
  if (score >= 80) status = "interview";

  return { score, status };
};

// Small Stats Card
const StatTile = ({ label, value }) => (
<<<<<<< HEAD
  <motion.div whileHover={{ y: -6 }} className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(62,224,255,0.04)]">
    <div className="text-sm text-gray-300">{label}</div>
    <div className="text-xl font-semibold text-white mt-2">{value}</div>
  </motion.div>
=======
  <Card className="bg-[rgba(255,255,255,0.02)] border-[rgba(62,224,255,0.04)]">
    <CardContent className="p-4">
      <div className="text-sm text-gray-300">{label}</div>
      <div className="text-xl font-semibold text-white mt-2">{value}</div>
    </CardContent>
  </Card>
>>>>>>> ff4c85ce332f66869dbd202f5419ac366b5aa3b5
);

const SectionPanel = ({ section, onBack, companyId }) => {
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(false);
<<<<<<< HEAD
=======
  const [editingProfile, setEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState({});
  const [reloadApplicants, setReloadApplicants] = useState(0);
>>>>>>> ff4c85ce332f66869dbd202f5419ac366b5aa3b5

  const [newJob, setNewJob] = useState({
    title: "",
    location: "",
    type: "",
    deadline: "",
<<<<<<< HEAD
    minAcademicScore: 60,
    minExperienceYears: 0,
    requirements: [],
=======
    marks: 60,
    minExperienceYears: 0,
    skills: [],
>>>>>>> ff4c85ce332f66869dbd202f5419ac366b5aa3b5
  });

  useEffect(() => {
    if (!companyId) return;

    const loadProfile = async () => {
      const ref = doc(db, "companies", companyId);
      const snap = await getDoc(ref);
      if (snap.exists()) setProfile(snap.data());
    };

    const loadJobs = async () => {
<<<<<<< HEAD
      const jobsRef = collection(db, `companies/${companyId}/jobs`);
      const data = await getDocs(jobsRef);
=======
      const q = query(collection(db, "jobs"), where("companyId", "==", companyId));
      const data = await getDocs(q);
>>>>>>> ff4c85ce332f66869dbd202f5419ac366b5aa3b5
      setJobs(data.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    const loadApplicants = async () => {
<<<<<<< HEAD
      const appRef = collection(db, `companies/${companyId}/applicants`);
      const data = await getDocs(appRef);

      const list = [];
      for (let docSnap of data.docs) {
        let app = docSnap.data();
        const jobRef = doc(db, `companies/${companyId}/jobs/${app.jobId}`);
        const jobSnap = await getDoc(jobRef);

        if (jobSnap.exists()) {
          const job = jobSnap.data();
          const { score, status } = computeQualification(app, job);
          list.push({
            ...app,
=======
      const q = query(collection(db, "registrations"), where("companyId", "==", companyId), where("type", "==", "job"));
      const data = await getDocs(q);

      const list = [];
      for (let regDoc of data.docs) {
        const reg = regDoc.data();
        const studentSnap = await getDoc(doc(db, "students", reg.studentId));
        const jobSnap = await getDoc(doc(db, "jobs", reg.jobId));

        if (studentSnap.exists() && jobSnap.exists()) {
          const student = studentSnap.data();
          const job = jobSnap.data();
          const { score, status } = computeQualification(student, job);
          list.push({
            ...reg,
            studentName: student.name,
>>>>>>> ff4c85ce332f66869dbd202f5419ac366b5aa3b5
            finalScore: score,
            status: status,
          });
        }
      }

      setApplicants(list);
    };

    loadProfile();
    loadJobs();
    loadApplicants();
<<<<<<< HEAD
  }, [companyId]);
=======
  }, [companyId, reloadApplicants]);
>>>>>>> ff4c85ce332f66869dbd202f5419ac366b5aa3b5

  const handleAddJob = async () => {
    if (!newJob.title || !newJob.location || !newJob.type || !newJob.deadline)
      return alert("All fields required");

    setLoading(true);
    try {
<<<<<<< HEAD
      await addDoc(collection(db, `companies/${companyId}/jobs`), {
        ...newJob,
=======
      await addDoc(collection(db, "jobs"), {
        ...newJob,
        companyId,
        companyName: profile.name,
>>>>>>> ff4c85ce332f66869dbd202f5419ac366b5aa3b5
        createdAt: serverTimestamp(),
      });

      alert("Job posted successfully!");
<<<<<<< HEAD
      setNewJob({ title: "", location: "", type: "", deadline: "", minAcademicScore: 60, minExperienceYears: 0, requirements: [] });
=======
      setNewJob({ title: "", location: "", type: "", deadline: "", marks: 60, minExperienceYears: 0, skills: [] });
>>>>>>> ff4c85ce332f66869dbd202f5419ac366b5aa3b5
    } catch (e) {
      console.error(e);
      alert("Failed to post job");
    }
    setLoading(false);
  };

<<<<<<< HEAD
=======
  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, "companies", companyId), tempProfile);
      setProfile(tempProfile);
      setEditingProfile(false);
      alert("Profile updated!");
    } catch (e) {
      console.error(e);
      alert("Failed to update profile");
    }
    setLoading(false);
  };

  const handleInvite = async (applicant) => {
    const interviewTime = prompt("Enter interview time (e.g., 10:00 AM):");
    if (!interviewTime) return;
    const interviewPlace = prompt("Enter interview place (e.g., Company Office, Room 101):");
    if (!interviewPlace) return;
    const interviewDate = prompt("Enter interview date (e.g., 2023-10-15):");
    if (!interviewDate) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "notifications"), {
        studentId: applicant.studentId,
        companyId,
        companyName: profile.name,
        jobId: applicant.jobId,
        jobTitle: applicant.jobTitle,
        type: "interview_invitation",
        message: `You have been invited for an interview for the position of ${applicant.jobTitle} at ${profile.name}. The interview is scheduled for ${interviewDate} at ${interviewTime} at ${interviewPlace}. Please bring hard copies of your documents and transcripts.`,
        createdAt: serverTimestamp(),
        read: false,
      });
      alert("Interview invitation sent!");
      setReloadApplicants(prev => prev + 1);
    } catch (e) {
      console.error(e);
      alert("Failed to send invitation");
    }
    setLoading(false);
  };

>>>>>>> ff4c85ce332f66869dbd202f5419ac366b5aa3b5
  const renderSection = () => {
    switch (section) {
      case "Dashboard":
        const areaData = [
          { name: "Jobs", count: jobs.length },
          { name: "Applicants", count: applicants.length },
        ];
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatTile label="Jobs Posted" value={jobs.length} />
              <StatTile label="Applicants" value={applicants.length} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<<<<<<< HEAD
              <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(62,224,255,0.04)]">
                <h3 className="text-xl font-semibold text-white mb-4">System Overview</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={areaData}>
                    <XAxis dataKey="name" stroke="gray" />
                    <YAxis stroke="gray" />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke={ELECTRIC} fill={ELECTRIC + "22"} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(62,224,255,0.04)]">
                <h3 className="text-xl font-semibold text-white mb-4">System Health</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={areaData}>
                    <XAxis dataKey="name" stroke="gray" />
                    <YAxis stroke="gray" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill={PURPLE} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
=======
              <Card className="bg-[rgba(255,255,255,0.02)] border-[rgba(62,224,255,0.04)]">
                <CardHeader>
                  <CardTitle className="text-white">System Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      count: {
                        label: "Count",
                        color: ELECTRIC,
                      },
                    }}
                    className="h-[200px]"
                  >
                    <AreaChart data={areaData}>
                      <XAxis dataKey="name" stroke="white" tick={{ fill: 'white' }} />
                      <YAxis stroke="white" tick={{ fill: 'white' }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area type="monotone" dataKey="count" stroke={ELECTRIC} fill={ELECTRIC + "22"} />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="bg-[rgba(255,255,255,0.02)] border-[rgba(62,224,255,0.04)]">
                <CardHeader>
                  <CardTitle className="text-white">System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      count: {
                        label: "Count",
                        color: PURPLE,
                      },
                    }}
                    className="h-[200px]"
                  >
                    <BarChart data={areaData}>
                      <XAxis dataKey="name" stroke="white" tick={{ fill: 'white' }} />
                      <YAxis stroke="white" tick={{ fill: 'white' }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="count" fill={PURPLE} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
>>>>>>> ff4c85ce332f66869dbd202f5419ac366b5aa3b5
            </div>
          </div>
        );

      // POST JOB
      case "Post Job":
        return (
          <div className="rounded-2xl p-6 bg-[rgba(255,255,255,0.02)] border border-[rgba(62,224,255,0.04)] max-w-lg">
            <h3 className="text-xl font-semibold text-white mb-4">Post New Job</h3>

            <div className="grid grid-cols-1 gap-3">
              <input placeholder="Job Title" value={newJob.title} onChange={(e)=>setNewJob({...newJob,title:e.target.value})} className="p-3 rounded bg-[rgba(255,255,255,0.01)] border text-white" />
              <input placeholder="Location" value={newJob.location} onChange={(e)=>setNewJob({...newJob,location:e.target.value})} className="p-3 rounded bg-[rgba(255,255,255,0.01)] border text-white" />

              <select
  value={newJob.type}
  onChange={(e)=>setNewJob({...newJob,type:e.target.value})}
  className="p-3 rounded bg-[rgba(255,255,255,0.01)] border text-white"
>
  <option value="" className="text-black">Select Type</option>
  <option value="Frontend Developer" className="text-black">Frontend Developer</option>
  <option value="Backend Developer" className="text-black">Backend Developer</option>
  <option value="UI/UX Designer" className="text-black">UI/UX Designer</option>
  <option value="Full Stack Developer" className="text-black">Full Stack Developer</option>
</select>

              <input type="date" value={newJob.deadline} onChange={(e)=>setNewJob({...newJob,deadline:e.target.value})} className="p-3 rounded bg-[rgba(255,255,255,0.01)] border text-white" />

<<<<<<< HEAD
              <input type="number" placeholder="Minimum Academic Score" value={newJob.minAcademicScore} onChange={(e)=>setNewJob({...newJob,minAcademicScore:Number(e.target.value)})} className="p-3 rounded bg-[rgba(255,255,255,0.01)] border text-white" />

              <input type="number" placeholder="Minimum Experience (Years)" value={newJob.minExperienceYears} onChange={(e)=>setNewJob({...newJob,minExperienceYears:Number(e.target.value)})} className="p-3 rounded bg-[rgba(255,255,255,0.01)] border text-white" />

              <textarea placeholder="Job Requirements (comma separated)" onChange={(e)=>setNewJob({...newJob,requirements:e.target.value.split(",")})} className="p-3 rounded bg-[rgba(255,255,255,0.01)] border text-white"></textarea>
            </div>

            <div className="mt-4 flex gap-3">
              <button onClick={handleAddJob} disabled={loading} className="px-4 py-2 rounded bg-gradient-to-r from-[#5eead4] to-[#06b6d4] text-black font-semibold">
                {loading ? "Posting..." : "Post Job"}
              </button>
              <button onClick={onBack} className="px-4 py-2 rounded bg-[rgba(255,255,255,0.02)] border">Cancel</button>
=======
              <input type="number" placeholder="Minimum Marks" value={newJob.marks} onChange={(e)=>setNewJob({...newJob,marks:Number(e.target.value)})} className="p-3 rounded bg-[rgba(255,255,255,0.01)] border text-white" />

              <input type="number" placeholder="Minimum Experience (Years)" value={newJob.minExperienceYears} onChange={(e)=>setNewJob({...newJob,minExperienceYears:Number(e.target.value)})} className="p-3 rounded bg-[rgba(255,255,255,0.01)] border text-white" />

              <textarea placeholder="Skills Required (comma separated)" onChange={(e)=>setNewJob({...newJob,skills:e.target.value.split(",").map(s=>s.trim()).filter(s=>s)})} className="p-3 rounded bg-[rgba(255,255,255,0.01)] border text-white"></textarea>
            </div>

            <div className="mt-4 flex gap-3">
              <Button onClick={handleAddJob} disabled={loading} className="bg-gradient-to-r from-[#5eead4] to-[#06b6d4] text-black font-semibold">
                {loading ? "Posting..." : "Post Job"}
              </Button>
              <Button onClick={onBack} variant="ghost">Cancel</Button>
>>>>>>> ff4c85ce332f66869dbd202f5419ac366b5aa3b5
            </div>
          </div>
        );

      // APPLICANTS
      case "Applicants":
        return (
          <div className="rounded-2xl p-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(62,224,255,0.04)] overflow-x-auto">
            <h3 className="text-xl font-semibold text-white mb-4">Applicants</h3>

            <table className="min-w-full text-left divide-y divide-[rgba(255,255,255,0.04)]">
              <thead>
                <tr className="text-sm text-gray-400">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Job Applied</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Applied On</th>
                </tr>
              </thead>

              <tbody className="text-white">
<<<<<<< HEAD
                {applicants.map((a,i)=>(
=======
                {applicants.filter(a => a.status === "qualified" || a.status === "interview").map((a,i)=>(
>>>>>>> ff4c85ce332f66869dbd202f5419ac366b5aa3b5
                  <tr key={i} className="hover:bg-[rgba(255,255,255,0.01)]">
                    <td className="py-3 px-4">{a.studentName}</td>
                    <td className="py-3 px-4">{a.jobTitle}</td>
                    <td className="py-3 px-4">{a.finalScore}</td>

                    <td className="py-3 px-4">
<<<<<<< HEAD
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold 
=======
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold
>>>>>>> ff4c85ce332f66869dbd202f5419ac366b5aa3b5
                        ${a.status==="qualified"
                          ? "bg-[rgba(62,224,255,0.08)] text-[rgba(62,224,255,0.9)]"
                          : a.status==="interview"
                          ? "bg-green-600/20 text-green-400"
                          : "bg-[rgba(255,255,255,0.02)] text-gray-300"
                        }`}>
                        {a.status}
                      </span>
<<<<<<< HEAD
                    </td>

                    <td className="py-3 px-4">{a.appliedAt}</td>
=======
                      {a.status === "qualified" && (
                        <Button
                          onClick={() => handleInvite(a)}
                          size="sm"
                          className="ml-2"
                        >
                          Invite
                        </Button>
                      )}
                    </td>

                    <td className="py-3 px-4">{a.createdAt?.toDate().toLocaleDateString()}</td>
>>>>>>> ff4c85ce332f66869dbd202f5419ac366b5aa3b5
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "Profile":
<<<<<<< HEAD
        return (
          <div className="rounded-2xl p-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(62,224,255,0.04)]">
            <h3 className="text-xl font-semibold text-white mb-4">Company Profile</h3>
            <div className="text-white font-semibold text-lg">{profile.name}</div>
            <div className="text-gray-400 text-sm">{profile.email} · {profile.location}</div>
          </div>
        );
=======
        if (editingProfile) {
          return (
            <Card className="bg-[rgba(255,255,255,0.02)] border-[rgba(62,224,255,0.04)]">
              <CardHeader>
                <CardTitle className="text-white">Edit Company Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <input value={tempProfile.name || ""} onChange={e=>setTempProfile({...tempProfile, name:e.target.value})} className="p-3 rounded bg-[rgba(255,255,255,0.01)] border text-white mb-2 w-full" placeholder="Company Name" />
                <input value={tempProfile.email || ""} onChange={e=>setTempProfile({...tempProfile, email:e.target.value})} className="p-3 rounded bg-[rgba(255,255,255,0.01)] border text-white mb-2 w-full" placeholder="Email" />
                <input value={tempProfile.location || ""} onChange={e=>setTempProfile({...tempProfile, location:e.target.value})} className="p-3 rounded bg-[rgba(255,255,255,0.01)] border text-white mb-2 w-full" placeholder="Location" />
                <div className="flex gap-2 mt-4">
                  <Button onClick={handleUpdateProfile} disabled={loading} className="bg-gradient-to-r from-[#5eead4] to-[#06b6d4] text-black font-semibold">
                    {loading ? "Updating..." : "Update"}
                  </Button>
                  <Button onClick={() => setEditingProfile(false)} variant="ghost">Cancel</Button>
                </div>
              </CardContent>
            </Card>
          );
        } else {
          return (
            <Card className="bg-[rgba(255,255,255,0.02)] border-[rgba(62,224,255,0.04)]">
              <CardHeader>
                <CardTitle className="text-white">Company Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-white font-semibold text-lg">{profile.name}</div>
                <div className="text-gray-400 text-sm">{profile.email} · {profile.location}</div>
                <Button onClick={() => { setEditingProfile(true); setTempProfile({...profile}); }} className="mt-4 bg-gradient-to-r from-[#5eead4] to-[#06b6d4] text-black font-semibold">Edit Profile</Button>
              </CardContent>
            </Card>
          );
        }
>>>>>>> ff4c85ce332f66869dbd202f5419ac366b5aa3b5

      default:
        return null;
    }
  };

  return (
    <motion.div layout initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:8 }} className="w-full">
      {section !== "Dashboard" && (
        <div className="mb-4 flex items-center gap-4">
<<<<<<< HEAD
          <button onClick={onBack} className="px-3 py-2 rounded-lg bg-[rgba(139,92,246,0.08)] text-[rgba(62,224,255,0.9)]">← Back</button>
=======
          <Button onClick={onBack} variant="ghost" className="px-3 py-2">← Back</Button>
>>>>>>> ff4c85ce332f66869dbd202f5419ac366b5aa3b5
          <h2 className="text-2xl font-semibold text-white">{section}</h2>
        </div>
      )}
      {renderSection()}
    </motion.div>
  );
};

// Main Component
export default function CompanyDashboard() {
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [companyId, setCompanyId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
<<<<<<< HEAD
    const user = auth.currentUser;
    if (user) setCompanyId(user.uid);
    else navigate("/login");
=======
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) return navigate("/login");
      if (!u.emailVerified) return navigate("/verify-email");

      // Query to find the company document by firebaseUid
      const q = query(collection(db, "companies"), where("firebaseUid", "==", u.uid));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        const companyDoc = querySnap.docs[0];
        setCompanyId(companyDoc.id); // Set to document ID
        setProfile(companyDoc.data());
      } else {
        // If no document, create one (though it should exist after registration)
        const newDocRef = await addDoc(collection(db, "companies"), {
          name: u.displayName || "",
          email: u.email,
          location: "",
          firebaseUid: u.uid,
          status: "pending",
          createdAt: serverTimestamp(),
        });
        setCompanyId(newDocRef.id);
        setProfile({ name: u.displayName || "", email: u.email, location: "" });
      }
    });
    return () => unsub();
>>>>>>> ff4c85ce332f66869dbd202f5419ac366b5aa3b5
  }, [navigate]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen w-full text-white" style={{ background: BG }}>
=======
    <div className="min-h-screen w-full text-white bg-gradient-to-b from-[#0a0a1a] via-[#0a0a2a] to-black">
>>>>>>> ff4c85ce332f66869dbd202f5419ac366b5aa3b5
      <aside className="fixed left-0 top-0 h-full w-72 px-6 pt-8 pb-6 border-r hidden md:block">
        <div className="mb-6">
          <div className="text-2xl font-bold text-white tracking-wide">Company Portal</div>
          <div className="text-sm text-gray-400">Employer Dashboard</div>
        </div>

        <nav className="space-y-2">
          {["Dashboard","Post Job","Applicants","Profile"].map(sec => (
<<<<<<< HEAD
            <button key={sec} onClick={()=>setActiveSection(sec)} className={`w-full text-left px-3 py-2 rounded-lg ${activeSection===sec?"bg-[rgba(62,224,255,0.04)]":"hover:bg-[rgba(255,255,255,0.02)]"}`}>
              {sec}
            </button>
          ))}

          <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 mt-4">Logout</button>
=======
            <Button key={sec} onClick={()=>setActiveSection(sec)} variant={activeSection===sec?"secondary":"ghost"} className="w-full justify-start">
              {sec}
            </Button>
          ))}

          <Button onClick={handleLogout} variant="destructive" className="w-full mt-4">Logout</Button>
>>>>>>> ff4c85ce332f66869dbd202f5419ac366b5aa3b5
        </nav>
      </aside>

      <main className="ml-0 md:ml-72 p-6 pb-24 relative z-10">
        <AnimatePresence exitBeforeEnter>
          <SectionPanel key={activeSection} section={activeSection} onBack={()=>setActiveSection("Dashboard")} companyId={companyId} />
        </AnimatePresence>
      </main>
    </div>
  );
}
