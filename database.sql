SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE IF NOT EXISTS `Colleges` (
	`college_id` VARCHAR(255) NOT NULL,
	`college_name` VARCHAR(255),
	`college_code` VARCHAR(255),
	`address` VARCHAR(255),
	`district` VARCHAR(255),
	`state` VARCHAR(255),
	`pincode` VARCHAR(255),
	`contact_person` VARCHAR(255),
	`contact_number` VARCHAR(255),
	`email` VARCHAR(255),
	`status` VARCHAR(255),
	PRIMARY KEY(`college_id`)
);

CREATE TABLE IF NOT EXISTS `Departments` (
	`department_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`college_id` INTEGER,
	`department_name` VARCHAR(255),
	`status` VARCHAR(255),
	PRIMARY KEY(`department_id`)
);

CREATE TABLE IF NOT EXISTS `Users` (
	`user_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`college_id` INTEGER,
	`department_id` INTEGER,
	`full_name` VARCHAR(255),
	`mobile` VARCHAR(255),
	`password` VARCHAR(255),
	`role` VARCHAR(255),
	`status` VARCHAR(255),
	`email` VARCHAR(255),
	`photo` VARCHAR(255),
	`course_id` VARCHAR(255),
	PRIMARY KEY(`user_id`)
);

CREATE TABLE IF NOT EXISTS `BATCH` (
	`batch_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`college_id` INTEGER,
	`batch_name` VARCHAR(255),
	`advisor_id` INTEGER,
	`created_date` DATE,
	`skill_id` INTEGER,
	`status` VARCHAR(255),
	PRIMARY KEY(`batch_id`)
);

CREATE TABLE IF NOT EXISTS `STUDENT` (
	`student_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`user_id` INTEGER,
	`college_id` INTEGER,
	`department_id` INTEGER,
	`batch_id` INTEGER,
	`register_no` VARCHAR(255),
	`cgpa` DECIMAL(4,2),
	`backlog_count` INTEGER,
	`placement_status` VARCHAR(255),
	PRIMARY KEY(`student_id`)
);

CREATE TABLE IF NOT EXISTS `FACULTY_ADVISOR` (
	`advisor_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`user_id` INTEGER,
	`department_id` INTEGER,
	`batch_id` INTEGER,
	`college_id` VARCHAR(255),
	`course_id` VARCHAR(255),
	PRIMARY KEY(`advisor_id`)
);

CREATE TABLE IF NOT EXISTS `PLACEMENT` (
	`drive_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`college_id` INTEGER,
	`company_name` VARCHAR(255),
	`company_website` VARCHAR(255),
	`job_role` VARCHAR(255),
	`package_lpa` DECIMAL(5,2),
	`minimum_cgpa` DECIMAL(4,2),
	`max_backlogs` INTEGER,
	`drive_date` DATE,
	`application_deadline` DATE,
	`status` VARCHAR(50),
	PRIMARY KEY(`drive_id`)
);

CREATE TABLE IF NOT EXISTS `DRIVE_ELIGIBILITY` (
	`eligibility_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`drive_id` INTEGER,
	`department_id` INTEGER,
	`batch` VARCHAR(255),
	PRIMARY KEY(`eligibility_id`)
);

CREATE TABLE IF NOT EXISTS `DRIVE_APPLICATION` (
	`application_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`drive_id` INTEGER,
	`student_id` INTEGER,
	`application_date` DATE,
	`status` ENUM('applied','shortlisted','selected','rejected','withdrawn') DEFAULT 'applied',
	PRIMARY KEY(`application_id`)
);

CREATE TABLE IF NOT EXISTS `SKILL_CATEGORY` (
	`category_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`category_name` VARCHAR(255),
	`description` VARCHAR(255),
	`status` VARCHAR(255),
	PRIMARY KEY(`category_id`)
);

CREATE TABLE IF NOT EXISTS `SKILL_LEVEL` (
	`skill_level_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`level_name` VARCHAR(255),
	`description` VARCHAR(255),
	PRIMARY KEY(`skill_level_id`)
);

