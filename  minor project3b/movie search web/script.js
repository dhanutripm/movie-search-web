const OMDB_API_KEY =  "1ae05c26";

const movieInput = document.getElementById('movie-input');
const movieSearchBtn = document.getElementById('movie-search-btn');
const movieLoading = document.getElementById('movie-loading');
const movieError = document.getElementById('movie-error');
const movieGrid = document.getElementById('movie-grid');

const modal = document.getElementById('movie-modal');
const modalBody = document.getElementById('modal-body');
const closeBtn = document.querySelector('.close-btn');

// Asynchronous Search using Async/Await and Error Handling
const fetchMovies = async (query) => {
    if (!query.trim()) return;

    movieLoading.classList.remove('hidden');
    movieError.classList.add('hidden');
    movieGrid.innerHTML = '';

    try {
        const response = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
            throw new Error("Network response failed. Please check your internet connection.");
        }

        const data = await response.json();

        // Handle invalid search queries or results not found
        if (data.Response === "False") {
            throw new Error(data.Error || "No movies found matching your query.");
        }

        renderMovies(data.Search);
    } catch (err) {
        movieError.textContent = err.message;
        movieError.classList.remove('hidden');
    } finally {
        movieLoading.classList.add('hidden');
    }
};

// Render movies using ES6 Destructuring & Template Literals
const renderMovies = (movies) => {
    movieGrid.innerHTML = movies.map(movie => {
        const { imdbID, Title, Year, Poster, Type } = movie;
        const posterImg = Poster !== "N/A" ? Poster : "https://via.placeholder.com/300x450?text=No+Poster";
        
        return `
            <div class="movie-card" data-id="${imdbID}">
                <img src="${posterImg}" alt="${Title}">
                <div class="movie-info">
                    <h4>${Title}</h4>
                    <p>${Year} &bull; <span style="text-transform:capitalize">${Type}</span></p>
                </div>
            </div>
        `;
    }).join('');

    // Attach click event listeners to each movie card
    document.querySelectorAll('.movie-card').forEach(card => {
        card.addEventListener('click', () => fetchMovieDetails(card.dataset.id));
    });
};

// Fetch detailed movie info including ratings, release dates, and plot
const fetchMovieDetails = async (imdbID) => {
    try {
        const response = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${imdbID}`);
        const movie = await response.json();

        if (movie.Response === "True") {
            showModal(movie);
        }
    } catch (err) {
        console.error("Error fetching detailed movie info:", err);
    }
};

// Display modal with detailed movie data
const showModal = (movie) => {
    const { Title, Year, Rated, Runtime, Genre, Director, Actors, Plot, Poster, Released, imdbRating } = movie;
    const posterImg = Poster !== "N/A" ? Poster : "https://via.placeholder.com/300x450?text=No+Poster";

    modalBody.innerHTML = `
        <img src="${posterImg}" alt="${Title}">
        <div class="modal-details">
            <h2>${Title} (${Year})</h2>
            <p><strong>Released:</strong> ${Released}</p>
            <p><strong>Rating:</strong> ⭐ ${imdbRating} / 10 (Rated: ${Rated})</p>
            <p><strong>Runtime:</strong> ${Runtime} | <strong>Genre:</strong> ${Genre}</p>
            <p><strong>Director:</strong> ${Director}</p>
            <p><strong>Cast:</strong> ${Actors}</p>
            <p style="margin-top: 8px;"><strong>Plot:</strong> ${Plot}</p>
        </div>
    `;
    modal.classList.remove('hidden');
};

// Modal Close Handlers
closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
});

// Event Listeners for Search Input & Button
movieSearchBtn.addEventListener('click', () => fetchMovies(movieInput.value));
movieInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') fetchMovies(movieInput.value);
});