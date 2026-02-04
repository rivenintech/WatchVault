import { count, eq, getColumns, sql, sum } from "drizzle-orm";
import { int, primaryKey, real, sqliteTable, sqliteView, text } from "drizzle-orm/sqlite-core";

export const settingsInDB = sqliteTable("settings", {
  id: int().primaryKey({ autoIncrement: true }),
  locale: text().notNull(),
  region: text().notNull(),
  theme_name: text().notNull(),
});

export const moviesInDB = sqliteTable("movies", {
  id: int().primaryKey(),
  title: text().notNull(),
  overview: text().notNull(),
  release_date: text(),
  runtime: int(),
  backdrop_path: text(),
  poster_path: text(),
  watched_date: text(),
});

export const moviesGenresInDB = sqliteTable("movies_genres", {
  id: int().primaryKey(),
  name: text().notNull(),
});

export const moviesToGenres = sqliteTable(
  "movie_to_genre",
  {
    movie_id: int()
      .references(() => moviesInDB.id, { onDelete: "cascade" })
      .notNull(),
    genre_id: int()
      .references(() => moviesGenresInDB.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.movie_id, table.genre_id] })],
);

export const tvInDB = sqliteTable("tv", {
  id: int().primaryKey(),
  name: text().notNull(),
  overview: text().notNull(),
  first_air_date: text(),
  backdrop_path: text(),
  poster_path: text(),
});

export const tvGenresInDB = sqliteTable("tv_genres", {
  id: int().primaryKey(),
  name: text().notNull(),
});

export const tvToGenres = sqliteTable(
  "tv_to_genres",
  {
    show_id: int()
      .references(() => tvInDB.id, { onDelete: "cascade" })
      .notNull(),
    genre_id: int()
      .references(() => tvGenresInDB.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.show_id, table.genre_id] })],
);

export const tvSeasonsInDB = sqliteTable("tv_seasons", {
  id: int().primaryKey(),
  name: text().notNull(),
  season_number: int().notNull(),
  overview: text(),
  poster_path: text(),
  show_id: int()
    .references(() => tvInDB.id, { onDelete: "cascade" })
    .notNull(),
});

export const tvEpisodesInDB = sqliteTable("tv_episodes", {
  id: int().primaryKey(),
  name: text().notNull(),
  episode_number: int().notNull(),
  overview: text(),
  runtime: int(),
  air_date: text(),
  vote_average: real(),
  vote_count: int(),
  watched_date: text(),
  season_id: int()
    .references(() => tvSeasonsInDB.id, { onDelete: "cascade" })
    .notNull(),
});

// Views
export const tvShowStatusView = sqliteView("tv_show_status_view").as((qb) =>
  qb
    .select({
      ...getColumns(tvInDB),
      watched_episodes: count(tvEpisodesInDB.watched_date).as("watched_episodes"),
      episode_count: count(tvEpisodesInDB.id).as("episode_count"),
      total_runtime: sum(tvEpisodesInDB.runtime).as("total_runtime"),
      status: sql<"planned" | "watched" | "watching">`CASE
                WHEN COUNT(${tvEpisodesInDB.watched_date}) = COUNT(${tvEpisodesInDB.id}) THEN 'watched'
                WHEN COUNT(${tvEpisodesInDB.watched_date}) > 0 THEN 'watching'
                ELSE 'planned' END`.as("status"),
    })
    .from(tvInDB)
    .innerJoin(tvSeasonsInDB, eq(tvSeasonsInDB.show_id, tvInDB.id))
    .innerJoin(tvEpisodesInDB, eq(tvEpisodesInDB.season_id, tvSeasonsInDB.id))
    .groupBy(tvInDB.id),
);

// export type TypeTvShowStatusView = typeof tvShowStatusView.$inferSelect;
