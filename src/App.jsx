// Main app logic: search, display movies, fetch trending

import { useEffect, useState } from "react";
import Search from "./components/Search";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import { useDebounce } from "use-debounce";
import { getTrendingMovies, updateSearchCount } from "./appwrite";

const API_BASE_URL = "https://api.themoviedb.org/3"; // Base URL for TMDB API
const API_KEY = import.meta.env.VITE_TMDB_API_KEY; // API key stored in environment variable
// Fetch configuration with Authorization header
const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState(""); // Search input state
  const [debouncedSearchTerm] = useDebounce(searchTerm, 1000); // Debounce search term for 1 second
  const [movieList, setMovieList] = useState([]); // List of movies fetched from the API
  const [trendingMovies, setTrendingMovies] = useState([]); // List of trending movies
  const [errorMessage, setErrorMessage] = useState(""); // Error message state
  const [isLoading, setIsLoading] = useState(false); // Loading state to show spinner while fetching data

  // Fetch movies from TMDB API based on search term or trending
  const fetchMovies = async (query = "") => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      // Construct the API endpoint based on the search term
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURI(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      // Fetch data from TMDB
      const response = await fetch(endpoint, API_OPTIONS);
      // If the response is not OK, throw an error
      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }
      // Convert the response to JSON
      const data = await response.json();
      console.log(data);

      // TMDB always returns results in "data.results"
      // If the response indicates failure, set error message and clear movie list
      if (!data.results || data.results.length === 0) {
        setErrorMessage("No movies found for your search");
        setMovieList([]);
        return;
      }

      // Save movie list to state
      setMovieList(data.results || []);
      // If a search query was provided, update the search count in Appwrite
      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]); // Update search count in Appwrite with the first movie result
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage("Error fetching movies. Please try again later.");
    } finally {
      setIsLoading(false); // Set loading state to false after fetching
    }
  };

  // Fetch trending movies from the Appwrite database
  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  };

  // Fetch movies when the debounced search term changes
  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  // Fetch and load trending movies when the app starts (first render)
  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main>
      <div className="pattern" />

      <div className="wrapper">
        {/* Hero section with hero image and search input */}
        <header>
          <img src="./hero.png" alt="Hero Banner" />

          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy
            Without the Hassle
          </h1>

          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>
        {/* Trending movies section */}
        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* All movies section with search results */}
        <section className="all-movies">
          <h2>All Movies</h2>
          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie}></MovieCard>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
