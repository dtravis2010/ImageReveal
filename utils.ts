// Utility functions for the Image Guess Duel game

/**
 * Compares a guess with the correct answer (case-insensitive, trimmed)
 */
export const isAnswerCorrect = (guess: string, answer: string): boolean => {
  return guess.toLowerCase().trim() === answer.toLowerCase().trim();
};

/**
 * Exports data to CSV format
 */
export const exportToCSV = (data: any[], filename: string): void => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape values that contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ];

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Formats milliseconds to a readable time string
 */
export const formatTime = (ms: number | null): string => {
  if (ms === null) return 'N/A';
  return (ms / 1000).toFixed(2) + 's';
};

/**
 * Generates a unique ID
 */
export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};
