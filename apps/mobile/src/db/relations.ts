import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  moviesInDB: {
    genres: r.many.moviesGenresInDB({
      from: r.moviesInDB.id.through(r.moviesToGenres.movie_id),
      to: r.moviesGenresInDB.id.through(r.moviesToGenres.genre_id),
    }),
  },
  moviesGenresInDB: {
    movies: r.many.moviesInDB(),
  },
  tvInDB: {
    seasons: r.many.tvSeasonsInDB(),
    genres: r.many.tvGenresInDB({
      from: r.tvInDB.id.through(r.tvToGenres.show_id),
      to: r.tvGenresInDB.id.through(r.tvToGenres.genre_id),
    }),
  },
  tvGenresInDB: {
    tv: r.many.tvInDB(),
  },
  tvSeasonsInDB: {
    show: r.one.tvInDB({
      from: r.tvSeasonsInDB.show_id,
      to: r.tvInDB.id,
      optional: false,
    }),
    episodes: r.many.tvEpisodesInDB(),
  },
  tvEpisodesInDB: {
    season: r.one.tvSeasonsInDB({
      from: r.tvEpisodesInDB.season_id,
      to: r.tvSeasonsInDB.id,
      optional: false,
    }),
  },
}));
