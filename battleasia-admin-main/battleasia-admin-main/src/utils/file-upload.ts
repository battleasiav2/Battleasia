/**
 * Validates file before upload
 * @param file - File to validate
 * @param maxSize - Maximum file size in bytes
 * @param allowedTypes - Array of allowed MIME types
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateFile(
  file: File,
  maxSize?: number,
  allowedTypes?: string[]
): { isValid: boolean; error?: string } {
  if (maxSize && file.size > maxSize) {
    return {
      isValid: false,
      error: `File size exceeds maximum allowed size of ${(maxSize / 1024 / 1024).toFixed(2)}MB`,
    };
  }

  if (allowedTypes && allowedTypes.length > 0) {
    const fileType = file.type;
    const isAllowed = allowedTypes.some((type) => {
      if (type.endsWith('/*')) {
        // Handle wildcard types like 'image/*'
        return fileType.startsWith(type.slice(0, -1));
      }
      return fileType === type;
    });

    if (!isAllowed) {
      return {
        isValid: false,
        error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      };
    }
  }

  return { isValid: true };
}

