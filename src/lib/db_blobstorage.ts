const API_BASE_URL = 'https://climbing-journal-adhycrchdxffb6br.eastus-01.azurewebsites.net';
// const API_BASE_URL = 'http://127.0.0.1:3000'

async function fetchData(endpoint, options = {}) {
try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!response.ok) {
    let errorData;
    try {
        errorData = await response.json();
    } catch (e) {}
    const errorMsg = errorData?.error || `HTTP error! Status: ${response.status}`;
    throw new Error(errorMsg);
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
    return await response.json();
    } else {
    return await response.text();
    }
} catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    // errorMessage = `API Error: ${error.message}. Please check backend logs.`;
    throw error;
}
}

export default fetchData;