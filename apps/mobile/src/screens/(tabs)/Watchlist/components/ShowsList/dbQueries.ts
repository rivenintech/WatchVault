import { LocalDB } from "@/src/db/DatabaseProvider";
import { tvEpisodesInDB, tvSeasonsInDB } from "@/src/db/schema";
import { and, eq, getColumns, isNull, sql } from "drizzle-orm";

const episodeOrder = sql<number>`
  cast(
    printf('%03d%03d',
      ${tvSeasonsInDB.season_number},
      ${tvEpisodesInDB.episode_number}
    ) as integer
  )
`;

const firstUnwatchedSubquery = LocalDB.select({
  show_id: tvSeasonsInDB.show_id,
  first_order: sql<number>`min(${episodeOrder})`.as("first_order"),
})
  .from(tvEpisodesInDB)
  .innerJoin(tvSeasonsInDB, eq(tvSeasonsInDB.id, tvEpisodesInDB.season_id))
  .where(isNull(tvEpisodesInDB.watched_date))
  .groupBy(tvSeasonsInDB.show_id)
  .as("first_unwatched");

export const firstUnwatchedQuery = LocalDB.select({
  ...getColumns(tvEpisodesInDB),
  season_name: tvSeasonsInDB.name,
  season_number: tvSeasonsInDB.season_number,
  show_id: tvSeasonsInDB.show_id,
})
  .from(tvEpisodesInDB)
  .innerJoin(tvSeasonsInDB, eq(tvSeasonsInDB.id, tvEpisodesInDB.season_id))
  .innerJoin(
    firstUnwatchedSubquery,
    and(eq(firstUnwatchedSubquery.show_id, tvSeasonsInDB.show_id), eq(firstUnwatchedSubquery.first_order, episodeOrder)),
  );
