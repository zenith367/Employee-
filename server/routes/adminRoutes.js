const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const { db, auth } = require("../services/firebase"); // Firestore + Firebase Admin Auth
require("dotenv").config();

// -----------------------------
// Email transporter
// -----------------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// -----------------------------
// Generate random password
// -----------------------------
function generatePassword(length = 10) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  let pass = "";
  for (let i = 0; i < length; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)];
  }
  return pass;
}

// -----------------------------
// Approve registration
// -----------------------------
router.post("/approve-registration", async (req, res) => {
  try {
    const { id, email, name, role } = req.body; // role = 'institution' | 'company'

    if (!id || !email || !role) {
      return res.status(400).json({ success: false, message: "Missing fields." });
    }

    // Generate temporary password
    const tempPassword = generatePassword();

    // Create Firebase Auth user
    const firebaseUser = await auth.createUser({
      email,
      password: tempPassword,
      displayName: name,
      emailVerified: true, // ✅ Mark email as verified immediately
    });

    // Update Firestore document in original collection
    const collectionName = role === "institution" ? "institutions" : "companies";
    await db.collection(collectionName).doc(id).update({
      status: "approved",
      approvedAt: new Date().toISOString(),
      password: tempPassword,
      firebaseUid: firebaseUser.uid,
    });

    // ✅ ALSO create user document in 'users' collection for login
    await db.collection("users").doc(firebaseUser.uid).set({
      uid: firebaseUser.uid,
      name,
      email,
      role,
      approved: true,
      createdAt: new Date().toISOString(),
    });

    // Send email with temporary password
    await transporter.sendMail({
      from: `"Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "✅ Registration Approved",
      text: `Hi ${name},\n\nYour registration has been approved!\n\nYou can log in using this temporary password:\n\nPassword: ${tempPassword}\n\nPlease change it after logging in.\n\nBest,\nAdmin Team`,
    });

    res.json({ success: true, message: "Approved and email sent." });
  } catch (error) {
    console.error("Approval error:", error);
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
});

// -----------------------------
// Delete registration
// -----------------------------
router.delete("/delete/:collectionName/:id", async (req, res) => {
  try {
    const { collectionName, id } = req.params;

    // Delete from Firestore
    await db.collection(collectionName).doc(id).delete();

    res.json({ success: true, message: "Deleted successfully." });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
});

// -----------------------------
// Get all institutions
// -----------------------------
router.get("/institutions", async (req, res) => {
  try {
    const snapshot = await db.collection("institutions").get();
    const institutions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, institutions });
  } catch (error) {
    console.error("Get institutions error:", error);
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
});

// -----------------------------
// Add institution
// -----------------------------
router.post("/institutions", async (req, res) => {
  try {
    const { name, description, location, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Name and email are required." });
    }
    const newInst = {
      name,
      description: description || "",
      location: location || "",
      email,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    const docRef = await db.collection("institutions").add(newInst);
    res.json({ success: true, message: "Institution added.", id: docRef.id });
  } catch (error) {
    console.error("Add institution error:", error);
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
});

// -----------------------------
// Update institution
// -----------------------------
router.put("/institutions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    await db.collection("institutions").doc(id).update(updates);
    res.json({ success: true, message: "Institution updated." });
  } catch (error) {
    console.error("Update institution error:", error);
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
});

// -----------------------------
// Delete institution
// -----------------------------
router.delete("/institutions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("institutions").doc(id).delete();
    res.json({ success: true, message: "Institution deleted." });
  } catch (error) {
    console.error("Delete institution error:", error);
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
});

// -----------------------------
// Get courses for an institution
// -----------------------------
router.get("/institutions/:id/courses", async (req, res) => {
  try {
    const { id } = req.params;
    const snapshot = await db.collection("institutions").doc(id).collection("courses").get();
    const courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, courses });
  } catch (error) {
    console.error("Get courses error:", error);
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
});

// -----------------------------
// Add course to institution
// -----------------------------
router.post("/institutions/:id/courses", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, requiredSubjects, minMarks, requiredCertificates } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Course name is required." });
    }
    const newCourse = {
      name,
      description: description || "",
      institutionId: id,
      institutionName: req.body.institutionName || "",
      requiredSubjects: requiredSubjects || [],
      minMarks: minMarks || 0,
      requiredCertificates: requiredCertificates || [],
      createdAt: new Date().toISOString(),
    };
    const docRef = await db.collection("institutions").doc(id).collection("courses").add(newCourse);
    res.json({ success: true, message: "Course added.", id: docRef.id });
  } catch (error) {
    console.error("Add course error:", error);
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
});

// -----------------------------
// Update course
// -----------------------------
router.put("/institutions/:instId/courses/:courseId", async (req, res) => {
  try {
    const { instId, courseId } = req.params;
    const updates = req.body;
    await db.collection("institutions").doc(instId).collection("courses").doc(courseId).update(updates);
    res.json({ success: true, message: "Course updated." });
  } catch (error) {
    console.error("Update course error:", error);
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
});

// -----------------------------
// Delete course
// -----------------------------
router.delete("/institutions/:instId/courses/:courseId", async (req, res) => {
  try {
    const { instId, courseId } = req.params;
    await db.collection("institutions").doc(instId).collection("courses").doc(courseId).delete();
    res.json({ success: true, message: "Course deleted." });
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
});

// -----------------------------
// Get all companies
// -----------------------------
router.get("/companies", async (req, res) => {
  try {
    const snapshot = await db.collection("companies").get();
    const companies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, companies });
  } catch (error) {
    console.error("Get companies error:", error);
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
});

// -----------------------------
// Approve company
// -----------------------------
router.post("/companies/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("companies").doc(id).update({ status: "approved" });
    res.json({ success: true, message: "Company approved." });
  } catch (error) {
    console.error("Approve company error:", error);
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
});

// -----------------------------
// Suspend company
// -----------------------------
router.post("/companies/:id/suspend", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("companies").doc(id).update({ status: "suspended" });
    res.json({ success: true, message: "Company suspended." });
  } catch (error) {
    console.error("Suspend company error:", error);
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
});

// -----------------------------
// Delete company
// -----------------------------
router.delete("/companies/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("companies").doc(id).delete();
    res.json({ success: true, message: "Company deleted." });
  } catch (error) {
    console.error("Delete company error:", error);
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
});

// -----------------------------
// Publish admissions for an institution
// -----------------------------
router.post("/institutions/:id/publish-admissions", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("institutions").doc(id).update({ published: true });
    res.json({ success: true, message: "Admissions published." });
  } catch (error) {
    console.error("Publish admissions error:", error);
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
});

// -----------------------------
// Get system reports (e.g., counts)
// -----------------------------
router.get("/reports", async (req, res) => {
  try {
    const [institutions, companies, students] = await Promise.all([
      db.collection("institutions").get(),
      db.collection("companies").get(),
      db.collection("students").get(),
    ]);
    const report = {
      totalInstitutions: institutions.size,
      totalCompanies: companies.size,
      totalStudents: students.size,
    };
    res.json({ success: true, report });
  } catch (error) {
    console.error("Get reports error:", error);
    res.status(500).json({ success: false, message: "Server error.", error: error.message });
  }
});

module.exports = router;
