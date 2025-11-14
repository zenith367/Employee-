import { db } from "./services/firebase.js";
import { collection, addDoc } from "firebase/firestore";

async function setupFirestore() {
  try {
    // 1️⃣ Institutions
    const institutions = [
      { name: "Limkokwing University", email: "info@limkokwing.ac.ls", location: "Maseru, Lesotho", status: "pending" },
      { name: "National University", email: "contact@nu.ac.ls", location: "Maseru, Lesotho", status: "pending" }
    ];

    const institutionIds = [];
    for (const inst of institutions) {
      const docRef = await addDoc(collection(db, "institutions"), inst);
      institutionIds.push(docRef.id);
    }

    console.log("✅ Institutions added:", institutionIds);

    // 2️⃣ Faculties
    const faculties = [
      { name: "Faculty of ICT", institutionId: institutionIds[0] },
      { name: "Faculty of Business", institutionId: institutionIds[0] },
      { name: "Faculty of Arts & Design", institutionId: institutionIds[1] }
    ];

    const facultyIds = [];
    for (const f of faculties) {
      const docRef = await addDoc(collection(db, "faculties"), f);
      facultyIds.push(docRef.id);
    }

    console.log("✅ Faculties added:", facultyIds);

    // 3️⃣ Courses
    const courses = [
      { name: "BSc Software Engineering", facultyId: facultyIds[0], institutionId: institutionIds[0] },
      { name: "BSc Multimedia", facultyId: facultyIds[2], institutionId: institutionIds[1] },
      { name: "BSc Business Administration", facultyId: facultyIds[1], institutionId: institutionIds[0] }
    ];

    const courseIds = [];
    for (const c of courses) {
      const docRef = await addDoc(collection(db, "courses"), c);
      courseIds.push(docRef.id);
    }

    console.log("✅ Courses added:", courseIds);

    // 4️⃣ Students
    const students = [
      { name: "John Doe", email: "john@example.com", course: "BSc Software Engineering", status: "pending" },
      { name: "Jane Smith", email: "jane@example.com", course: "BSc Multimedia", status: "pending" }
    ];

    const studentIds = [];
    for (const s of students) {
      const docRef = await addDoc(collection(db, "students"), s);
      studentIds.push(docRef.id);
    }

    console.log("✅ Students added:", studentIds);

    // 5️⃣ Companies
    const companies = [
      { name: "TechCorp", email: "contact@techcorp.com", status: "pending" },
      { name: "DesignHub", email: "contact@designhub.com", status: "pending" }
    ];

    const companyIds = [];
    for (const c of companies) {
      const docRef = await addDoc(collection(db, "companies"), c);
      companyIds.push(docRef.id);
    }

    console.log("✅ Companies added:", companyIds);

    // 6️⃣ Admissions
    const admissions = [
      { studentId: studentIds[0], institutionId: institutionIds[0], course: "BSc Software Engineering", status: "admitted", appliedDate: "2025-11-07" },
      { studentId: studentIds[1], institutionId: institutionIds[1], course: "BSc Multimedia", status: "pending", appliedDate: "2025-11-07" }
    ];

    for (const a of admissions) {
      await addDoc(collection(db, "admissions"), a);
    }

    console.log("✅ Admissions added successfully!");
    console.log("🎉 All Firestore collections are ready!");
  } catch (err) {
    console.error("❌ Error setting up Firestore:", err);
  }
}

// Run the setup
setupFirestore();
