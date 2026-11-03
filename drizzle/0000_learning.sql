CREATE TABLE `classes` (
 `id` text PRIMARY KEY NOT NULL,
 `label` text NOT NULL,
 `code` text NOT NULL,
 `revision` integer DEFAULT 1 NOT NULL,
 `created` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `classes_code_unique` ON `classes` (`code`);
--> statement-breakpoint
CREATE TABLE `sessions` (
 `token` text PRIMARY KEY NOT NULL,
 `class_id` text NOT NULL REFERENCES `classes`(`id`),
 `number` integer NOT NULL,
 `revision` integer NOT NULL,
 `expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `attempts` (
 `id` text PRIMARY KEY NOT NULL,
 `class_id` text NOT NULL REFERENCES `classes`(`id`),
 `number` integer NOT NULL,
 `round` integer NOT NULL,
 `revision` integer NOT NULL,
 `request_id` text NOT NULL,
 `data` text NOT NULL,
 `created` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `attempt_revision` ON `attempts` (`class_id`,`number`,`round`,`revision`);
--> statement-breakpoint
CREATE UNIQUE INDEX `attempt_request` ON `attempts` (`class_id`,`number`,`request_id`);
