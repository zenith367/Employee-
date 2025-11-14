import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { auth, db } from "../services/firebase";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

const TEAL = "#4fd1c5";
const BG = "#06060a";

// Globe background component
const GlobeBG = () => (
  <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    <svg
      viewBox="0 0 900 900"
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vmin] opacity-30"
      style={{ filter: "blur(20px)" }}
    >
      <defs>
        <radialGradient id="rb" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#04111a" />
          <stop offset="100%" stopColor="#001012" />
        </radialGradient>
        <linearGradient id="lg" x1="0%" x2="100%">
          <stop offset="0%" stopColor="#07282b" />
          <stop offset="100%" stopColor={TEAL} />
        </linearGradient>
      </defs>

      <g
        style={{
          transformOrigin: "50% 50%",
          animation: "globe-rotate 45s linear infinite",
        }}
      >
        <circle
          cx="450"
          cy="450"
          r="330"
          fill="url(#rb)"
          stroke="rgba(79,209,197,0.04)"
          strokeWidth="1"
        />
        {[...Array(10)].map((_, i) => (
          <ellipse
            key={i}
            cx="450"
            cy="450"
            rx={300 - i * 28}
            ry={(300 - i * 28) * (0.34 + (i % 2) * 0.02)}
            fill="none"
            stroke="rgba(79,209,197,0.03)"
            strokeWidth="1"
          />
        ))}
        {[...Array(20)].map((_, i) => {
          const ang = (i / 20) * Math.PI * 2;
          const x = 450 + Math.cos(ang) * 260;
          const y = 450 + Math.sin(ang) * 110;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={3}
              fill={i % 2 ? TEAL : "#00b5d8"}
              opacity={0.9}
            />
          );
        })}
        <circle
          cx="450"
          cy="450"
          r="340"
          fill="none"
          stroke="url(#lg)"
          strokeWidth="2"
          opacity="0.05"
        />
      </g>
    </svg>

    <style>{`
      @keyframes globe-rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Sidebar component
const Sidebar = ({ active, setActive, logout }) => {
  const nav = [
    { key: "Overview", label: "Dashboard" },
    { key: "Institutions", label: "Institutions" },
    { key: "Faculties", label: "Faculties" },
    { key: "Courses", label: "Courses" },
    { key: "Companies", label: "Companies" },
    { key: "Students", label: "Students" },
    { key: "Admissions", label: "Admissions" },
  ];

  return (
    <aside className="w-72 min-h-screen px-6 pt-8 pb-6 bg-[rgba(0,0,0,0.3)] border-r border-[rgba(255,255,255,0.02)] fixed left-0 top-0">
      <div className="mb-8">
        <div className="text-white text-2xl font-bold">Admin Console</div>
        <div className="text-gray-400 text-sm">Faculty of ICT</div>
      </div>

      <nav className="space-y-2">
        {nav.map((n) => (
          <button
            key={n.key}
            onClick={() => setActive(n.key)}
            className={`w-full px-3 py-2 rounded-lg text-left ${
              active === n.key ? "bg-[rgba(79,209,197,0.06)]" : "hover:bg-[rgba(255,255,255,0.03)]"
            }`}
          >
            <span className="text-sm text-white">{n.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-10 text-gray-300 text-sm">
        <div>Logged in as</div>
        <div className="text-white font-semibold">Admin</div>

        <button
          onClick={logout}
          className="mt-3 px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default function AdminDashboard() {
  const [active, setActive] = useState("Overview");
  const [institutions, setInstitutions] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [courses, setCourses] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [students, setStudents] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [overview, setOverview] = useState({
    totalInstitutions: 0,
    totalStudents: 0,
    totalCompanies: 0,
    totalAdmissions: 0,
  });
  const [chartData, setChartData] = useState([]);

  const logout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const inst = await getDocs(collection(db, "institutions"));
    const fac = await getDocs(collection(db, "faculties"));
    const cou = await getDocs(collection(db, "courses"));
    const com = await getDocs(collection(db, "companies"));
    const stu = await getDocs(collection(db, "students"));
    const adm = await getDocs(collection(db, "admissions"));

    setInstitutions(inst.docs.map((d) => ({ id: d.id, ...d.data() })));
    setFaculties(fac.docs.map((d) => ({ id: d.id, ...d.data() })));
    setCourses(cou.docs.map((d) => ({ id: d.id, ...d.data() })));
    setCompanies(com.docs.map((d) => ({ id: d.id, ...d.data() })));
    setStudents(stu.docs.map((d) => ({ id: d.id, ...d.data() })));
    setAdmissions(adm.docs.map((d) => ({ id: d.id, ...d.data() })));

    setOverview({
      totalInstitutions: inst.size,
      totalStudents: stu.size,
      totalCompanies: com.size,
      totalAdmissions: adm.size,
    });

    setChartData([
      { name: "Institutions", value: inst.size },
      { name: "Students", value: stu.size },
      { name: "Companies", value: com.size },
      { name: "Admissions", value: adm.size },
    ]);
  };

  // -----------------------------
  // ✅ APPROVE FUNCTION (Backend + Email)
  // -----------------------------
  const handleApprove = async (collectionName, item) => {
    try {
      const role = collectionName === "institutions" ? "institution" : "company";

      const res = await fetch(
        "http://localhost:5000/api/admin/approve-registration",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: item.id,
            email: item.email,
            name: item.name,
            role, // 'institution' or 'company'
          }),
        }
      );

      const data = await res.json();
      if (data.success) {
        alert(`${item.name} approved! Email sent with generated password.`);
        loadAll(); // refresh dashboard
      } else {
        alert("Approval failed: " + data.message);
      }
    } catch (error) {
      console.error("Error approving:", error);
      alert("Failed to approve");
    }
  };

  // -----------------------------
  // ✅ DELETE FUNCTION (Firestore only)
  // -----------------------------
  const handleDelete = async (collectionName, id) => {
    try {
      const itemRef = doc(db, collectionName, id);
      await deleteDoc(itemRef);
      loadAll();
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Failed to delete");
    }
  };

  // -----------------------------
  // ADD ITEM (Optional)
  // -----------------------------
  const handleAdd = async (collectionName) => {
    const name = prompt(`Enter ${collectionName.slice(0, -1)} name:`);
    if (!name) return;

    try {
      const collRef = collection(db, collectionName);
      await collRef.add({ name, status: "pending", createdAt: new Date().toISOString() });
      loadAll();
    } catch (error) {
      console.error("Error adding:", error);
      alert("Failed to add");
    }
  };

  const renderList = (items, collectionName, showApprove = false) => (
    <div className="space-y-3">
      {items.map((i) => (
        <div key={i.id} className="p-4 bg-[rgba(255,255,255,0.05)] rounded flex justify-between items-center">
          <div>
            <div className="text-white font-semibold">{i.name}</div>
            {i.email && <div className="text-gray-400">{i.email}</div>}
            {i.status && <div className="text-gray-400 text-sm">Status: {i.status}</div>}
          </div>

          <div className="flex gap-2">
            {showApprove && i.status !== "approved" && (
              <button
                onClick={() => handleApprove(collectionName, i)}
                className="px-3 py-1 bg-teal-600 text-white rounded"
              >
                Approve
              </button>
            )}
            <button
              onClick={() => handleDelete(collectionName, i.id)}
              className="px-3 py-1 bg-red-600 text-white rounded"
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={() => handleAdd(collectionName)}
        className="mt-4 px-3 py-1 bg-blue-600 text-white rounded"
      >
        Add {collectionName.slice(0, -1)}
      </button>
    </div>
  );

  const OverviewPanel = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {[
        { label: "Institutions", value: overview.totalInstitutions },
        { label: "Students", value: overview.totalStudents },
        { label: "Companies", value: overview.totalCompanies },
        { label: "Admissions", value: overview.totalAdmissions },
      ].map((item, i) => (
        <motion.div
          key={i}
          whileHover={{ y: -5 }}
          className="p-5 bg-[rgba(255,255,255,0.03)] rounded-2xl border border-[rgba(255,255,255,0.05)]"
        >
          <div className="text-gray-300 text-sm">{item.label}</div>
          <div className="text-2xl font-semibold text-white mt-2">{item.value}</div>
        </motion.div>
      ))}
    </div>
  );

  const ChartPanel = () => (
    <div
      className="rounded-2xl p-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(79,209,197,0.03)]"
      style={{ minHeight: 300 }}
    >
      <div className="text-white text-lg mb-4">System Activity Overview</div>

      <div className="w-full h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={TEAL} stopOpacity={0.4} />
                <stop offset="95%" stopColor={TEAL} stopOpacity={0} />
              </linearGradient>
            </defs>

            <XAxis dataKey="name" stroke="gray" />
            <YAxis stroke="gray" />
            <Tooltip contentStyle={{ background: "#0b0b0f", border: "none" }} />
            <Legend />
            <Area type="monotone" dataKey="value" stroke={TEAL} fill="url(#g)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (active) {
      case "Institutions":
        return renderList(institutions, "institutions", true);
      case "Faculties":
        return renderList(faculties, "faculties");
      case "Courses":
        return renderList(courses, "courses");
      case "Companies":
        return renderList(companies, "companies", true);
      case "Students":
        return renderList(students, "students");
      case "Admissions":
        return renderList(admissions, "admissions");
      default:
        return (
          <>
            <OverviewPanel />
            <ChartPanel />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen w-full" style={{ background: BG }}>
      <GlobeBG />
      <Sidebar active={active} setActive={setActive} logout={logout} />

      <main className="ml-72 p-6 pt-10">
        <AnimatePresence>
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
