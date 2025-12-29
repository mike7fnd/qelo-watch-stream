# **App Name**: Qelo

## Core Features:

- Movie Listing: Display a curated list of movies from The Movie Database (TMDb) API using the provided API key and access token. API key: 9de9190cc0054e4675cbd4571c5ec33a. API read access token: eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5ZGU5MTkwY2MwMDU0ZTQ2NzVjYmQ0NTcxYzVlYzMzYSIsIm5iZiI6MTc2Njk3NDExNS45ODMsInN1YiI6IjY5NTFlMmEzODM0NTgwZmM5OWU0MTI5ZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.lMH8q8j1kFc22kCTBb6Vg3pWd6m8rQXPgixlObmR8BQ.
- Movie Details: Show detailed information about a selected movie, including title, description, rating, genre, and runtime. Data comes from The Movie Database API.
- Movie Streaming: Integrate Vidking to embed movie streams using the provided Generated URL Embed URL: https://www.vidking.net/embed/movie/1078605?color=e50914, API routes: Movies /embed/movie/{tmdbId} (Replace {tmdbId} with the TMDB movie ID). The app shows movies, not TV series.
- Watch Progress Tracking: Enable users to track the play progress; use a tool (AI) to analyze the watch event details from vidking player and record to the local browser using `localStorage` for maintaining watch progress and history.The events that can be captured are: 'timeupdate', 'play', 'pause', 'ended', and 'seeked'
- Home Screen: Display featured movie, categories (movies, series, my list). Mimic 'pixel perfect ui'.
- Search Functionality: Implement a search bar that allows users to find movies by title, making use of the themoviedb.org's API.
- YouTube Trailer: Embed YouTube trailers for each movie, fetched using the themoviedb.org's API or a similar service.

## Style Guidelines:

- Primary color: #FFFFFF (White) for clean text and elements, contrasting against the dark background.
- Background color: #121212 (Very Dark Gray) to provide a cinematic dark mode experience, enhancing contrast and focus.
- Accent color: #FF69B4 (Bright Pink) as the primary color for interactive elements, call-to-action buttons, and highlights.
- Body and headline font: 'Inter', a sans-serif font known for its readability and modern aesthetic; great for both headlines and body text.
- Mobile-centered layout that ensures a pixel-perfect UI; maintain the aspect ratio and responsiveness across various screen sizes, optimizing content for portrait mode.
- Use minimalistic, white icons for navigation and controls; maintain consistency in style and size.
- Subtle fade-in animations and transitions to enhance user experience without being distracting; touch-responsive elements providing haptic feedback.