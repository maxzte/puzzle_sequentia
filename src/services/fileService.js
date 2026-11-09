/**
 * Reads a File object as plain text.
 * 
 * @param {File} file
 * @returns {Promise<string>}
 */
export function readFileContent(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided.'));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        resolve(content);
      } else {
        reject(new Error('Failed to read file content as text.'));
      }
    };
    reader.onerror = () => {
      reject(reader.error || new Error('Error reading file.'));
    };
    reader.readAsText(file);
  });
}

/**
 * Fetches sample dataset from a given static URL.
 * 
 * @param {string} [url='sample.txt']
 * @returns {Promise<string>}
 */
export async function fetchSampleDataset(url = 'sample.txt') {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch sample dataset (${res.status} ${res.statusText})`);
  }
  return await res.text();
}

