CREATE TABLE `access_attempts` (
	`client_key` text PRIMARY KEY NOT NULL,
	`failures` integer NOT NULL,
	`started_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `access_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`salt` text NOT NULL,
	`password_hash` text NOT NULL,
	`session_key` text NOT NULL,
	`revision` text NOT NULL,
	`updated_at` integer NOT NULL
);
