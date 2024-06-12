// src/getComputerLocation.js
import axios from 'axios';

const getComputerLocation = async () => {
  // const apiKey = '016ae2ada4014fe8996a3e52b1178e69'; // Replace with your API key
  const apiKey = import.meta.env.VITE_IPGEOLOCATION_API_KEY;
  const url = `https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}`;
  
  try {
    const response = await axios.get(url);
    const { latitude, longitude } = response.data;
    return { latitude, longitude };
  } catch (error) {
    console.error("Error fetching computer location:", error);
    return { latitude: null, longitude: null };
  }
};

export default getComputerLocation;