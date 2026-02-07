import { LocalDB } from "@/src/db/DatabaseProvider";
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
} from "@/src/db/schema";
import { count, eq, isNotNull, or, sum } from "drizzle-orm";

export const movieDetailsQuery = LocalDB.select({
  total: count(moviesInDB.watched_date),
  totalTime: sum(moviesInDB.runtime).mapWith(Number),
})
  .from(moviesInDB)
  .where(isNotNull(moviesInDB.watched_date));

export const TvDetailsQuery = LocalDB.select({
  totalTime: sum(tvEpisodesInDB.runtime),
  totalEpisodes: count(),
})
  .from(tvInDB)
  .innerJoin(tvSeasonsInDB, eq(tvInDB.id, tvSeasonsInDB.show_id))
  .innerJoin(tvEpisodesInDB, eq(tvSeasonsInDB.id, tvEpisodesInDB.season_id))
  .where(isNotNull(tvEpisodesInDB.watched_date));

export const moviesGenresStatsQuery = LocalDB.select({
  id: moviesGenresInDB.id,
  name: moviesGenresInDB.name,
  value: count(),
})
  .from(moviesToGenres)
  .innerJoin(moviesInDB, eq(moviesToGenres.movie_id, moviesInDB.id))
  .innerJoin(moviesGenresInDB, eq(moviesToGenres.genre_id, moviesGenresInDB.id))
  .where(isNotNull(moviesInDB.watched_date))
  .groupBy(moviesGenresInDB.id);

export const tvGenresStatsQuery = LocalDB.select({
  id: tvGenresInDB.id,
  name: tvGenresInDB.name,
  value: count(),
})
  .from(tvToGenres)
  .innerJoin(tvShowStatusView, eq(tvToGenres.show_id, tvShowStatusView.id))
  .innerJoin(tvGenresInDB, eq(tvToGenres.genre_id, tvGenresInDB.id))
  .where(or(eq(tvShowStatusView.status, "watched"), eq(tvShowStatusView.status, "watching")))
  .groupBy(tvGenresInDB.name);

export const completedShowsQuery = LocalDB.select({
  total: count(),
})
  .from(tvShowStatusView)
  .where(eq(tvShowStatusView.status, "watched"));
