DROP VIEW `tv_show_status_view`;--> statement-breakpoint
CREATE VIEW `tv_show_status_view` AS select "tv"."id", "tv"."name", "tv"."overview", "tv"."first_air_date", "tv"."backdrop_path", "tv"."poster_path", count("tv_episodes"."watched_date") as "watched_episodes", count("tv_episodes"."id") as "episode_count", sum("tv_episodes"."runtime") as "total_runtime", CASE
                WHEN COUNT("tv_episodes"."watched_date") = COUNT("tv_episodes"."id") THEN 'watched'
                WHEN COUNT("tv_episodes"."watched_date") > 0 THEN 'watching'
                ELSE 'planned' END as "status" from "tv" inner join "tv_seasons" on "tv_seasons"."show_id" = "tv"."id" inner join "tv_episodes" on "tv_episodes"."season_id" = "tv_seasons"."id" group by "tv"."id";