CREATE TABLE IF NOT EXISTS `SKILL` (
	`skill_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`skill_name` VARCHAR(255),
	`category_id` INTEGER,
	`description` VARCHAR(255),
	`status` VARCHAR(255),
	PRIMARY KEY(`skill_id`)
);

CREATE TABLE IF NOT EXISTS `STUDENT_SKILL` (
	`student_skill_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`student_id` INTEGER,
	`skill_id` INTEGER,
	`certificate_file` VARCHAR(255),
	`project_proof` VARCHAR(255),
	`status` ENUM('pending','verified','rejected') DEFAULT 'pending',
	`added_date` DATE,
	PRIMARY KEY(`student_skill_id`)
);

CREATE TABLE IF NOT EXISTS `VERIFICATION_REQUEST` (
	`request_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`student_skill_id` INTEGER,
	`advisor_id` INTEGER,
	`request_date` DATETIME,
	`verification_date` DATETIME,
	`status` ENUM('pending','approved','rejected') DEFAULT 'pending',
	`remarks` TEXT,
	PRIMARY KEY(`request_id`)
);

CREATE TABLE IF NOT EXISTS `RECOMMENDATION` (
	`recommendation_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`student_id` INTEGER,
	`advisor_id` INTEGER,
	`recommended_skill_id` INTEGER,
	`recommendation_text` TEXT,
	`recommendation_date` DATE,
	`status` VARCHAR(255),
	PRIMARY KEY(`recommendation_id`)
);

CREATE TABLE IF NOT EXISTS `ACHIEVEMENT` (
	`achievement_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`student_id` INTEGER,
	`achievement_title` VARCHAR(255),
	`achievement_details` TEXT,
	`certificate_details` VARCHAR(255),
	`achievement_type` VARCHAR(100),
	`achievement_date` DATE,
	PRIMARY KEY(`achievement_id`)
);

CREATE TABLE IF NOT EXISTS `BATCH_STUDENT` (
	`batch_student_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`batch_id` INTEGER,
	`student_id` INTEGER,
	`assigned_date` DATE,
	`status` VARCHAR(255),
	PRIMARY KEY(`batch_student_id`)
);

CREATE TABLE IF NOT EXISTS `NOTIFICATION` (
	`notification_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`user_id` INTEGER,
	`title` VARCHAR(255),
	`message` TEXT,
	`created_at` DATETIME,
	`is_read` BOOLEAN DEFAULT FALSE,
	PRIMARY KEY(`notification_id`)
);

CREATE TABLE IF NOT EXISTS `subject` (
	`subject_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`department_id` INTEGER NOT NULL,
	`subject_name` VARCHAR(255),
	`subject_code` VARCHAR(255),
	`semester` INTEGER,
	`credits` INTEGER,
	`subject_type` ENUM('theory','practical','project') NOT NULL DEFAULT 'theory',
	`status` ENUM('active','inactive') DEFAULT 'active',
	PRIMARY KEY(`subject_id`)
);

CREATE TABLE IF NOT EXISTS `QUESTION_CATEGORY` (
	`category_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`category_name` VARCHAR(255) NOT NULL,
	`description` TEXT NOT NULL,
	`parent_category_id` INTEGER,
	`student_id` INTEGER NOT NULL,
	PRIMARY KEY(`category_id`)
);

CREATE TABLE IF NOT EXISTS `QUESTION_BANK` (
	`question_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`subject_id` INTEGER,
	`category_id` INTEGER,
	`topic` VARCHAR(255) NOT NULL,
	`sub_topic` VARCHAR(255) NOT NULL,
	`question_title` VARCHAR(255) NOT NULL,
	`question_text` TEXT NOT NULL,
	`option_a` TEXT NOT NULL,
	`option_b` TEXT NOT NULL,
	`option_c` TEXT NOT NULL,
	`option_d` TEXT NOT NULL,
	`correct_answer` VARCHAR(255) NOT NULL,
	`explanation` TEXT NOT NULL,
	`difficulty` ENUM('easy','medium','hard') NOT NULL DEFAULT 'medium',
	`marks` INTEGER NOT NULL,
	`tags` VARCHAR(255) NOT NULL,
	`question_type` ENUM('mcq','true_false','fill_blank') NOT NULL DEFAULT 'mcq',
	`created_by` INTEGER,
	`uploaded_file` VARCHAR(255) NOT NULL,
	`upload_date` DATETIME NOT NULL,
	`upload_method` ENUM('manual','excel') NOT NULL DEFAULT 'manual',
	PRIMARY KEY(`question_id`)
);

