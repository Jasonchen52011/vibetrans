/**
 * Dynamic file utilities for optimized bundle size
 */

export async function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        resolve(content);
      } else {
        reject(new Error('File is empty'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export async function readFileContent(file: File): Promise<string> {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  if (fileExtension === 'txt') {
    return readTextFile(file);
  }

  if (fileExtension === 'docx') {
    try {
      const arrayBuffer = await file.arrayBuffer();

      // Dynamically import mammoth for Edge Runtime compatibility
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({
        arrayBuffer,
        // Add mammoth options for better extraction
        convertImage: mammoth.images.imgElement((element) =>
          element.read('base64').then((imageBuffer) => ({
            src: 'data:' + element.contentType + ';base64,' + imageBuffer,
          }))
        ),
      });

      const extractedText = result.value || '';

      if (!extractedText.trim()) {
        throw new Error(
          'The Word document appears to be empty or contains no readable text.'
        );
      }

      return extractedText;
    } catch (error) {
      // Handle specific error cases
      if (
        error instanceof Error &&
        error.message.includes('Failed to fetch dynamically imported module')
      ) {
        throw new Error(
          'Document processing is currently unavailable. Please try copying and pasting the text directly, or use a plain text file (.txt).'
        );
      }

      if (
        error instanceof Error &&
        error.message.includes('empty or contains no readable text')
      ) {
        throw error;
      }

      throw new Error(
        'Failed to read .docx file. Please ensure it is a valid Word document and not password protected.'
      );
    }
  }

  // Handle old .doc format
  if (fileExtension === 'doc') {
    throw new Error(
      'Old .doc format is not supported. Please save your file as .docx (File → Save As → Word Document (.docx)) or copy-paste the text directly.'
    );
  }

  throw new Error(
    'Unsupported file format. Please upload .txt or .docx files.'
  );
}
