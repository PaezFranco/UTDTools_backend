import axios from 'axios';

const VITE_API_URL = 'http://localhost:3000/api/tools'; 

// Get all tools
export const getAllTools = async () => {
  try {
    const response = await axios.get(VITE_API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching tools:', error);
    throw error;
  }
};


// Get tool by ID
export const getToolById = async (id) => {
  try {
    const response = await axios.get(`${VITE_API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tool with ID ${id}:`, error);
    throw error;
  }
};

// Create a new tool
export const createTool = async (toolData) => {
  try {
    const response = await axios.post(VITE_API_URL, toolData);
    return response.data;
  } catch (error) {
    console.error('Error creating tool:', error);
    throw error;
  }
};

// Update an existing tool
export const updateTool = async (id, updatedData) => {
  try {
    const response = await axios.put(`${VITE_API_URL}/${id}`, updatedData);
    return response.data;
  } catch (error) {
    console.error(`Error updating tool with ID ${id}:`, error);
    throw error;
  }
};

// Delete tool by ID
export const deleteTool = async (id) => {
  try {
    const response = await axios.delete(`${VITE_API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting tool with ID ${id}:`, error);
    throw error;
  }
};