CREATE TABLE IF NOT EXISTS `EXAM` (
	`exam_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`subject_id` INTEGER,
	`created_by` INTEGER,
	`exam_name` VARCHAR(255) NOT NULL,
	`exam_type` VARCHAR(255) NOT NULL,
	`duration` INTEGER NOT NULL,
	`total_marks` INTEGER NOT NULL,
	`passing_marks` INTEGER NOT NULL,
	`start_time` DATETIME NOT NULL,
	`end_time` DATETIME NOT NULL,
	`status` ENUM('draft','active','completed','cancelled') NOT NULL DEFAULT 'draft',
	`negative_marks` DECIMAL(4,2) NOT NULL DEFAULT 0,
	PRIMARY KEY(`exam_id`)
);

CREATE TABLE IF NOT EXISTS `EXAM_QUESTION` (
	`exam_question_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`exam_id` INTEGER,
	`question_id` INTEGER,
	PRIMARY KEY(`exam_question_id`)
);

CREATE TABLE IF NOT EXISTS `EXAM_ASSIGNMENT` (
	`EXAM_ASSIGNMENT` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`exam_id` INTEGER,
	`batch_id` INTEGER,
	`assigned_by` INTEGER,
	`start_date` DATETIME NOT NULL,
	`end_date` DATETIME,
	PRIMARY KEY(`EXAM_ASSIGNMENT`)
);

CREATE TABLE IF NOT EXISTS `STUDENT_EXAM` (
	`student_exam_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`student_id` INTEGER,
	`exam_id` INTEGER,
	`start_time` DATETIME NOT NULL,
	`submit_time` DATETIME NOT NULL,
	`status` ENUM('started','submitted','auto_submitted') NOT NULL DEFAULT 'started',
	PRIMARY KEY(`student_exam_id`)
);

CREATE TABLE IF NOT EXISTS `SCORE_EVALUATION` (
	`evaluation_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`student_exam_id` INTEGER,
	`correct_answers` INTEGER NOT NULL,
	`wrong_answers` INTEGER NOT NULL,
	`unanswered` INTEGER NOT NULL,
	`marks_obtained` DECIMAL(6,2) NOT NULL,
	`percentage` DECIMAL(5,2) NOT NULL,
	`grade` VARCHAR(255) NOT NULL,
	PRIMARY KEY(`evaluation_id`)
);

CREATE TABLE IF NOT EXISTS `RESULT` (
	`result_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`student_id` INTEGER,
	`exam_id` INTEGER,
	`obtained_marks` DECIMAL(6,2) NOT NULL,
	`percentage` DECIMAL(5,2) NOT NULL,
	`grade` VARCHAR(255) NOT NULL,
	`rank` INTEGER NOT NULL,
	`result_status` ENUM('pass','fail') NOT NULL DEFAULT 'fail',
	PRIMARY KEY(`result_id`)
);

CREATE TABLE IF NOT EXISTS `CERTIFICATE` (
	`certificate_id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`student_id` INTEGER,
	`exam_id` INTEGER,
	`generated_by` INTEGER,
	`certificate_path` VARCHAR(255) NOT NULL,
	`generated_date` DATE NOT NULL,
	PRIMARY KEY(`certificate_id`)
);

SET FOREIGN_KEY_CHECKS=1;
