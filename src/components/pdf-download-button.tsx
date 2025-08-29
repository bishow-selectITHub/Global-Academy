
import { generatePDF } from '../utils/pdfGenerator';

function PdfDownloadButton() {
    const handleDownload = () => {
        generatePDF({
            companyName: "Bishow Lamichhane",
            domain: "info@globalacademy.com",
            report_generated: "Report Generated",
            date: "2024-08-08 5:30 PM",
            courseTitle: "Sample Course",
            course_code: "Course Code: ASC-908",
            duration: "Duration: 6 Weeks",
            field13: "Course Overview",
            logo: "https://smqnaddacvwwuehxymbr.supabase.co/storage/v1/object/public/course-assets/thumbnails/1753878955283_course3.jpeg",
            description: "This course offers a comprehensive introduction to web development, covering the essential tools and technologies used to build modern websites and web applications. Students will learn HTML, CSS, and JavaScript for front-end development, as well as explore responsive design principles. The course also introduces back-end basics using Node.js, Express, and databases like MongoDB. By the end of the course, learners will be able to create fully functional and responsive websites from scratch. Perfect for beginners aiming to start a career in web development.",
            field18: "Global Academy",
            'field18 copy': "Contact with us",
            'field20 copy': "info@globalacademy.com",
            'field20': "www.globalacademy.edu.np",
            'field13 copy': "Objectives",
            'field13 copy 2': "Lessons",
            thumbnail: "https://smqnaddacvwwuehxymbr.supabase.co/storage/v1/object/public/course-assets/thumbnails/1751187433855_course1.jpeg",
            // Add sample content for objectives
            "field24": "Understand basic concepts",
            "field24 copy": "Learn practical applications",
            "field24 copy 2": "Complete hands-on exercises",
            "field24 copy 3": "Pass final assessment",
            // Add sample content for lessons
            "field24 copy 4": "Introduction to the subject",
            "field24 copy 5": "Core concepts and theory",
            "field24 copy 6": "Practical implementation"
        })
    }

    return (
        <div style={{ padding: 20 }}>
            <h1>PDFMe Example</h1>
            <button onClick={handleDownload}>Download PDF</button>
        </div>
    );
}

export default PdfDownloadButton;
