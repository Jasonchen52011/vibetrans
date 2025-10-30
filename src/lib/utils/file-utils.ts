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
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value || '';
    } catch (error) {
      throw new Error(
        'Failed to read .docx file. Please ensure it is a valid Word document.'
      );
    }
  }

  throw new Error(
    'Unsupported file format. Please upload .txt or .docx files.'
  );
}
