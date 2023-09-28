const express = require("express");
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());
let db = null;

const dbPath = path.join(__dirname, "moviesData.db");
const initializeDbAndServer = async () => {
  const { open } = sqlite;
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3100, () => {
      console.log("server is running ....");
    });
  } catch (e) {
    console.log(`db Error ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();
//get movies
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `  
    select * from movie ; `;
  let moviesList = await db.all(getMoviesQuery);
  console.log(moviesList);
  response.send(
    moviesList.map((eachMovie) => {
      return {
        movieName: eachMovie.movie_name,
      };
    })
  );
});
//create a movie
app.post("/movies/", async (request, response) => {
  let { directorId, movieName, leadActor } = request.body;
  const postMoviesQuery = `  
    INSERT INTO movie(director_id,movie_name,lead_actor)
     VALUES ('${directorId}',
     '${movieName}',
     '${leadActor}') ; `;
  let moviesList = await db.run(postMoviesQuery);
  console.log(moviesList.lastId);
  response.send("Movie Successfully Added");
});
//get movie
app.get("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  const getMovieQuery = `  
    select * from movie where movie_id='${movieId}'  `;
  let movieDetails = await db.all(getMovieQuery);
  response.send(
    movieDetails.map((movie) => {
      return {
        movieId: movie.movie_id,
        directorId: movie.director_id,
        movieName: movie.movie_name,
        leadActor: movie.lead_actor,
      };
    })
  );
});
//update movie
app.put("/movies/:movieId/", async (request, response) => {
  let movieId = request.params;
  let { directorId, movieName, leadActor } = request.body;
  let updateQuery = `
    UPDATE movie 
    SET 
    director_id='${directorId}',
    movie_name='${movieName}',
    lead_actor='${leadActor}'
    where movie_id='${movieId}';
    `;
  await db.run(updateQuery);
  response.send("Movie Details Updated");
});
//delete movie
app.delete("/movies/:movieId/", async (request, response) => {
  let { movieId } = request.params;
  let deleteQuery = `
         DELETE from movie where movie_id='${movieId}';
         `;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});
//get directors
app.get("/directors/", async (request, response) => {
  let getDirectorsQuery = `
    select * from director ;
    `;
  let directorsDetails = await db.all(getDirectorsQuery);

  response.send(
    directorsDetails.map((eachDirector) => {
      return {
        directorId: eachDirector.director_id,
        directorName: eachDirector.director_name,
      };
    })
  );
});
//get specific movie directed by director
app.get("/directors/:directorId/movies/", async (request, response) => {
  let { directorId } = request.params;
  getMoviesQuery = `
    select movie_name from movie where director_id ='${directorId}'
    `;
  let moviesList = await db.all(getMoviesQuery);
  response.send(
    moviesList.map((eachMovie) => {
      return {
        movieName: eachMovie.movie_name,
      };
    })
  );
});
