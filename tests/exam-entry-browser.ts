import { createRequire } from "node:module";
import { randomBytes, createHash } from "node:crypto";
import assert from "node:assert/strict";
import { prisma } from "../lib/prisma";
const require = createRequire(process.cwd() + "/package.json");
const {
  chromium,
} = require("C:/Users/ASUS/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
async function main() {
  if (process.env.EXAM_ISOLATED_TEST !== "1")
    throw new Error("Run only against the isolated examination branch.");
  const user = await prisma.user.findFirstOrThrow({
    where: { role: "SUPER_ADMIN", isActive: true },
  });
  const token = randomBytes(32).toString("base64url");
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash: createHash("sha256").update(token).digest("hex"),
      expiresAt: new Date(Date.now() + 3600000),
    },
  });
  const source = await prisma.exam.findFirstOrThrow({
    where: {
      subjects: { some: { studyStreamCode: null } },
      candidates: { some: {} },
    },
    include: {
      subjects: { where: { studyStreamCode: null }, take: 2 },
      candidates: { take: 3 },
      cohort: true,
    },
  });
  const event = await prisma.examination.create({
    data: {
      academicYearId: source.cohort.academicYearId,
      title: "Browser entry " + Date.now(),
    },
  });
  const date = new Date(
    new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }),
  );
  const due = new Date(date);
  due.setUTCDate(due.getUTCDate() + 7);
  const fixture = await prisma.exam.create({
    data: {
      eventId: event.id,
      cohortId: source.cohortId,
      title: event.title,
      date,
      markEntryDueDate: due,
      publishDate: due,
      subjects: {
        create: source.subjects.map((s) => ({
          cohortSubjectId: s.cohortSubjectId,
          name: s.name,
          maxMarks: 100,
          passMarks: 40,
        })),
      },
      candidates: {
        create: source.candidates.map((c) => ({
          enrollmentId: c.enrollmentId,
          fullName: c.fullName,
          studentNumber: c.studentNumber,
          studyStreamCode: c.studyStreamCode,
        })),
      },
    },
    include: { subjects: true, candidates: true },
  });
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    });
    await context.addCookies([
      { name: "dihliz_session", value: token, url: "http://localhost:3107" },
    ]);
    const page = await context.newPage();
    page.setDefaultTimeout(30000);
    const errors: string[] = [];
    page.on("pageerror", (e: Error) => errors.push(e.message));
    const url = "http://localhost:3107/dashboard/exams/" + fixture.id;
    await page.goto(url + "?tab=overview");
    await page
      .getByRole("navigation", { name: "Workspace sections" })
      .waitFor();
    const nav = await page
      .getByRole("navigation", { name: "Workspace sections" })
      .boundingBox();
    const stats = await page
      .getByText("Students", { exact: true })
      .last()
      .boundingBox();
    assert.ok(nav.y < stats.y);
    await page.getByRole("link", { name: "Mark entry", exact: true }).click();
    await page.getByRole("progressbar", { name: "Entry Progress" }).waitFor();
    assert.equal(await page.getByText("Pending students only").count(), 0);
    assert.equal(
      await page.getByText("Visible subject", { exact: true }).count(),
      0,
    );
    const inputs = page.locator('input[name^="mark:"]');
    assert.equal(
      await inputs.count(),
      fixture.candidates.length * fixture.subjects.length,
    );
    const first = inputs.first();
    await first.fill("101");
    assert.equal(await first.inputValue(), "");
    await first.fill("-1");
    assert.equal(await first.inputValue(), "");
    await first.pressSequentially("75.25");
    assert.equal(await first.inputValue(), "75.25");
    const firstRow = first.locator("../../..");
    const row = page.locator("tbody tr").first();
    assert.equal(
      (await row.locator("[data-live-total]").innerText()).trim(),
      "75.25 / " + fixture.subjects.length * 100,
    );
    await first.press("Tab");
    if (fixture.subjects.length > 1)
      assert.equal(
        await inputs
          .nth(1)
          .evaluate((e: HTMLElement) => e === document.activeElement),
        true,
      );
    await first.focus();
    await first.press("ArrowDown");
    assert.equal(
      await inputs
        .nth(fixture.subjects.length)
        .evaluate((e: HTMLElement) => e === document.activeElement),
      true,
    );
    await page.getByRole("button", { name: "Discard", exact: true }).click();
    assert.equal(await first.inputValue(), "");
    for (const input of await inputs.all()) await input.fill("80");
    assert.equal(
      await page
        .getByRole("columnheader", { name: "Rank", exact: true })
        .count(),
      0,
    );
    const absent = row.locator("[data-absent]").first();
    await absent.click();
    assert.equal(await first.inputValue(), "ABSENT");
    assert.equal(await absent.getAttribute("aria-pressed"), "true");

    assert.equal(
      await page.getByRole("progressbar").getAttribute("aria-valuenow"),
      "100",
    );
    await page.screenshot({
      path: ".local/erp-preview/exam-entry-desktop.png",
      fullPage: true,
    });
    await page.getByRole("button", { name: "Save marks", exact: true }).click();
    await page
      .locator("form")
      .getByText("Marks saved", { exact: false })
      .waitFor();
    await page
      .getByRole("button", { name: "Save marks", exact: true })
      .waitFor();
    assert.ok(
      await page
        .getByRole("button", { name: "Save marks", exact: true })
        .isDisabled(),
    );
    await page
      .locator('[data-sonner-toast][data-type="success"]')
      .first()
      .waitFor();
    const persisted = await prisma.examMark.findMany({
      where: { examId: fixture.id },
    });
    assert.equal(persisted.filter((m) => m.status === "ABSENT").length, 1);
    const inputAgain = page.locator('input[name^="mark:"]').first();
    await inputAgain.fill("50");
    await page.getByRole("button", { name: "Save marks", exact: true }).click();
    await page.waitForFunction(
      () =>
        document
          .querySelector('input[name^="mark:"]')
          ?.getAttribute("aria-invalid") === "false",
    );
    await page
      .getByRole("button", { name: "Save marks", exact: true })
      .isDisabled();
    await page.reload();
    assert.equal(
      await page.locator('input[name^="mark:"]').first().inputValue(),
      "50",
    );
    const afterSingle = await prisma.examMark.findMany({
      where: { examId: fixture.id },
    });
    assert.equal(
      afterSingle.filter(
        (mark) =>
          mark.updatedAt.getTime() !==
          persisted.find((old) => old.id === mark.id)?.updatedAt.getTime(),
      ).length,
      1,
    );
    const audit = await prisma.auditLog.findFirstOrThrow({
      where: { entityId: fixture.id, action: "SAVE_MARKS" },
      orderBy: { createdAt: "desc" },
    });
    assert.equal((audit.details as { cells: number }).cells, 1);
    const revision = page.locator('input[name="revision"]');
    const current = Number(await revision.inputValue());
    await revision.evaluate((element: HTMLInputElement, value: number) => {
      element.value = String(value);
    }, current - 1);
    await page.locator('input[name^="mark:"]').first().fill("51");
    await page.getByRole("button", { name: "Save marks", exact: true }).click();
    await page
      .locator('[data-sonner-toast][data-type="error"]')
      .filter({ hasText: "The exam changed" })
      .waitFor();
    await page.reload();
    assert.equal(
      await page.locator('input[name^="mark:"]').first().inputValue(),
      "50",
    );
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: ".local/erp-preview/exam-entry-mobile.png",
      fullPage: true,
    });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    );
    const csv = await context.request.get(
      "http://localhost:3107/api/exams/" + fixture.id + "/export",
    );
    assert.ok((await csv.text()).includes('"Rank"'));
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(url + "?tab=analysis");
    await page
      .getByRole("heading", { name: "Subject marks analysis", exact: true })
      .waitFor();
    assert.equal(
      await page
        .getByRole("heading", { name: "Provisional analysis", exact: true })
        .count(),
      0,
    );
    await page.goto(url + "?tab=overview");
    await page
      .getByRole("heading", { name: "Provisional analysis", exact: true })
      .waitFor();
    await page.goto(url + "?tab=results");
    await page
      .getByRole("heading", { name: "Subject marks analysis", exact: true })
      .waitFor();
    assert.equal(await page.locator("thead th").first().innerText(), "Rank");
    assert.equal(
      await page.getByRole("link", { name: "Results", exact: true }).count(),
      0,
    );
    await page.goto(url + "?tab=subjects");
    const edits = page.getByRole("button", { name: "Edit", exact: true });
    await edits.first().click();
    const dialog = page.getByRole("dialog");
    await dialog.waitFor();
    assert.ok((await dialog.innerText()).includes("master subject list"));
    const box = await dialog.boundingBox();
    assert.ok(box.height < 600);
    await page.screenshot({
      path: ".local/erp-preview/exam-subject-modal.png",
    });
    await page
      .getByRole("button", { name: "Close dialog", exact: true })
      .click();
    const assigned = await prisma.cohortSubject.findMany({
      where: {
        cohortId: fixture.cohortId,
        isArchived: false,
        subject: { isArchived: false },
      },
    });
    for (const subject of assigned.filter(
      (s) => !fixture.subjects.some((es) => es.cohortSubjectId === s.id),
    ))
      await prisma.examSubject.create({
        data: {
          examId: fixture.id,
          cohortSubjectId: subject.id,
          name: "Fixture subject " + subject.id,
          maxMarks: 100,
          passMarks: 40,
          studyStreamCode: subject.studyStreamCode,
        },
      });
    await page.reload();
    await page
      .getByRole("button", { name: "Add exam subject", exact: true })
      .click();
    await page
      .getByRole("link", { name: "Manage master subjects", exact: true })
      .waitFor();
    assert.equal(
      await dialog
        .getByRole("combobox", { name: "Subject", exact: true })
        .count(),
      0,
    );
    await page
      .getByRole("button", { name: "Close dialog", exact: true })
      .click();
    const future = new Date(date);
    future.setUTCDate(future.getUTCDate() + 10);
    await prisma.exam.update({
      where: { id: fixture.id },
      data: { date: future, markEntryDueDate: future, publishDate: future },
    });
    await page.goto(url + "?tab=marks");
    assert.equal(
      await page.getByRole("link", { name: "Mark entry", exact: true }).count(),
      0,
    );
    assert.equal(
      await page
        .getByRole("link", { name: "Mark analysis", exact: true })
        .count(),
      0,
    );
    assert.equal(await page.getByRole("progressbar").count(), 0);
    assert.equal(
      await page
        .getByRole("link", { name: "Overview", exact: true })
        .getAttribute("aria-current"),
      "page",
    );
    const past = new Date(date);
    past.setUTCDate(past.getUTCDate() - 3);
    await prisma.exam.update({
      where: { id: fixture.id },
      data: { date: past, markEntryDueDate: past, publishDate: past },
    });
    await prisma.examMark.deleteMany({
      where: { examId: fixture.id, candidateId: fixture.candidates[0].id },
    });
    await prisma.examMark.updateMany({
      where: { examId: fixture.id, candidateId: fixture.candidates[1].id },
      data: { status: "ABSENT", score: null },
    });
    await page.goto(url + "?tab=analysis");
    assert.ok(
      (await page.getByText("Not marked", { exact: true }).count()) > 0,
    );
    assert.ok(
      (await page
        .locator("span.text-red-600")
        .filter({ hasText: /^A$/ })
        .count()) > 0,
    );
    await page.goto(url + "?tab=marks");
    await page.getByRole("progressbar").waitFor();
    const correction = page.locator('input[name^="mark:"]').first();
    await correction.fill("60");
    await page.getByRole("button", { name: "Save marks", exact: true }).click();
    await page
      .locator("form")
      .getByText("Marks saved.", { exact: true })
      .waitFor();
    await prisma.exam.update({
      where: { id: fixture.id },
      data: { status: "LOCKED", resultsPublic: true },
    });
    await page.reload();
    const publishedInputs = page.locator('input[name^="mark:"]');
    for (const input of await publishedInputs.all()) await input.fill("65");
    await page.getByRole("button", { name: "Save marks", exact: true }).click();
    await page.waitForFunction(
      () => document.querySelector('[data-pending="false"]') !== null,
    );
    await page.reload();
    assert.equal(
      await page.locator('input[name^="mark:"]').first().inputValue(),
      "65",
    );
    assert.equal(
      (await prisma.exam.findUniqueOrThrow({ where: { id: fixture.id } }))
        .status,
      "LOCKED",
    );
    assert.deepEqual(errors, []);
    console.log(
      "PASS overview-only details, score bounds, decimals, keyboard navigation, live totals/ranks, absent, discard, repeated save, mobile, CSV",
    );
  } finally {
    await browser.close();
    await prisma.examMark.deleteMany({ where: { examId: fixture.id } });
    await prisma.examSubject.deleteMany({ where: { examId: fixture.id } });
    await prisma.examCandidate.deleteMany({ where: { examId: fixture.id } });
    await prisma.auditLog.deleteMany({ where: { entityId: fixture.id } });
    await prisma.exam.delete({ where: { id: fixture.id } });
    await prisma.examination.delete({ where: { id: event.id } });
    await prisma.session.delete({ where: { id: session.id } });
    await prisma.$disconnect();
  }
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
