# PDF Generator Utility

This utility provides functionality to generate PDF documents for course details using the `pdfmake` library.

## Features

- Generate course information PDFs with professional layout
- Include course thumbnail, description, objectives, and lessons
- Download PDFs directly to user's device
- Open PDFs in new browser tab
- Generate PDF as blob for further processing

## Usage

### Basic PDF Download

```typescript
import { generateCoursePDF } from '../utils/pdfGenerator';

// Download PDF for a course
const handleDownload = async (course) => {
  try {
    await generateCoursePDF(course);
    // PDF will be downloaded automatically
  } catch (error) {
    console.error('Failed to generate PDF:', error);
  }
};
```

### Open PDF in New Tab

```typescript
import { openCoursePDFInNewTab } from '../utils/pdfGenerator';

// Open PDF in new tab
const handlePreview = async (course) => {
  try {
    await openCoursePDFInNewTab(course);
    // PDF will open in new tab
  } catch (error) {
    console.error('Failed to open PDF:', error);
  }
};
```

### Generate PDF as Blob

```typescript
import { generateCoursePDFBlob } from '../utils/pdfGenerator';

// Get PDF as blob for further processing
const handleBlob = async (course) => {
  try {
    const blob = await generateCoursePDFBlob(course);
    // Use blob for upload, preview, or other purposes
    const url = URL.createObjectURL(blob);
    // ... use the URL
  } catch (error) {
    console.error('Failed to generate PDF blob:', error);
  }
};
```

## PDF Layout

The generated PDF includes:

1. **Header**: GlobalSelect Academy branding
2. **Course Title**: Large, prominent display
3. **Course Thumbnail**: Centered image (if available)
4. **Course Information Table**: 
   - Course ID, Category, Level, Duration
   - Instructor, Status, Created/Updated dates
   - Enrollment count
5. **Course Description**: Full description text
6. **Learning Objectives**: Bulleted list (if available)
7. **Course Content**: Table of lessons with types and durations
8. **Footer**: Generation timestamp

## Styling

The PDF uses a professional color scheme:
- **Primary**: Blue (#1e40af) for headers and accents
- **Text**: Dark gray (#1f2937) for titles, medium gray (#374151) for content
- **Status**: Green (#059669) for active, red (#dc2626) for inactive
- **Background**: White with subtle borders and shadows

## Dependencies

- `pdfmake`: PDF generation library
- `pdfmake/build/vfs_fonts`: Font definitions

## Error Handling

All functions include proper error handling and will throw descriptive errors if PDF generation fails. Common error scenarios:

- Invalid course data
- Missing required fields
- Browser compatibility issues
- Memory limitations for large documents

## Browser Support

The utility works in all modern browsers that support:
- ES6+ features
- Blob API
- File download API
- PDF rendering

