import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: {
      personal: '',
      college: ''
    },
    github: '',
    linkedin: '',
    education: [
      {
        institution: '', // Name of the institution
        degree: '',      // Degree or program name
        year: '',        // Year of graduation/completion
        percentage: ''   // Percentage or GPA achieved
      }
    ],
    skills: '',
    langProficiency: '',
    areaOfInterest: '',
    awards: '',
    projects: [
      {
        title: '',        // Project title
        tools: '',        // Tools/technologies used in the project
        description: '',  // Project description
      }
    ],
    workExperience: [
      { company: '', role: '', jobDescription: '' }
    ],
    hackathons: [
      {
        title: '',          // Hackathon title
        description: '',    // Description of the hackathon
        year: '',           // Year of participation
        teamSize: '',       // Team size
        position: '',       // Position in the hackathon (e.g., 1st, 2nd)
        skillsUsed: '',     // Skills used during the hackathon
        link: ''            // Link to the hackathon or project
      }
    ],
    certifications: [
      { 
        title: '',          // Certification title
        issuer: '',         // Issuer of the certification
        year: '',           // Year of issuance
        description: '',    // Description of the certification
        validity: ''        // Validity period of the certification
      }
    ],
    globalRole: '',
    globalJobDescription: ''
  });

  /*const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('email')) {
      setFormData({
        ...formData,
        email: {
          ...formData.email,
          [name.split('.')[1]]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };*/
  const handleChange = (e) => {
    const { name, value } = e.target;
    const keys = name.split('.');
    if (keys.length > 1) {
      setFormData(prevState => ({
        ...prevState,
        [keys[0]]: {
          ...prevState[keys[0]],
          [keys[1]]: value,
        }
      }));
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  

  const handleEducationChange = (index, e) => {
    const updatedEducation = [...formData.education];
    updatedEducation[index][e.target.name] = e.target.value;
    setFormData({
      ...formData,
      education: updatedEducation
    });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [
        ...formData.education,
        { institution: '', degree: '', year: '', percentage: '' }
      ]
    });
  };

  const removeEducation = (index) => {
    const updatedEducation = formData.education.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      education: updatedEducation
    });
  };

  const handleProjectsChange = (index, e) => {
    const updatedProjects = [...formData.projects];
    updatedProjects[index][e.target.name] = e.target.value;
    setFormData({
      ...formData,
      projects: updatedProjects
    });
  };

  const addProject = () => {
    setFormData({
      ...formData,
      projects: [
        ...formData.projects,
        { title: '', tools: '', description: '' }
      ]
    });
  };

  const removeProject = (index) => {
    const updatedProjects = formData.projects.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      projects: updatedProjects
    });
  };

  const handleWorkExperienceChange = (index, e) => {
    const updatedWorkExperience = [...formData.workExperience];
    updatedWorkExperience[index][e.target.name] = e.target.value;
    setFormData({
      ...formData,
      workExperience: updatedWorkExperience,
    });
  };
  

  const addWorkExperience = () => {
    setFormData({
      ...formData,
      workExperience: [
        ...formData.workExperience,
        { company: '', role: '', jobDescription: '', duration: '' }
      ]
    });
  };

  const removeWorkExperience = (index) => {
    const updatedWorkExperience = formData.workExperience.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      workExperience: updatedWorkExperience
    });
  };

  const handleHackathonsChange = (index, e) => {
    const updatedHackathons = [...formData.hackathons];
    updatedHackathons[index][e.target.name] = e.target.value;
    setFormData({
      ...formData,
      hackathons: updatedHackathons
    });
  };

  const addHackathon = () => {
    setFormData({
      ...formData,
      hackathons: [
        ...formData.hackathons,
        { title: '', description: '', year: '' }
      ]
    });
  };

  const removeHackathon = (index) => {
    const updatedHackathons = formData.hackathons.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      hackathons: updatedHackathons
    });
  };

  const handleCertificationsChange = (index, e) => {
    const updatedCertifications = [...formData.certifications];
    updatedCertifications[index][e.target.name] = e.target.value;
    setFormData({
      ...formData,
      certifications: updatedCertifications,
    });
  };
  
  const addCertification = () => {
    setFormData({
      ...formData,
      certifications: [
        ...formData.certifications,
        { title: '', issuer: '', year: '' },
      ],
    });
  };
  
  const removeCertification = (index) => {
    const updatedCertifications = formData.certifications.filter(
      (_, i) => i !== index
    );
    setFormData({
      ...formData,
      certifications: updatedCertifications,
    });
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = 'http://localhost:5000/generate_resumes'; // Correct URL to your Flask backend

    try {
        // Assuming formData contains the necessary user data (e.g., job role, job description, etc.)
        const response = await axios.post(url, formData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.data && response.data.resumes) {
            // Assuming response.data.resumes is an array of resume texts
            let resumesText = response.data.resumes.join('\n\n'); // Join multiple resumes with double line breaks

            // Display the generated resume in a designated div (e.g., with id 'resumeDisplay')
            document.getElementById('resumeDisplay').innerText = resumesText;

            console.log('Resumes generated successfully:', response.data.resumes);
        } else {
            console.error('No resumes received in the response');
        }

        // Handle PDF download if available
        if (response.data.pdfs_available && response.data.pdfs) {
          response.data.pdfs.forEach((pdfBase64, index) => {
              // Decode the base64 PDF data
              const pdfBlob = new Blob([new Uint8Array(atob(pdfBase64).split("").map(char => char.charCodeAt(0)))], { type: 'application/pdf' });

              // Create a link element to trigger the download
              const link = document.createElement('a');
              const urlBlob = URL.createObjectURL(pdfBlob);
              link.href = urlBlob;

              // Set a filename for the downloaded PDF (e.g., "generated_resume_1.pdf")
              link.setAttribute('download', `generated_resume_${index + 1}.pdf`);
              document.body.appendChild(link);

              // Trigger the download by simulating a click on the link
              link.click();

              // Clean up the link after the download
              document.body.removeChild(link);
              URL.revokeObjectURL(urlBlob);
          });
      }

    } catch (error) {
        console.error('Error generating resumes:', error);
    }
};


  return (
    <div className="App">
      <h1>Resume Generator</h1>
      <form onSubmit={handleSubmit}>
        {/* Name, Mobile, Email, GitHub, LinkedIn */}
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
        />
        <input
          type="text"
          name="mobile"
          placeholder="Mobile No."
          value={formData.mobile}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email.personal"
          placeholder="Personal Email"
          value={formData.email.personal}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email.college"
          placeholder="College Email"
          value={formData.email.college}
          onChange={handleChange}
        />
        <input
          type="text"
          name="github"
          placeholder="GitHub Link"
          value={formData.github}
          onChange={handleChange}
        />
        <input
          type="text"
          name="linkedin"
          placeholder="LinkedIn Link"
          value={formData.linkedin}
          onChange={handleChange}
        />

        {/* Education - Multiple Institutions */}
        <h3>Education</h3>
        {formData.education.map((edu, index) => (
          <div key={index}>
            <input
              type="text"
              name="institution"
              placeholder="Institution Name"
              value={edu.institution}
              onChange={(e) => handleEducationChange(index, e)}
            />
            <input
              type="text"
              name="degree"
              placeholder="Degree"
              value={edu.degree}
              onChange={(e) => handleEducationChange(index, e)}
            />
            <input
              type="text"
              name="year"
              placeholder="Year"
              value={edu.year}
              onChange={(e) => handleEducationChange(index, e)}
            />
            <input
              type="text"
              name="percentage"
              placeholder="Percentage"
              value={edu.percentage}
              onChange={(e) => handleEducationChange(index, e)}
            />
            <button type="button" onClick={() => removeEducation(index)}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={addEducation}>Add Education</button>

        {/* Other sections like Skills, Languages, etc. */}
        <textarea
          name="skills"
          placeholder="Skills"
          value={formData.skills}
          onChange={handleChange}
        />
        <textarea
          name="langProficiency"
          placeholder="Language Proficiency"
          value={formData.langProficiency}
          onChange={handleChange}
        />
        <textarea
          name="areaOfInterest"
          placeholder="Area of Interest"
          value={formData.areaOfInterest}
          onChange={handleChange}
        />
        <textarea
          name="awards"
          placeholder="Awards and Achievements"
          value={formData.awards}
          onChange={handleChange}
        />

        {/* Projects - Multiple Entries */}
        <h3>Projects</h3>
        {formData.projects.map((proj, index) => (
          <div key={index}>
            <input
              type="text"
              name="title"
              placeholder="Project Title"
              value={proj.title}
              onChange={(e) => handleProjectsChange(index, e)}
            />
            <input
              type="text"
              name="tools"
              placeholder="Tools Used"
              value={proj.tools}
              onChange={(e) => handleProjectsChange(index, e)}
            />
            <textarea
              name="description"
              placeholder="Project Description"
              value={proj.description}
              onChange={(e) => handleProjectsChange(index, e)}
            />
            <button type="button" onClick={() => removeProject(index)}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={addProject}>Add Project</button>

        {/* Work Experience - Multiple Entries */}
        <h3>Work Experience</h3>
        {formData.workExperience.map((exp, index) => (
          <div key={index}>
            <input
              type="text"
              name="company"
              placeholder="Company"
              value={exp.company}
              onChange={(e) => handleWorkExperienceChange(index, e)}
            />
            <input
              type="text"
              name="role"
              placeholder="Role"
              value={exp.role}
              onChange={(e) => handleWorkExperienceChange(index, e)}
            />
            <textarea
              name="jobDescription"
              placeholder="Job Description"
              value={exp.jobDescription}
              onChange={(e) => handleWorkExperienceChange(index, e)}
            />
            <input
              type="text"
              name="duration"
              placeholder="Duration"
              value={exp.duration}
              onChange={(e) => handleWorkExperienceChange(index, e)}
            />
            <button type="button" onClick={() => removeWorkExperience(index)}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={addWorkExperience}>Add Work Experience</button>

        {/* Hackathons */}
        <h3>Hackathons</h3>
        {formData.hackathons.map((hack, index) => (
          <div key={index}>
            <input
              type="text"
              name="title"
              placeholder="Hackathon Title"
              value={hack.title}
              onChange={(e) => handleHackathonsChange(index, e)}
            />
            <textarea
              name="description"
              placeholder="Hackathon Description"
              value={hack.description}
              onChange={(e) => handleHackathonsChange(index, e)}
            />
            <input
              type="text"
              name="year"
              placeholder="Year"
              value={hack.year}
              onChange={(e) => handleHackathonsChange(index, e)}
            />
            <button type="button" onClick={() => removeHackathon(index)}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={addHackathon}>Add Hackathon</button>

        {/* Certifications */}
        <h3>Certifications</h3>
        {formData.certifications.map((cert, index) => (
          <div key={index}>
            <input
              type="text"
              name="title"
              placeholder="Certification Title"
              value={cert.title}
              onChange={(e) => handleCertificationsChange(index, e)}
            />
            <input
              type="text"
              name="institution"
              placeholder="Institution"
              value={cert.institution}
              onChange={(e) => handleCertificationsChange(index, e)}
            />
            <input
              type="text"
              name="year"
              placeholder="Year"
              value={cert.year}
              onChange={(e) => handleCertificationsChange(index, e)}
            />
            <button type="button" onClick={() => removeCertification(index)}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={addCertification}>Add Certification</button>
        <h3>Role and Job Description</h3>
        <input
           type="text"
           name="globalRole"
           placeholder="Global Role"
           value={formData.globalRole}
           onChange={handleChange}
        />
        <textarea
          name="globalJobDescription"
          placeholder="Global Job Description"
          value={formData.globalJobDescription}
          onChange={handleChange}
        />
        <button type="submit">Generate Resume</button>
      </form>
      <div id="resumeDisplay"></div>
        <button id="downloadButton">Download PDF</button>
    </div>
  );
}

export default App;
