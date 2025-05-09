'use strict';

import { Database } from 'sqlite3';
import { Request, Response } from 'express';

export const getAllMovies = (db: Database, req: Request, res: Response): void => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 50;
  const offset = (page - 1) * limit;

  const query = `
    SELECT imdb_id, title, genres, release_date, budget
    FROM movies
    LIMIT ? OFFSET ?;
  `;

  db.all(query, [limit, offset], (err: Error | null, rows: any[]) => {
    if (err) {
      res.status(500).send(JSON.stringify(err));
      return;
    }

    if (rows.length === 0) {
      res.status(404).send('No movies found');
      return;
    }

    const formattedRows = rows.map(row => ({
      imdb_id: row.imdb_id,
      title: row.title,
      genres: JSON.parse(row.genres),
      release_date: row.release_date,
      budget: `$${Number(row.budget).toLocaleString()}`
    }));

    res.send({
      page,
      count: formattedRows.length,
      results: formattedRows
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