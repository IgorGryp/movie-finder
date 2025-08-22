// Main app logic: search, display movies, fetch trending

import { useEffect, useState } from "react";
import Search from "./components/Search";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import { useDebounce } from "use-debounce";
import { fetchMovies, loadTrendingMovies } from "./api/movieService";

const App = () => {
  const [searchTerm, setSearchTerm] = useState(""); // Search input state
  const [debouncedSearchTerm] = useDebounce(searchTerm, 1000); // Debounce search term for 1 second
  const [movieList, setMovieList] = useState([]); // List of movies fetched from the API
  const [trendingMovies, setTrendingMovies] = useState([]); // List of trending movies
  const [errorMessage, setErrorMessage] = useState(""); // Error message state
  const [isLoading, setIsLoading] = useState(false); // Loading state to show spinner while fetching data

  // Fetch movies when search changes
  useEffect(() => {
    const loadMovies = async () => {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const movies = await fetchMovies(debouncedSearchTerm);
        if (movies.length === 0) {
          setErrorMessage("No movies found.");
        }
        setMovieList(movies);
      } catch (error) {
        setErrorMessage(error.message || "Error fetching movies.");
      } finally {
        setIsLoading(false);
      }
    };

    loadMovies();
  }, [debouncedSearchTerm]);

  // Fetch trending movies on load
  useEffect(() => {
    const loadTrending = async () => {
      try {
        const movies = await loadTrendingMovies();
        setTrendingMovies(movies);
      } catch (error) {
        console.error("Error loading trending movies:", error);
      }
    };

    loadTrending();
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
