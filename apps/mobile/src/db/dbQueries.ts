import { asc, count, eq, getTableColumns, isNotNull, isNull, or, sum } from "drizzle-orm";
import { LocalDB } from "./DatabaseProvider";
import {
  moviesGenresInDB,
  moviesInDB,
  moviesToGenres,
  tvEpisodesInDB,
  tvGenresInDB,
  tvInDB,
  tvSeasonsInDB,
  tvShowStatusView,
  tvToGenres,
} from "./schema";

export const nextEpisodesQuery = LocalDB.select({
  ...getTableColumns(tvEpisodesInDB),
  season_name: tvSeasonsInDB.name,
  season_number: tvSeasonsInDB.season_number,
  show_id: tvSeasonsInDB.show_id,
})
  .from(tvEpisodesInDB)
  .innerJoin(tvSeasonsInDB, eq(tvSeasonsInDB.id, tvEpisodesInDB.season_id))
  .where(isNull(tvEpisodesInDB.watched_date))
  .orderBy(asc(tvSeasonsInDB.season_number), asc(tvEpisodesInDB.episode_number))
  .groupBy(tvSeasonsInDB.show_id);

export const plannedMoviesQuery = LocalDB.query.moviesInDB.findMany({
  where: isNull(moviesInDB.watched_date),
});

export const watchedMoviesQuery = LocalDB.query.moviesInDB.findMany({
  where: isNotNull(moviesInDB.watched_date),
});

export const movieWithGenresQuery = (id: number) =>
  LocalDB.query.moviesInDB.findFirst({
    where: eq(moviesInDB.id, id),
    with: { genres: { with: { genre: true } } },
  });

export const tvWithGenresQuery = (id: number) =>
  LocalDB.query.tvInDB.findFirst({
    where: eq(tvInDB.id, id),
    with: {
      genres: { with: { genre: true } },
    },
  });

export const tvSeasonsQuery = (id: number) =>
  LocalDB.select({
    ...getTableColumns(tvSeasonsInDB),
    watched_episodes: count(tvEpisodesInDB.watched_date),
    episode_count: count(tvEpisodesInDB.id),
  })
    .from(tvSeasonsInDB)
    .innerJoin(tvEpisodesInDB, eq(tvEpisodesInDB.season_id, tvSeasonsInDB.id))
    .where(eq(tvSeasonsInDB.show_id, id))
    .groupBy(tvEpisodesInDB.season_id)
    .orderBy(asc(tvSeasonsInDB.season_number));

export const statsMoviesQuery = LocalDB.select({ total: count(moviesInDB.watched_date), totalTime: sum(moviesInDB.runtime) })
  .from(moviesInDB)
  .where(isNotNull(moviesInDB.watched_date));

export const statsMoviesGenresQuery = LocalDB.select({
  id: moviesGenresInDB.id,
  name: moviesGenresInDB.name,
  value: count(moviesGenresInDB.id),
})
  .from(moviesToGenres)
  .innerJoin(moviesInDB, eq(moviesToGenres.movie_id, moviesInDB.id))
  .innerJoin(moviesGenresInDB, eq(moviesToGenres.genre_id, moviesGenresInDB.id))
  .where(isNotNull(moviesInDB.watched_date))
  .groupBy(moviesGenresInDB.name);

export const statsTvQuery = LocalDB.select({
  totalTime: sum(tvEpisodesInDB.runtime),
  totalEpisodes: count(tvEpisodesInDB.id),
})
  .from(tvInDB)
  .innerJoin(tvSeasonsInDB, eq(tvInDB.id, tvSeasonsInDB.show_id))
  .innerJoin(tvEpisodesInDB, eq(tvSeasonsInDB.id, tvEpisodesInDB.season_id))
  .where(isNotNull(tvEpisodesInDB.watched_date));

export const finishedTvQuery = LocalDB.select({
  total: count(tvShowStatusView.id),
})
  .from(tvShowStatusView)
  .where(eq(tvShowStatusView.status, "watched"));

export const statsTvGenresQuery = LocalDB.select({
  id: tvGenresInDB.id,
  name: tvGenresInDB.name,
  value: count(tvGenresInDB.id),
})
  .from(tvToGenres)
  .innerJoin(tvShowStatusView, eq(tvToGenres.show_id, tvShowStatusView.id))
  .innerJoin(tvGenresInDB, eq(tvToGenres.genre_id, tvGenresInDB.id))
  .where(or(eq(tvShowStatusView.status, "watched"), eq(tvShowStatusView.status, "watching")))
  .groupBy(tvGenresInDB.name);

export const tvGenresQuery = (id: number) =>
  LocalDB.select({
    genreId: tvGenresInDB.id,
    name: tvGenresInDB.name,
  })
    .from(tvShowStatusView)
    .innerJoin(tvToGenres, eq(tvToGenres.show_id, tvShowStatusView.id))
    .innerJoin(tvGenresInDB, eq(tvGenresInDB.id, tvToGenres.genre_id));
