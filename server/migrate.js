const admin = require('firebase-admin');
const serviceAccount = require('./ServiceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function migrateData() {
  console.log('Starting migration...');

  try {
    // Migrate courses to subcollections under institutions
    const coursesSnapshot = await db.collection('courses').get();
    for (const doc of coursesSnapshot.docs) {
      const courseData = doc.data();
      const institutionId = courseData.institutionId;
      if (institutionId) {
        await db.collection('institutions').doc(institutionId).collection('courses').doc(doc.id).set(courseData);
        console.log(`Migrated course ${doc.id} to institutions/${institutionId}/courses/${doc.id}`);
      }
    }

    // Migrate jobs to subcollections under companies
    const jobsSnapshot = await db.collection('jobs').get();
    for (const doc of jobsSnapshot.docs) {
      const jobData = doc.data();
      const companyId = jobData.companyId;
      if (companyId) {
        await db.collection('companies').doc(companyId).collection('jobs').doc(doc.id).set(jobData);
        console.log(`Migrated job ${doc.id} to companies/${companyId}/jobs/${doc.id}`);
      }
    }

    // Migrate registrations to subcollections under students
    const registrationsSnapshot = await db.collection('registrations').get();
    for (const doc of registrationsSnapshot.docs) {
      const regData = doc.data();
      const studentId = regData.studentId;
      if (studentId) {
        await db.collection('students').doc(studentId).collection('registrations').doc(doc.id).set(regData);
        console.log(`Migrated registration ${doc.id} to students/${studentId}/registrations/${doc.id}`);
      }
    }

    // Migrate documents and transcripts from students arrays to subcollections
    const studentsSnapshot = await db.collection('students').get();
    for (const doc of studentsSnapshot.docs) {
      const studentData = doc.data();
      const studentId = doc.id;

      // Documents
      if (studentData.documents && Array.isArray(studentData.documents)) {
        for (let i = 0; i < studentData.documents.length; i++) {
          const url = studentData.documents[i];
          await db.collection('students').doc(studentId).collection('documents').add({
            url: url,
            uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
        console.log(`Migrated documents for student ${studentId}`);
      }

      // Transcripts
      if (studentData.transcripts && Array.isArray(studentData.transcripts)) {
        for (let i = 0; i < studentData.transcripts.length; i++) {
          const url = studentData.transcripts[i];
          await db.collection('students').doc(studentId).collection('transcripts').add({
            url: url,
            uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
        console.log(`Migrated transcripts for student ${studentId}`);
      }

      // Remove arrays from student doc
      await db.collection('students').doc(studentId).update({
        documents: admin.firestore.FieldValue.delete(),
        transcripts: admin.firestore.FieldValue.delete(),
      });
    }

    // Delete old flat collections
    console.log('Deleting old flat collections...');
    await deleteCollection('courses');
    await deleteCollection('jobs');
    await deleteCollection('registrations');

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

async function deleteCollection(collectionPath) {
  const collectionRef = db.collection(collectionPath);
  const snapshot = await collectionRef.get();
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  console.log(`Deleted collection: ${collectionPath}`);
}

migrateData();
