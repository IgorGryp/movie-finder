import { API_BASE_URL, API_OPTIONS } from "./apiConfig";
import { updateSearchCount, getTrendingMovies } from "../appwrite";

// Function to fetch movies from TMDB based on search term
// If no search term is provided, fetch popular movies
export const fetchMovies = async (query = "") => {
  // Construct the API endpoint based on the search term
  // If a search term is provided, use the search endpoint; otherwise, use the discover endpoint (popular movies)
  const endpoint = query
    ? `${API_BASE_URL}/search/movie?query=${encodeURI(query)}`
    : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

  // Fetch data from TMDB
  const response = await fetch(endpoint, API_OPTIONS);

  // Convert the response to JSON
  const data = await response.json();
  console.log(data);

  // Handle invalid API key
  if (data.status_code === 7) {
    throw new Error("Invalid TMDB API key. Please check your .env.local");
  }

  // Handle no results
  if (!data.results || data.results.length === 0) {
    return [];
  }

  // Track searches in Appwrite (only for searches)
  if (query && data.results.length > 0) {
    await updateSearchCount(query, data.results[0]); // Update search count in Appwrite with the first movie result
  }

  return data.results;
};

export const loadTrendingMovies = async () => {
  return await getTrendingMovies();
};
