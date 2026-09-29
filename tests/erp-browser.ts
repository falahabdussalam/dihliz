import "dotenv/config";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { randomBytes, createHash } from "node:crypto";
import { readFile, mkdir } from "node:fs/promises";
import { prisma } from "../lib/prisma";
const require = createRequire(process.cwd() + "/package.json");
const {
  chromium,
} = require("C:/Users/ASUS/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const base = process.env.SCHOOL_TEST_URL ?? "http://localhost:3110";
const tag = "erp-" + Date.now();
let browser: any;
async function waitFor(check: () => Promise<boolean>, message: string) {
  for (let n = 0; n < 80; n++) {
    if (await check()) return;
    await new Promise((r) => setTimeout(r, 250));
  }
  throw Error(message);
}
async function account(role: "SUPER_ADMIN" | "CLASS_MENTOR" | "SUBJECT_TUTOR") {
  const user = await prisma.user.create({
    data: {
      email: tag + role + "@example.invalid",
      fullName: "ERP test " + role,
      role,
      passwordHash: "disabled-test-login",
    },
  });
  const token = randomBytes(32).toString("base64url");
  await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash: createHash("sha256").update(token).digest("hex"),
      expiresAt: new Date(Date.now() + 3600000),
    },
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  await context.addCookies([
    { name: "dihliz_session", value: token, url: base },
  ]);
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  return { user, page, context };
}
async function main() {
  const branchUrl = (await readFile(".local/erp-test-url.txt", "utf8")).trim();
  assert.equal(
    new URL(process.env.DATABASE_URL!).hostname,
    new URL(branchUrl).hostname,
    "Browser tests must use the isolated branch",
  );

  browser = await chromium.launch({ channel: "msedge", headless: true });
  const admin = await account("SUPER_ADMIN"),
    mentor = await account("CLASS_MENTOR"),
    page = admin.page;
  const errors: string[] = [];
  page.on("pageerror", (e: Error) => errors.push(e.message));
  const year = await prisma.academicYear.findFirstOrThrow({
    where: { isActive: true },
  });
  const cohorts = await prisma.academicCohort.findMany({
    where: {
      academicYearId: year.id,
      isArchived: false,
      studentEnrollments: { some: { status: "ACTIVE" } },
      subjects: { some: { isArchived: false } },
    },
    take: 2,
  });
  assert.equal(cohorts.length, 2);
  const previous = await prisma.attendanceRegister.findMany({
    where: {
      cohortId: { in: cohorts.map((c) => c.id) },
      date: new Date("2026-09-20"),
    },
    select: { id: true },
  });
  await prisma.attendanceEntry.deleteMany({
    where: { registerId: { in: previous.map((r) => r.id) } },
  });
  await prisma.attendanceRegister.deleteMany({
    where: { id: { in: previous.map((r) => r.id) } },
  });
  const previousEvaluations = await prisma.performanceRegister.findMany({
    where: {
      cohortId: cohorts[0].id,
      month: new Date("2026-09-01"),
      category: "CLASS_BEHAVIOUR",
    },
    select: { id: true },
  });
  await prisma.performanceEntry.deleteMany({
    where: { registerId: { in: previousEvaluations.map((r) => r.id) } },
  });
  await prisma.performanceRegister.deleteMany({
    where: { id: { in: previousEvaluations.map((r) => r.id) } },
  });
  const cohort = cohorts[0],
    student = await prisma.studentEnrollment.findFirstOrThrow({
      where: { cohortId: cohort.id },
      include: { student: true },
    });
  await prisma.staffAssignment.create({
    data: {
      userId: mentor.user.id,
      academicYearId: year.id,
      cohortId: cohort.id,
      role: "CLASS_MENTOR",
    },
  });
  await page.goto(base + "/dashboard/students?year=" + year.id);
  await page.getByRole("button", { name: "Add student", exact: true }).click();
  await page.getByRole("dialog").waitFor();
  await page.getByLabel("Full name", { exact: true }).fill("Unsaved test");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Keep editing", exact: true }).click();
  assert.equal(
    await page.getByLabel("Full name", { exact: true }).inputValue(),
    "Unsaved test",
  );
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Discard changes", exact: true })
    .click();
  assert.equal(await page.getByRole("dialog").count(), 0);
  assert.equal(
    await page
      .getByRole("button", { name: "Add student", exact: true })
      .evaluate((el: HTMLElement) => el === document.activeElement),
    true,
  );
  console.log("PASS modal Escape, unsaved protection and focus restoration");
  await page.getByRole("button", { name: "Add student", exact: true }).click();
  const create = page.getByRole("dialog");
  await create.getByLabel("Full name", { exact: true }).fill(tag + " student");
  await create.locator('select[name="cohortId"]').selectOption(cohort.id);
  await create
    .getByLabel("Parent / guardian", { exact: true })
    .fill(tag + " guardian");
  await create.getByLabel("Contact number", { exact: true }).fill("1234567890");
  await create
    .getByRole("button", { name: "Create student", exact: true })
    .click();
  await waitFor(
    async () =>
      !!(await prisma.student.findFirst({
        where: { fullName: tag + " student" },
      })),
    "Student create",
  );
  const added = await prisma.student.findFirstOrThrow({
    where: { fullName: tag + " student" },
    include: { guardians: true, contacts: true },
  });
  assert.match(added.studentNumber, /^DWS-\d+$/);
  await page.goto(
    base +
      "/dashboard/students/" +
      added.id +
      "?year=" +
      year.id +
      "&tab=profile",
  );
  await page.getByRole("button", { name: "Edit profile", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByLabel("Full name", { exact: true })
    .fill(tag + " updated");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Save changes", exact: true })
    .click();
  await waitFor(
    async () =>
      (await prisma.student.findUniqueOrThrow({ where: { id: added.id } }))
        .fullName ===
      tag + " updated",
    "Profile update",
  );
  await page.reload();
  await page
    .getByRole("button", { name: "Edit guardian", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByLabel("Guardian name", { exact: true })
    .fill(tag + " guardian updated");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Save guardian", exact: true })
    .click();
  await waitFor(
    async () =>
      (
        await prisma.studentGuardian.findUniqueOrThrow({
          where: { id: added.guardians[0].id },
        })
      ).fullName ===
      tag + " guardian updated",
    "Guardian update",
  );
  await page.reload();
  await page.getByRole("button", { name: "Edit contact", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByLabel("International number", { exact: true })
    .fill("+919876543210");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Save contact", exact: true })
    .click();
  await waitFor(
    async () =>
      (
        await prisma.studentContact.findUniqueOrThrow({
          where: { id: added.contacts[0].id },
        })
      ).normalizedPhone === "+919876543210",
    "Contact update",
  );
  console.log(
    "PASS permanent ID creation and profile, guardian and contact dialogs",
  );

  const profile =
    base + "/dashboard/students/" + student.studentId + "?year=" + year.id;
  for (const tab of [
    "overview",
    "profile",
    "academics",
    "attendance",
    "examinations",
    "performance",
    "achievements",
    "reports",
  ]) {
    await page.goto(profile + "&tab=" + tab);
    await page
      .getByRole("heading", { name: student.student.fullName })
      .first()
      .waitFor();
    assert.equal(
      await page
        .locator('nav a[aria-current="page"]')
        .filter({ hasText: tab[0].toUpperCase() + tab.slice(1) })
        .count(),
      1,
    );
  }
  console.log("PASS all bookmarkable student tabs");
  await page.goto(base + "/dashboard/attendance?year=" + year.id);
  await page
    .getByRole("button", { name: "Open register", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .locator('select[name="cohort"]')
    .selectOption(cohort.id);
  await page
    .getByRole("dialog")
    .getByLabel("Date", { exact: true })
    .fill("2026-09-20");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Continue to attendance", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Open missing daily registers" })
    .click();
  await waitFor(
    async () =>
      !!(await prisma.attendanceRegister.findUnique({
        where: {
          cohortId_date: { cohortId: cohort.id, date: new Date("2026-09-20") },
        },
      })),
    "Attendance register creation",
  );
  const register = await prisma.attendanceRegister.findUniqueOrThrow({
    where: {
      cohortId_date: { cohortId: cohort.id, date: new Date("2026-09-20") },
    },
    include: { entries: true },
  });
  assert.ok(register.entries.every((e) => e.status === null));
  await page.goto(base + "/dashboard/attendance/" + register.id);
  await page
    .getByText("Submit this register after saving", { exact: false })
    .click();
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await page
    .getByRole("alert")
    .filter({ hasText: "Every student needs a status" })
    .waitFor();
  assert.equal(
    (
      await prisma.attendanceRegister.findUniqueOrThrow({
        where: { id: register.id },
      })
    ).revision,
    0,
  );
  await page
    .getByRole("button", { name: "Mark all Present", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Mark whole class Off", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByLabel("Reason", { exact: true })
    .fill("School holiday");
  await page
    .getByRole("button", { name: "Confirm whole class Off", exact: true })
    .click();
  await page.locator('input[name="intent"]').check();
  const requestPromise = page.waitForRequest(
    (r: any) => r.method() === "POST" && !!r.headers()["next-action"],
  );
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  const savedRequest = await requestPromise;
  await waitFor(
    async () =>
      (
        await prisma.attendanceRegister.findUniqueOrThrow({
          where: { id: register.id },
        })
      ).status === "SUBMITTED",
    "Attendance submit",
  );
  assert.equal(
    await prisma.attendanceEntry.count({
      where: { registerId: register.id, status: "OFF" },
    }),
    register.entries.length,
  );
  const replay = await page.request.post(savedRequest.url(), {
    headers: {
      "next-action": savedRequest.headers()["next-action"],
      "content-type": savedRequest.headers()["content-type"],
    },
    data: savedRequest.postDataBuffer(),
  });
  assert.match(await replay.text(), /Reopen this register|changed while/);
  await mentor.page.goto(base + "/dashboard/attendance/" + register.id);
  assert.equal(
    await mentor.page
      .getByRole("button", { name: "Reopen for correction", exact: true })
      .count(),
    1,
  );
  const outsider = await prisma.attendanceRegister.create({
    data: { cohortId: cohorts[1].id, date: new Date("2026-09-20") },
  });
  const denied = await mentor.page.goto(
    base + "/dashboard/attendance/" + outsider.id,
  );
  assert.ok([200, 404].includes(denied.status()));
  await mentor.page
    .getByRole("heading", { name: "404", exact: true })
    .waitFor();
  const forged = await mentor.page.request.post(savedRequest.url(), {
    headers: {
      "next-action": savedRequest.headers()["next-action"],
      "content-type": savedRequest.headers()["content-type"],
    },
    data: savedRequest
      .postDataBuffer()
      .toString()
      .replaceAll(register.id, outsider.id),
  });
  assert.match(await forged.text(), /do not have access/);
  console.log(
    "PASS attendance blank submission, bulk Off, stale replay and class scope",
  );
  await page.goto(base + "/dashboard/performance?year=" + year.id);
  await page
    .getByRole("button", { name: "Open register", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .locator('select[name="cohortId"]')
    .selectOption(cohort.id);
  await page
    .getByRole("dialog")
    .getByLabel("Month (first day)", { exact: true })
    .fill("2026-09-01");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Open register", exact: true })
    .click();
  await waitFor(
    async () =>
      !!(await prisma.performanceRegister.findUnique({
        where: {
          cohortId_month_category: {
            cohortId: cohort.id,
            month: new Date("2026-09-01"),
            category: "CLASS_BEHAVIOUR",
          },
        },
      })),
    "Performance register creation",
  );
  const evaluation = await prisma.performanceRegister.findUniqueOrThrow({
    where: {
      cohortId_month_category: {
        cohortId: cohort.id,
        month: new Date("2026-09-01"),
        category: "CLASS_BEHAVIOUR",
      },
    },
  });
  await page.goto(base + "/dashboard/performance/" + evaluation.id);
  const scores = page.locator('input[name^="score:"]');
  for (let i = 0; i < (await scores.count()); i++)
    await scores.nth(i).fill(i % 2 ? "NA" : "0");
  await page
    .getByText("Submit this register after saving", { exact: false })
    .click();
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await waitFor(
    async () =>
      (
        await prisma.performanceRegister.findUniqueOrThrow({
          where: { id: evaluation.id },
        })
      ).status === "SUBMITTED",
    "Performance submit",
  );
  await page.reload();
  await page
    .getByRole("button", { name: "Approve evaluation", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Approve and lock", exact: true })
    .click();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await waitFor(
    async () =>
      (
        await prisma.performanceRegister.findUniqueOrThrow({
          where: { id: evaluation.id },
        })
      ).status === "LOCKED",
    "Performance lock",
  );
  console.log("PASS monthly zero/NA, submit and approval");
  await page.goto(base + "/dashboard/exams?year=" + year.id);
  await page
    .getByRole("button", { name: "Create examination", exact: true })
    .click();
  await page.getByRole("dialog").getByLabel("Name", { exact: true }).fill(tag);
  await page
    .getByRole("dialog")
    .getByLabel("Exam date", { exact: true })
    .fill("2026-09-20");
  await page
    .getByRole("dialog")
    .getByLabel("Mark entry due date", { exact: true })
    .fill("2026-09-25");
  await page
    .getByRole("dialog")
    .getByLabel("Publish date", { exact: true })
    .fill("2026-09-26");
  await page
    .getByRole("dialog")
    .getByLabel("Select all classes", { exact: false })
    .check();
  const selectedClasses = page
    .getByRole("dialog")
    .locator('input[name="cohortIds"]');
  for (const checkbox of await selectedClasses.all())
    assert.equal(await checkbox.isChecked(), true);
  await page
    .getByRole("dialog")
    .getByLabel("Select all classes", { exact: false })
    .uncheck();
  for (const c of cohorts)
    await page
      .getByRole("dialog")
      .locator('input[value="' + c.id + '"]')
      .check();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Create examination", exact: true })
    .click();
  await waitFor(
    async () =>
      !!(await prisma.examination.findFirst({ where: { title: tag } })),
    "Shared exam creation",
  );
  const event = await prisma.examination.findFirstOrThrow({
    where: { title: tag },
    include: { exams: { include: { subjects: true, candidates: true } } },
  });
  assert.equal(event.exams.length, 2);
  assert.ok(event.exams.every((e) => e.subjects.length && e.candidates.length));
  for (const tab of ["overview", "marks", "analysis", "subjects", "results"]) {
    await page.goto(
      base + "/dashboard/exams/" + event.exams[0].id + "?tab=" + tab,
    );
    await page.getByRole("heading", { name: tag, exact: true }).waitFor();
  }
  await page.goto(
    base + "/dashboard/exams/" + event.exams[0].id + "?tab=marks",
  );
  const marks = page.locator('input[name^="mark:"]');
  await marks.first().fill("10");
  await page.getByRole("button", { name: "Save marks", exact: true }).click();
  await waitFor(
    async () =>
      (await prisma.examMark.count({ where: { examId: event.exams[0].id } })) >
      0,
    "Mark save",
  );
  await page.goto(
    base + "/dashboard/exams/" + event.exams[0].id + "?tab=subjects",
  );
  const marked = await prisma.examMark.findFirstOrThrow({
    where: { examId: event.exams[0].id },
  });
  const markedSubject = await prisma.examSubject.findUniqueOrThrow({
    where: { id: marked.examSubjectId },
  });
  await page
    .getByRole("button", { name: "Edit " + markedSubject.name, exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByLabel("Maximum", { exact: true })
    .fill("200");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Save changes", exact: true })
    .click();
  await page.getByRole("alert").filter({ hasText: "has marks" }).waitFor();
  assert.equal(
    (
      await prisma.examSubject.findUniqueOrThrow({
        where: { id: marked.examSubjectId },
      })
    ).maxMarks,
    markedSubject.maxMarks,
  );
  console.log(
    "PASS shared exams, mark entry and protection of marked subject settings",
  );
  await page.goto(profile + "&tab=achievements");
  await page
    .getByRole("button", { name: "Add achievement", exact: true })
    .click();
  await page.getByRole("dialog").getByLabel("Title", { exact: true }).fill(tag);
  await page
    .getByRole("dialog")
    .getByLabel("Date", { exact: true })
    .fill("2026-09-20");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Save changes", exact: true })
    .click();
  await waitFor(
    async () =>
      !!(await prisma.achievement.findFirst({ where: { title: tag } })),
    "Achievement save",
  );
  const reportCount = await prisma.reportSnapshot.count({
    where: { enrollmentId: student.id },
  });
  await page.goto(profile + "&tab=reports");
  await page
    .getByRole("button", { name: "Publish report", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Publish version", exact: true })
    .click();
  await waitFor(
    async () =>
      (await prisma.reportSnapshot.count({
        where: { enrollmentId: student.id },
      })) > reportCount,
    "Report publication",
  );
  const report = await prisma.reportSnapshot.findFirstOrThrow({
    where: { enrollmentId: student.id },
    orderBy: { createdAt: "desc" },
  });
  const download = await page.request.get(base + "/api/reports/" + report.id);
  assert.equal(download.status(), 200);
  assert.equal((await download.json()).version, report.version);
  const marker = await account("SUBJECT_TUTOR");
  await marker.page.goto(
    base + "/dashboard/exams/" + event.exams[0].id + "?tab=marks",
  );
  await marker.page
    .getByRole("heading", { name: "404", exact: true })
    .waitFor();
  await page.goto(
    base + "/dashboard/exams/" + event.exams[0].id + "?tab=subjects",
  );
  const markerSubject = await prisma.examSubject.findUniqueOrThrow({
    where: { id: marked.examSubjectId },
    include: { cohortSubject: true },
  });
  await page
    .getByRole("button", {
      name: "Assign marker · " + markerSubject.name,
      exact: true,
    })
    .click();
  await page
    .getByRole("dialog")
    .locator('select[name="tutorId"]')
    .selectOption(marker.user.id);
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Save changes", exact: true })
    .click();
  await waitFor(
    async () =>
      (
        await prisma.examSubject.findUniqueOrThrow({
          where: { id: markerSubject.id },
        })
      ).markingTutorId === marker.user.id,
    "Exam marker assignment",
  );
  assert.equal(
    (
      await prisma.cohortSubject.findUniqueOrThrow({
        where: { id: markerSubject.cohortSubjectId },
      })
    ).tutorId,
    markerSubject.cohortSubject.tutorId,
  );
  await marker.page.goto(
    base + "/dashboard/exams/" + event.exams[0].id + "?tab=marks",
  );
  await marker.page
    .getByRole("button", { name: "Save marks", exact: true })
    .waitFor();
  assert.equal(
    await marker.page.locator("thead th[data-exam-subject]").count(),
    1,
  );
  await marker.page.goto(
    base + "/dashboard/exams/" + event.exams[1].id + "?tab=marks",
  );
  await marker.page
    .getByRole("heading", { name: "404", exact: true })
    .waitFor();
  console.log("PASS independent examination marker assignment and tutor scope");
  const originalPayload = JSON.stringify(report.payload);
  await page.goto(base + "/dashboard/performance?year=" + year.id);
  await page
    .getByRole("button", { name: "Edit criterion", exact: true })
    .first()
    .click();
  const code = await page
    .getByRole("dialog")
    .locator('input[name="code"]')
    .inputValue();
  await page
    .getByRole("dialog")
    .getByLabel("Maximum (1–10)", { exact: true })
    .fill("5");
  const previousVersion = Number(
    await page
      .getByRole("dialog")
      .locator('input[name="version"]')
      .inputValue(),
  );
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Save changes", exact: true })
    .click();
  await waitFor(
    async () =>
      !!(await prisma.performanceCriterion.findUnique({
        where: {
          category_code_version: {
            category: "CLASS_BEHAVIOUR",
            code,
            version: previousVersion + 1,
          },
        },
      })),
    "Criterion version",
  );
  assert.deepEqual(
    (
      await prisma.performanceRegister.findUniqueOrThrow({
        where: { id: evaluation.id },
      })
    ).criteria,
    evaluation.criteria,
  );
  assert.equal(
    JSON.stringify(
      (
        await prisma.reportSnapshot.findUniqueOrThrow({
          where: { id: report.id },
        })
      ).payload,
    ),
    originalPayload,
  );
  await page.goto(base + "/dashboard/reports/" + report.id);
  await page
    .getByRole("button", { name: "Print / Save PDF", exact: true })
    .waitFor();
  console.log(
    "PASS achievement, report download/print, frozen maxima and immutable report version",
  );
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto(profile + "&tab=profile");
  await page.getByRole("button", { name: "Edit profile", exact: true }).click();
  const tablet = await page.getByRole("dialog").boundingBox();
  assert.ok(tablet.width <= 768 && tablet.height <= 1024);
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(profile + "&tab=profile");
  await page.getByRole("button", { name: "Edit profile", exact: true }).click();
  const box = await page.getByRole("dialog").boundingBox();
  assert.ok(box.width <= 390 && box.height <= 844);
  await mkdir(".local/erp-preview", { recursive: true });
  await page.screenshot({
    path: ".local/erp-preview/mobile-profile.png",
    fullPage: true,
  });
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base + "/dashboard/attendance/" + register.id);
  await page.screenshot({
    path: ".local/erp-preview/attendance.png",
    fullPage: true,
  });

  const oldWeek = await prisma.attendanceRegister.findMany({
    where: {
      cohortId: cohort.id,
      date: { gte: new Date("2026-09-07"), lte: new Date("2026-09-13") },
    },
    select: { id: true },
  });
  await prisma.attendanceEntry.deleteMany({
    where: { registerId: { in: oldWeek.map((r) => r.id) } },
  });
  await prisma.attendanceRegister.deleteMany({
    where: { id: { in: oldWeek.map((r) => r.id) } },
  });
  await page.goto(
    base +
      "/dashboard/attendance/entry?cohort=" +
      cohort.id +
      "&mode=weekly&date=2026-09-09",
  );
  await page
    .getByRole("button", { name: "Open missing daily registers" })
    .click();
  await page
    .getByRole("button", { name: "All P", exact: true })
    .first()
    .waitFor();
  assert.equal(
    await page.getByRole("button", { name: "All P", exact: true }).count(),
    7,
  );
  await page
    .getByRole("button", { name: "All P", exact: true })
    .first()
    .click();
  await page
    .getByRole("checkbox", {
      name: student.student.fullName + " 2026-09-07 Absent",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Day Off", exact: true })
    .nth(1)
    .click();
  await page.getByRole("dialog").getByRole("textbox").fill("School holiday");
  await page.getByRole("button", { name: "Confirm Off", exact: true }).click();
  await page
    .getByRole("button", { name: "Save changed days", exact: true })
    .click();
  await page
    .getByRole("status")
    .filter({ hasText: "2 day(s) saved" })
    .waitFor();
  const savedWeek = await prisma.attendanceRegister.findMany({
    where: {
      cohortId: cohort.id,
      date: { gte: new Date("2026-09-07"), lte: new Date("2026-09-13") },
    },
    include: { entries: true },
    orderBy: { date: "asc" },
  });
  assert.equal(
    savedWeek[0].entries.find((e) => e.enrollmentId === student.id)?.status,
    "ABSENT",
  );
  assert.ok(
    savedWeek[1].entries.every(
      (e) => e.status === "OFF" && e.reason === "School holiday",
    ),
  );
  assert.ok(
    savedWeek.slice(2).every((r) => r.entries.every((e) => e.status === null)),
  );
  await page
    .getByRole("button", { name: "Save & submit day", exact: true })
    .first()
    .click();
  await page
    .getByRole("link", { name: "View / correct", exact: true })
    .first()
    .waitFor();
  await page.screenshot({
    path: ".local/erp-preview/weekly-attendance.png",
    fullPage: true,
  });
  await page.goto(
    base +
      "/dashboard/attendance/entry?cohort=" +
      cohort.id +
      "&mode=monthly&date=2026-09-09",
  );
  assert.ok((await page.getByRole("columnheader").count()) >= 28);
  console.log(
    "PASS weekly checkbox entry, absent, whole day Off, independent save and submit, monthly dates",
  );
  assert.deepEqual(errors, []);
  console.log("PASS mobile dialog sizing and browser console");
}
main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await browser?.close();
    await prisma.$disconnect();
  });
