ALTER TABLE "Exam" ADD COLUMN "markEntryDueDate" DATE, ADD COLUMN "publishDate" DATE;
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_schedule_order" CHECK (("markEntryDueDate" IS NULL OR "markEntryDueDate" >= "date") AND ("publishDate" IS NULL OR "publishDate" >= COALESCE("markEntryDueDate", "date")));
