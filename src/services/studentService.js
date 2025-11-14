// src/services/studentService.js

export const getStudentData = async () => {
    // TODO: Replace with actual Firebase call
    return {
      name: "Rorisang Thakholi",
      email: "rorisang@example.com",
      id: "STU12345"
    };
  };
  
  export const getApplications = async () => {
    // TODO: Replace with actual Firebase call
    return [
      { courseName: "Software Engineering", institution: "Limkokwing", status: "Pending" },
      { courseName: "Multimedia", institution: "Limkokwing", status: "Admitted" }
    ];
  };
  
  export const getJobs = async () => {
    // TODO: Replace with actual Firebase call
    return [
      { title: "Frontend Developer Intern", company: "Tech Solutions" },
      { title: "Junior Designer", company: "Creative Agency" }
    ];
  };
  