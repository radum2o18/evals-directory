CREATE TABLE `eval_stats` (
	`eval_path` text PRIMARY KEY NOT NULL,
	`view_count` integer DEFAULT 0 NOT NULL,
	`last_viewed_at` integer,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `eval_stats_view_count_idx` ON `eval_stats` (`view_count`);--> statement-breakpoint
CREATE TABLE `eval_views` (
	`id` text PRIMARY KEY NOT NULL,
	`eval_path` text NOT NULL,
	`viewed_at` integer NOT NULL,
	`visitor_hash` text
);
--> statement-breakpoint
CREATE INDEX `eval_views_path_idx` ON `eval_views` (`eval_path`);--> statement-breakpoint
CREATE INDEX `eval_views_viewed_at_idx` ON `eval_views` (`viewed_at`);



