export const formatDate = (date: string | undefined, showNever: boolean = false): string => {
  if (!date) return showNever ? 'Never' : '-';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime()) || dateObj.getFullYear() < 1900) {
      return showNever ? 'Never' : '-';
    }
    
    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return showNever ? 'Never' : '-';
  }
};