CREATE TABLE `feed` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`active` integer DEFAULT true,
	`creator_uid` integer NOT NULL,
	`private` integer DEFAULT true,
	`last_updated` integer DEFAULT CURRENT_TIMESTAMP,
	`next_check_time` integer NOT NULL,
	`interval` integer DEFAULT 1800,
	`ETag` text
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`feed_id` integer NOT NULL,
	`tags` text,
	`title` text NOT NULL,
	`feed_link` text NOT NULL,
	`lang` text NOT NULL,
	`bookmark` text NOT NULL,
	`error` integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`email` text NOT NULL,
	`enable_email_notify` integer DEFAULT true
);