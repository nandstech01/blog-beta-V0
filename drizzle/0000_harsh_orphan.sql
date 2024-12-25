CREATE TABLE `articles` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`category` text NOT NULL,
	`keywords` text,
	`description` text,
	`image` text,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	`views` text DEFAULT '0'
);
