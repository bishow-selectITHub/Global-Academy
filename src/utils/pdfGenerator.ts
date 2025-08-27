import { generate } from '@pdfme/generator';
import { text, image, rectangle, ellipse, checkbox, line } from '@pdfme/schemas';
import template from '../../public/templates/template2.json' assert { type: 'json' }
import urlToBase64 from './urlToBase64';

export const generatePDF = async (data: Record<string, any>) => {
    console.log('Template data:', template);
    console.log('Input data:', data);

    // Transform template2 to match PDFMe's expected schema format
    const transformedTemplate = {
        schemas: [
            // Map staticSchema items to the format PDFMe expects - PDFMe expects schemas[0] to be an array
            (template as any).basePdf.staticSchema.map((schema: any) => {
                console.log('Processing schema:', schema.name, schema.type, schema.content);

                // Check if this is a static title we want to preserve
                if (schema.type === 'text' && schema.content && !schema.content.includes('Type Something...')) {
                    console.log('Found static title:', schema.name, 'with content:', schema.content);
                    console.log('Static title full schema:', schema);
                }

                // Handle image fields - convert all to text placeholders
                if (schema.type === 'image') {
                    console.log('Preserving image field:', schema.name);
                    return {
                        name: schema.name,
                        type: 'image',
                        position: schema.position,
                        width: schema.width,
                        height: schema.height,
                        content: data[schema.name] || schema.content || '', // dynamic image URL from data
                    };
                }

                // For all other fields, preserve their original properties
                const transformedSchema = {
                    name: schema.name,
                    type: schema.type,
                    position: schema.position || { x: 0, y: 0 },
                    width: schema.width || 50,
                    height: schema.height || 20,
                    content: schema.content || '',
                    fontSize: schema.fontSize || 12,
                    fontName: schema.fontName === 'Poppins',
                    alignment: schema.alignment || 'left',
                    verticalAlignment: schema.verticalAlignment || 'top',
                    fontColor: schema.fontColor || '#000000',
                    backgroundColor: schema.backgroundColor || '',
                    borderWidth: schema.borderWidth || 0,
                    borderColor: schema.borderColor || '#000000',
                    color: schema.color || '#000000',
                    radius: schema.radius || 0,
                    opacity: schema.opacity || 1,
                    rotate: schema.rotate || 0,
                    lineHeight: schema.lineHeight || 1,
                    characterSpacing: schema.characterSpacing || 0,
                    strikethrough: schema.strikethrough || false,
                    underline: schema.underline || false,
                    readOnly: schema.readOnly || false,
                    required: schema.required || false
                };

                // For dynamic fields (like "Type Something..." placeholders), use data if available
                if (schema.type === 'text' && schema.content && schema.content.includes('Type Something...')) {
                    const fieldName = schema.name;
                    const dynamicContent = data[fieldName] || schema.content;
                    transformedSchema.content = dynamicContent;
                    console.log('Dynamic field updated:', fieldName, 'to:', dynamicContent);
                }

                console.log('Final transformed schema:', transformedSchema);
                return transformedSchema;
            })
        ],
        basePdf: {
            width: 210, // Keep original template dimensions in mm
            height: 299,
            padding: [20, 10, 0, 10] as [number, number, number, number]
        }
    };

    console.log('Final transformed template:', transformedTemplate);
    console.log('Number of schemas:', transformedTemplate.schemas[0].length);

    // Log all static titles to make sure they're there
    const staticTitles = transformedTemplate.schemas[0].filter((s: any) =>
        s.type === 'text' && s.content && !s.content.includes('Type Something...')
    );
    console.log('Static titles found:', staticTitles.map((s: any) => ({ name: s.name, content: s.content })));

    try {
        if (data.thumbnail && data.logo) {
            data.thumbnail = await urlToBase64(data.thumbnail);
            data.logo = await urlToBase64(data.logo);
        }
        const pdf = await generate({
            template: transformedTemplate as any,
            inputs: [data],
            plugins: { text, image, rectangle, ellipse, checkbox, line } // Remove image plugin since we're not using images
        });
        const blob = new Blob([pdf], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'myDocument.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
        console.log('PDF generated successfully');
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF. Please check the console for details.');
    }
};