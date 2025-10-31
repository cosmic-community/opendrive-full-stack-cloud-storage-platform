export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const getFileIcon = (mimeType) => {
  if (!mimeType) return 'File';

  if (mimeType.startsWith('image/')) return 'Image';
  if (mimeType.startsWith('video/')) return 'Video';
  if (mimeType.startsWith('audio/')) return 'Music';
  if (mimeType === 'application/pdf') return 'FileText';
  if (mimeType.includes('word')) return 'FileText';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'Sheet';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'Presentation';
  if (mimeType.includes('zip') || mimeType.includes('rar')) return 'Archive';

  return 'File';
};

export const getFileColor = (mimeType) => {
  if (!mimeType) return 'text-gray-500';

  if (mimeType.startsWith('image/')) return 'text-blue-500';
  if (mimeType.startsWith('video/')) return 'text-purple-500';
  if (mimeType.startsWith('audio/')) return 'text-pink-500';
  if (mimeType === 'application/pdf') return 'text-red-500';
  if (mimeType.includes('word')) return 'text-blue-600';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'text-green-500';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'text-orange-500';
  if (mimeType.includes('zip') || mimeType.includes('rar')) return 'text-yellow-600';

  return 'text-gray-500';
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};