from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import google.generativeai as genai
import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from io import BytesIO
import logging
from sklearn.feature_extraction.text import CountVectorizer

logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
CORS(app)

# Set your Gemini API key
os.environ["API_KEY"] = 'AIzaSyAzVK_2CubLgOscYTSdyYM5sBKFTdRFacc'  # Replace with your actual API key
genai.configure(api_key=os.environ["API_KEY"])

# Function to extract keywords from the job description
def extract_keywords(job_description):
    logging.debug("Extracting keywords from job description.")
    vectorizer = CountVectorizer(stop_words='english', max_features=10)
    X = vectorizer.fit_transform([job_description])
    keywords = vectorizer.get_feature_names_out()
    logging.debug("Extracted keywords: %s", keywords)
    return keywords

# Function to preprocess user inputs
def preprocess_user_data(user_data):
    logging.debug("Preprocessing user inputs.")
    # Normalize case
    user_data['name'] = user_data['name'].strip().title()
    for edu in user_data.get('education', []):
        edu['institution'] = edu['institution'].strip().title()
        edu['degree'] = edu['degree'].strip().title()
    for exp in user_data.get('workExperience', []):
        exp['company'] = exp['company'].strip().title()
        exp['role'] = exp['role'].strip().title()
    for proj in user_data.get('projects', []):
        proj['title'] = proj['title'].strip().title()
    return user_data

# Function to generate diverse resumes using different prompts
def generate_resumes(user_data, job_role, job_description):
    logging.debug("Generating three different resumes for role: %s", job_role)

    # Extract keywords from job description
    keywords = extract_keywords(job_description)
    user_data = preprocess_user_data(user_data)

    education_details = "\n".join([
        f"{edu['institution']} - {edu['degree']} ({edu['year']}, {edu['percentage']}%)"
        for edu in user_data['education']
    ])

    work_experience_details = "\n".join([
        f"- {exp['company']} - {exp['role']} ({exp['duration']})\n   Description: {exp.get('jobDescription', 'No description available.')}"
        for exp in user_data['workExperience']
    ])

    project_details = "\n".join([
        f"- {proj['title']} - Tools: {proj['tools']} - Description: {proj['description']}"
        for proj in user_data['projects']
    ])

    prompts = [
        # Chronological Resume Format (ATS-friendly)
        f"Create a formal, ATS-friendly chronological resume for a {job_role} using the details below. Display work experience in reverse chronological order, starting with the most recent. Highlight technical skills, work experience, and education. Emphasize these keywords: {', '.join(keywords)}.\n\nJob Description: {job_description}\n\nPersonal Information: {user_data}\nEducation: {education_details}\nWork Experience (in reverse chronological order): {work_experience_details}\nProjects: {project_details}",

        # Functional Resume Format (ATS-friendly)
        f"Create a formal, ATS-friendly functional resume for a {job_role} using the details below. Focus on showcasing key skills and competencies, followed by a brief work history and educational background. Emphasize transferable skills relevant to the job and these keywords: {', '.join(keywords)}.\n\nJob Description: {job_description}\n\nPersonal Information: {user_data}\nSkills: {education_details} {work_experience_details} {project_details}\nWork Experience (brief): {work_experience_details}\nEducation: {education_details}\nProjects: {project_details}",

        # Combination Resume Format (ATS-friendly)
        f"Create a formal, ATS-friendly combination resume for a {job_role} using the details below. Mix both chronological and functional elements, placing emphasis on skills at the top followed by relevant work experience and education. Organize work experience in reverse chronological order. Emphasize these keywords: {', '.join(keywords)}.\n\nJob Description: {job_description}\n\nPersonal Information: {user_data}\nSkills: {education_details} {work_experience_details} {project_details}\nWork Experience (reverse chronological order): {work_experience_details}\nEducation: {education_details}\nProjects: {project_details}"
    ]

    resumes = []
    model = genai.GenerativeModel('gemini-1.5-flash-latest')

    for i, prompt in enumerate(prompts):
        logging.debug("Calling generative model for resume %d with prompt: %s", i + 1, prompt[:100])  # Logging only the first 100 characters of the prompt
        try:
            response = model.generate_content(prompt)
            resumes.append(response.text.strip())
            logging.debug("Resume %d generated successfully", i + 1)
        except Exception as e:
            logging.error("Error generating resume %d: %s", i + 1, str(e))

    return resumes

# Function to generate PDF from resume text
def generate_pdf(resume_text):
    logging.debug("Generating PDF for resume text.")
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    # Set the title and font
    c.setFont("Helvetica-Bold", 16)
    c.drawString(100, height - 50, "Generated Resume")

    # Set content font
    c.setFont("Helvetica", 12)
    text_object = c.beginText(100, height - 100)

    # Split resume text into lines
    lines = resume_text.split("\n")

    for line in lines:
        #logging.debug("Adding line to PDF: %s", line)
        if text_object.getY() < 50:  # Start a new page if near the bottom
            c.drawText(text_object)
            c.showPage()
            text_object = c.beginText(100, height - 100)
        text_object.textLine(line)

    c.drawText(text_object)  # Draw remaining text
    c.showPage()
    c.save()

    buffer.seek(0)
    return buffer

@app.route('/generate_resumes', methods=['POST'])
def generate_resumes_route():
    logging.debug("Received request to generate resumes.")

    # Receive the data from the frontend
    user_data = request.json
    job_role = user_data.get('globalRole', '')
    job_description = user_data.get('globalJobDescription', '')
    
    #logging.debug("Received user data: %s", str(user_data)[:200])  # Log first 200 characters of user data
    #logging.debug("Job role: %s, Job description: %s", job_role, job_description)

    try:
        # Generate three different resumes
        resume_texts = generate_resumes(user_data, job_role, job_description)
        logging.debug("All resumes generated successfully.")

        # Optionally generate PDFs for the resumes
        pdf_buffers = [generate_pdf(resume_text) for resume_text in resume_texts]
        logging.debug("PDFs generated successfully.")

        # Respond with resume texts and indicate PDF availability
        response_data = {
            "resumes": resume_texts,
            "pdfs_available": True  # Indicate that PDFs are available for download
        }

        return jsonify(response_data)

    except Exception as e:
        logging.error("Error occurred during resume generation: %s", str(e))
        return jsonify({"error": "An error occurred during resume generation."}), 500

if __name__ == '__main__':
    app.run(debug=True)
