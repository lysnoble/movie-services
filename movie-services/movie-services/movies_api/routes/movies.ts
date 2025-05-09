'use strict';

import { Database } from 'sqlite3';
import { Request, Response } from 'express';

//AC 1
export const getAllMovies = (db: Database, req: Request, res: Response): void => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 50;
  const offset = (page - 1) * limit;

  const query = `
    SELECT 
      imdb_id, 
      title, 
      genres, 
      release_date, 
      budget
    FROM movies
    LIMIT ? OFFSET ?;
  `;

  db.all(query, [limit, offset], (err: Error | null, rows: any[]) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (!rows.length) {
      res.status(404).json({ message: 'No movies found' });
      return;
    }

    const formattedRows = rows.map(row => ({
      imdb_id: row.imdb_id,
      title: row.title,
      genres: JSON.parse(row.genres),
      release_date: row.release_date,
      budget: `$${Number(row.budget).toLocaleString()}`
    }));

    res.json({
      page,
      count: formattedRows.length,
      results: formattedRows
    });
  });
};

//ac 3
export const getMoviesByYear = (db: Database, req: Request, res: Response): void => {
  const year = req.params.year;
  const page = parseInt(req.query.page as string) || 1;
  const order = req.query.order === 'desc' ? 'DESC' : 'ASC';
  const limit = 50;
  const offset = (page - 1) * limit;

  const query = `
    SELECT imdbId, title, genres, release_date, budget
    FROM movies
    WHERE strftime('%Y', release_date) = ?
    ORDER BY release_date ${order}
    LIMIT ? OFFSET ?;
  `;

  db.all(query, [year, limit, offset], (err: Error | null, rows: any[]) => {
    if (err) {
      res.status(500).send(JSON.stringify(err));
      return;
    }

    if (rows.length === 0) {
      res.status(404).send('No movies found for the specified year');
      return;
    }

    const formattedRows = rows.map(row => ({
      ...row,
      budget: `$${parseInt(row.budget).toLocaleString()}`
    }));

    res.send(formattedRows);
  });
};

//AC 4
export const getMoviesByGenre = (db: Database, req: Request, res: Response): void => {
  const genreQuery = req.query.genre?.toString();
  const page = parseInt(req.query.page as string) || 1;
  const limit = 50;
  const offset = (page - 1) * limit;

  if (!genreQuery) {
    res.status(400).json({ error: 'Genre query parameter is required' });
    return;
  }

  const query = `SELECT imdb_id, title, genres, release_date, budget FROM movies`;

  db.all(query, [], (err: Error | null, rows: any[]) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    const filteredMovies = rows.filter(row => {
      try {
        const genres = JSON.parse(row.genres);
        return genres.some((g: { name: string }) => g.name.toLowerCase() === genreQuery.toLowerCase());
      } catch {
        return false;
      }
    });

    const paginatedMovies = filteredMovies.slice(offset, offset + limit).map(row => ({
      imdb_id: row.imdb_id,
      title: row.title,
      genres: JSON.parse(row.genres),
      release_date: row.release_date,
      budget: `$${Number(row.budget).toLocaleString()}`
    }));

    if (paginatedMovies.length === 0) {
      res.status(404).json({ message: 'No movies found for the specified genre' });
      return;
    }

    res.json({
      page,
      count: paginatedMovies.length,
      results: paginatedMovies
    });
  });
};


export const getMovie = (db: Database, req: Request, res: Response): void => {
  const query = 'SELECT * FROM movies WHERE movieId = ?';

  db.all(query, [req.params.movieId], (err: Error | null, rows: any[]) => {
    if (err) {
      res.status(500).send(JSON.stringify(err));
      return; // Ensure to return after sending a response
    }

    if (rows.length === 0) {
      res.status(404).send('Movie not found'); // Send a response for 404
      return; // Ensure to return after sending a response
    }

    res.send(rows);
  });
};