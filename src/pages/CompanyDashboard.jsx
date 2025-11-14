import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Legend } from "recharts";
import { auth, db } from "../services/firebase";
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
  score += matches * 10;

  let status = "not_qualified";
  if (score >= 60) status = "qualified";
  if (score >= 80) status = "interview";

  return { score, status };
};

// Small Stats Card
const StatTile = ({ label, value }) => (
  <motion.div whileHover={{ y: -6 }} className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(62,224,255,0.04)]">
    <div className="text-sm text-gray-300">{label}</div>
    <div className="text-xl font-semibold text-white mt-2">{value}</div>
  </motion.div>
);

const SectionPanel = ({ section, onBack, companyId }) => {
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(false);

  const [newJob, setNewJob] = useState({
    title: "",
    location: "",
    type: "",
    deadline: "",
    minAcademicScore: 60,
    minExperienceYears: 0,
    requirements: [],
  });

  useEffect(() => {
    if (!companyId) return;

    const loadProfile = async () => {
      const ref = doc(db, "companies", companyId);
      const snap = await getDoc(ref);
      if (snap.exists()) setProfile(snap.data());
    };

    const loadJobs = async () => {
      const jobsRef = collection(db, `companies/${companyId}/jobs`);
      const data = await getDocs(jobsRef);
      setJobs(data.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    const loadApplicants = async () => {
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
  }, [companyId]);

  const handleAddJob = async () => {
    if (!newJob.title || !newJob.location || !newJob.type || !newJob.deadline)
      return alert("All fields required");

    setLoading(true);
    try {
      await addDoc(collection(db, `companies/${companyId}/jobs`), {
        ...newJob,
        createdAt: serverTimestamp(),
      });

      alert("Job posted successfully!");
      setNewJob({ title: "", location: "", type: "", deadline: "", minAcademicScore: 60, minExperienceYears: 0, requirements: [] });
    } catch (e) {
      console.error(e);
      alert("Failed to post job");
    }
    setLoading(false);
  };

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

              <input type="number" placeholder="Minimum Academic Score" value={newJob.minAcademicScore} onChange={(e)=>setNewJob({...newJob,minAcademicScore:Number(e.target.value)})} className="p-3 rounded bg-[rgba(255,255,255,0.01)] border text-white" />

              <input type="number" placeholder="Minimum Experience (Years)" value={newJob.minExperienceYears} onChange={(e)=>setNewJob({...newJob,minExperienceYears:Number(e.target.value)})} className="p-3 rounded bg-[rgba(255,255,255,0.01)] border text-white" />

              <textarea placeholder="Job Requirements (comma separated)" onChange={(e)=>setNewJob({...newJob,requirements:e.target.value.split(",")})} className="p-3 rounded bg-[rgba(255,255,255,0.01)] border text-white"></textarea>
            </div>

            <div className="mt-4 flex gap-3">
              <button onClick={handleAddJob} disabled={loading} className="px-4 py-2 rounded bg-gradient-to-r from-[#5eead4] to-[#06b6d4] text-black font-semibold">
                {loading ? "Posting..." : "Post Job"}
              </button>
              <button onClick={onBack} className="px-4 py-2 rounded bg-[rgba(255,255,255,0.02)] border">Cancel</button>
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
                {applicants.map((a,i)=>(
                  <tr key={i} className="hover:bg-[rgba(255,255,255,0.01)]">
                    <td className="py-3 px-4">{a.studentName}</td>
                    <td className="py-3 px-4">{a.jobTitle}</td>
                    <td className="py-3 px-4">{a.finalScore}</td>

                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold 
                        ${a.status==="qualified"
                          ? "bg-[rgba(62,224,255,0.08)] text-[rgba(62,224,255,0.9)]"
                          : a.status==="interview"
                          ? "bg-green-600/20 text-green-400"
                          : "bg-[rgba(255,255,255,0.02)] text-gray-300"
                        }`}>
                        {a.status}
                      </span>
                    </td>

                    <td className="py-3 px-4">{a.appliedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "Profile":
        return (
          <div className="rounded-2xl p-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(62,224,255,0.04)]">
            <h3 className="text-xl font-semibold text-white mb-4">Company Profile</h3>
            <div className="text-white font-semibold text-lg">{profile.name}</div>
            <div className="text-gray-400 text-sm">{profile.email} · {profile.location}</div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div layout initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:8 }} className="w-full">
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

// Main Component
export default function CompanyDashboard() {
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [companyId, setCompanyId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) setCompanyId(user.uid);
    else navigate("/login");
  }, [navigate]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen w-full text-white" style={{ background: BG }}>
      <aside className="fixed left-0 top-0 h-full w-72 px-6 pt-8 pb-6 border-r hidden md:block">
        <div className="mb-6">
          <div className="text-2xl font-bold text-white tracking-wide">Company Portal</div>
          <div className="text-sm text-gray-400">Employer Dashboard</div>
        </div>

        <nav className="space-y-2">
          {["Dashboard","Post Job","Applicants","Profile"].map(sec => (
            <button key={sec} onClick={()=>setActiveSection(sec)} className={`w-full text-left px-3 py-2 rounded-lg ${activeSection===sec?"bg-[rgba(62,224,255,0.04)]":"hover:bg-[rgba(255,255,255,0.02)]"}`}>
              {sec}
            </button>
          ))}

          <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 mt-4">Logout</button>
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
