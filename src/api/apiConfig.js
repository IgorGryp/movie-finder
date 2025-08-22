// Centralized API configuration for TMDB

// API key stored in environment variable
export const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// Ensure the API key is available
if (!API_KEY) {
  throw new Error(
    "TMDB API key is not defined. Please set VITE_TMDB_API_KEY in .env.local"
  );
}

// Base URL for TMDB API
export const API_BASE_URL = "https://api.themoviedb.org/3";

// Fetch options configuration with Authorization header
export const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};
