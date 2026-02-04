CREATE TABLE `movies_genres` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `movies` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`overview` text NOT NULL,
	`release_date` text,
	`runtime` integer,
	`backdrop_path` text,
	`poster_path` text,
	`watched_date` text
);
--> statement-breakpoint
CREATE TABLE `movie_to_genre` (
	`movie_id` integer NOT NULL,
	`genre_id` integer NOT NULL,
	PRIMARY KEY(`movie_id`, `genre_id`),
	FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`genre_id`) REFERENCES `movies_genres`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`locale` text NOT NULL,
	`region` text NOT NULL,
	`theme_name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tv_episodes` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`episode_number` integer NOT NULL,
	`overview` text,
	`runtime` integer,
	`air_date` text,
	`vote_average` real,
	`vote_count` integer,
	`watched_date` text,
	`season_id` integer NOT NULL,
	FOREIGN KEY (`season_id`) REFERENCES `tv_seasons`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tv_genres` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tv` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`overview` text NOT NULL,
	`first_air_date` text,
	`backdrop_path` text,
	`poster_path` text
);
--> statement-breakpoint
CREATE TABLE `tv_seasons` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`season_number` integer NOT NULL,
	`overview` text,
	`poster_path` text,
	`show_id` integer NOT NULL,
	FOREIGN KEY (`show_id`) REFERENCES `tv`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tv_to_genres` (
	`show_id` integer NOT NULL,
	`genre_id` integer NOT NULL,
	PRIMARY KEY(`show_id`, `genre_id`),
	FOREIGN KEY (`show_id`) REFERENCES `tv`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`genre_id`) REFERENCES `tv_genres`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE VIEW `next_episodes_view` AS select "tv_episodes"."id", "tv_episodes"."name", "tv_episodes"."episode_number", "tv_episodes"."overview", "tv_episodes"."runtime", "tv_episodes"."air_date", "tv_episodes"."vote_average", "tv_episodes"."vote_count", "tv_episodes"."watched_date", "tv_episodes"."season_id", "tv_seasons"."name", "tv_seasons"."season_number", "tv_seasons"."show_id" from "tv_episodes" inner join "tv_seasons" on "tv_seasons"."id" = "tv_episodes"."season_id" where "tv_episodes"."watched_date" is null group by "tv_seasons"."show_id" order by "tv_seasons"."season_number" asc, "tv_episodes"."episode_number" asc;--> statement-breakpoint
CREATE VIEW `tv_show_status_view` AS select "tv"."id", "tv"."name", "tv"."overview", "tv"."first_air_date", "tv"."backdrop_path", "tv"."poster_path", count("tv_episodes"."watched_date") as "watched_episodes", count("tv_episodes"."id") as "episode_count", CASE
                WHEN COUNT("tv_episodes"."watched_date") = COUNT("tv_episodes"."id") THEN 'watched'
                WHEN COUNT("tv_episodes"."watched_date") > 0 THEN 'watching'
                ELSE 'planned' END as "status" from "tv" inner join "tv_seasons" on "tv_seasons"."show_id" = "tv"."id" inner join "tv_episodes" on "tv_episodes"."season_id" = "tv_seasons"."id" group by "tv"."id";