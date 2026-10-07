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
    await page.goto("http://localhost:3107/dashboard/exams");
    await page
      .getByRole("heading", { name: "Examinations", exact: true })
      .waitFor();
    assert.ok(
      (
        await page
          .locator(".dashboard-font")
          .first()
          .evaluate((e: HTMLElement) => getComputedStyle(e).fontFamily)
      ).includes("Plus Jakarta Sans"),
    );
    let optionRequests = 0;
    page.on("request", (request: any) => {
      if (request.url().includes("/api/exams/options")) optionRequests++;
    });
    const search = page.getByRole("searchbox", { name: "Search exams" });
    await search.fill("Term");
    await search.press("Enter");
    await page.waitForURL(/q=Term/);
    await page.getByRole("button", { name: "Clear search" }).click();
    await page.waitForURL((url: URL) => !url.searchParams.has("q"));
    assert.equal(optionRequests, 0);
    await page.getByRole("button", { name: "Filter", exact: true }).click();
    const filterPositions = await Promise.all(
      ["Academic year", "Class", "Status", "Result visibility"].map((name) =>
        page.getByRole("combobox", { name, exact: true }).boundingBox(),
      ),
    );
    assert.ok(
      filterPositions.every(
        (box: any, i: number) =>
          i === 0 ||
          (box.y > filterPositions[i - 1].y &&
            Math.abs(box.x - filterPositions[0].x) < 2),
      ),
    );
    await page.screenshot({
      path: ".local/erp-preview/exam-filter-layout.png",
    });
    await page.getByRole("combobox", { name: "Status", exact: true }).click();
    await page.getByRole("option", { name: "Scheduled", exact: true }).click();
    await page.getByRole("button", { name: "Apply filters" }).click();
    await page.waitForURL(/status=Scheduled/);
    await page.getByRole("button", { name: "Sort", exact: true }).click();
    await page.screenshot({ path: ".local/erp-preview/exam-sort-layout.png" });
    await page.getByRole("menuitem", { name: "Name A–Z" }).click();
    await page.waitForURL(/sort=name/);
    const suffix = Date.now();
    const dialog = page.getByRole("dialog");
    async function openCreation() {
      await page
        .getByRole("link", { name: "Create examination", exact: true })
        .click();
      await page.waitForURL(/exams\/create/);
      for (const name of ["Primary details", "Streams"])
        await page.getByRole("heading", { name, exact: true }).waitFor();
      assert.equal(await dialog.count(), 0);
      assert.ok(
        await page
          .getByRole("checkbox", { name: "Public results", exact: true })
          .isChecked(),
      );
    }
    async function fillDates() {
      const yearId = await page.locator('input[name="yearId"]').inputValue();
      const year = await prisma.academicYear.findUniqueOrThrow({
        where: { id: yearId },
      });
      const date = year.startDate.toISOString().slice(0, 10);
      for (const name of ["date", "markEntryDueDate", "publishDate"]) {
        const input = page.locator('input[name="' + name + '"]');
        assert.equal(await input.getAttribute("type"), "date");
        await input.fill(date);
      }
    }
    await openCreation();
    const classCheck = page.locator('input[name="cohortIds"]').first();
    await classCheck.check();
    const subjects = page.locator('input[name="subjectIds"]');
    assert.ok((await subjects.count()) > 0);
    for (const subject of await subjects.all())
      assert.ok(await subject.isChecked());
    await page.locator('input[name^="max_"]').first().fill("80");
    await page.locator('input[name^="pass_"]').first().fill("30");
    await classCheck.uncheck();
    await classCheck.check();
    assert.equal(
      await page.locator('input[name^="max_"]').first().inputValue(),
      "80",
    );
    const title = "Browser page selection " + suffix;
    await page.locator('input[name="title"]').fill(title);
    await fillDates();
    await page.screenshot({
      path: ".local/erp-preview/exam-create-desktop.png",
      fullPage: true,
    });
    await page
      .getByRole("button", { name: "Create examination", exact: true })
      .click();
    await page.waitForURL((url: URL) => url.pathname === "/dashboard/exams");
    const created = await prisma.exam.findFirstOrThrow({
      where: { title },
      include: { subjects: true },
    });
    assert.ok(
      created.subjects.some((s) => s.maxMarks === 80 && s.passMarks === 30),
    );
    assert.equal(created.resultsPublic, true);
    const response = await context.request.get(
      "http://localhost:3107/api/exams/" + created.id + "/configuration",
    );
    assert.equal(response.status(), 200);
    await openCreation();
    await page.locator('input[name="cohortIds"]').first().check();
    for (const checkbox of await page.locator('input[name="subjectIds"]').all())
      await checkbox.uncheck();
    await page
      .getByRole("checkbox", { name: "Public results", exact: true })
      .uncheck();
    const emptyTitle = "Browser page empty " + suffix;
    await page.locator('input[name="title"]').fill(emptyTitle);
    await fillDates();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: ".local/erp-preview/exam-create-mobile.png",
      fullPage: true,
    });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    );
    await page
      .getByRole("button", { name: "Create examination", exact: true })
      .click();
    await page.waitForURL((url: URL) => url.pathname === "/dashboard/exams");
    const empty = await prisma.exam.findFirstOrThrow({
      where: { title: emptyTitle },
      include: { subjects: true },
    });
    assert.equal(empty.subjects.length, 0);
    assert.equal(empty.resultsPublic, false);
    assert.equal(optionRequests, 0);
    await page.setViewportSize({ width: 1440, height: 1000 });
    const configuration = await response.json();
    configuration.title = "Browser imported configuration test " + suffix;
    await page.goto("http://localhost:3107/dashboard/exams");
    await page
      .getByRole("button", { name: "Import examination", exact: true })
      .click();
    await dialog.waitFor();
    await dialog.locator('input[type="file"]').setInputFiles({
      name: "exam.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(configuration)),
    });
    await dialog
      .getByRole("button", { name: "Import examination", exact: true })
      .click();
    await dialog.waitFor({ state: "hidden", timeout: 10000 });
    const imported = await prisma.exam.findFirstOrThrow({
      where: { title: configuration.title },
      include: { subjects: true },
    });
    assert.equal(
      imported.subjects.length,
      configuration.cohorts[0].subjects.length,
    );
    assert.equal(imported.resultsPublic, false);
    await page.goto("http://localhost:3107/dashboard/exams?view=grid");
    await page
      .getByRole("heading", { name: "Examinations", exact: true })
      .waitFor();
    await page.screenshot({
      path: ".local/erp-preview/exam-updates-desktop.png",
      fullPage: true,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("http://localhost:3107/dashboard/exams");
    await page.screenshot({
      path: ".local/erp-preview/exam-updates-mobile.png",
      fullPage: true,
    });
    await page.getByRole("button", { name: "Filter", exact: true }).click();
    const mobilePopup = await page
      .getByRole("heading", { name: "Filter exams", exact: true })
      .locator("../..")
      .boundingBox();
    assert.ok(mobilePopup.x >= 0 && mobilePopup.x + mobilePopup.width <= 390);
    await page.screenshot({
      path: ".local/erp-preview/exam-filter-mobile.png",
    });
    assert.deepEqual(errors, []);
    console.log(
      "PASS dashboard font, filter and sort selects, per-subject limits, empty exam creation, configuration import/export, mobile rendering",
    );
  } finally {
    await browser.close();
    await prisma.session.delete({ where: { id: session.id } });
    await prisma.$disconnect();
  }
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
