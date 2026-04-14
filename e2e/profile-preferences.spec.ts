import { test, expect } from "@playwright/test";

test("user can edit dietary preferences and allergies and see them after reload", async ({ page }) => {
  const email = `prefs+${Date.now()}@test.com`;
  const password = "Password1!";

  const registerRes = await page.request.post("http://localhost:4000/api/auth/sign-up/email", {
    data: {
      email,
      password,
      name: "Preferences User",
    },
  });
  expect(registerRes.ok()).toBeTruthy();
  await page.context().clearCookies();

  await page.goto("/login?register=false");
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
  await page.addStyleTag({
    content: `* { transition-duration: 0s !important; animation-duration: 0s !important; }`,
  });

  await page.waitForSelector('input[name="email"]', { timeout: 15000 });
  await page.waitForSelector('input[name="password"]', { timeout: 15000 });

  await page.getByLabel("Email Address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log In" }).click({ force: true, timeout: 10000 });

  const outcome = await Promise.race([
    page
      .getByRole("heading", { name: "Customize Your Culinary Experience" })
      .waitFor({ state: "visible", timeout: 30000 })
      .then(() => "customize"),
    page.waitForURL(/\/dashboard/, { timeout: 30000 }).then(() => "dashboard"),
  ]);

  if (outcome === "customize") {
    const firstCuisine = page
      .locator('text="Favorite Cuisines"')
      .locator("..")
      .locator(".cursor-pointer")
      .first();
    await firstCuisine.click();

    await page.getByRole("button", { name: "Next: Personal Details" }).click();

    await expect(
      page.getByRole("heading", { name: "Tell Us About Yourself" })
    ).toBeVisible({ timeout: 10000 });

    const ageInput = page.getByLabel(/^Age/);
    await ageInput.fill("20");
    await page.getByRole("button", { name: "Complete Setup" }).click();
  }

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 30000 });

  const openPreferences = async () => {
    await page.locator(".header-account").click();
    await page.locator(".user-card").waitFor({ state: "visible", timeout: 10000 });
    await page.getByTitle("Options").click({ force: true });
    await expect(page).toHaveURL(/\/dashboard#settings/, { timeout: 10000 });

    const preferencesButton = page.getByRole("button", { name: "Preferences" });
    await expect(preferencesButton).toBeVisible({ timeout: 10000 });
    await preferencesButton.click({ force: true });
    await expect(page.getByText("Dietary Preferences")).toBeVisible({ timeout: 10000 });
  };

  await page.waitForURL(/\/dashboard/, { timeout: 30000 });
  await openPreferences();

  await page.getByRole("button", { name: "Vegan" }).click();

  const allergyInput = page.getByPlaceholder(/Search allergies/i);
  await allergyInput.click();
  await allergyInput.fill("pea");
  await page.getByRole("button", { name: "Peanuts" }).click();

  const save = page.getByRole("button", { name: "Save Changes" });
  await expect(save).toBeVisible({ timeout: 5000 });
  const waitSave = page.waitForResponse((res) =>
    res.url().includes("/api/user/profile") && res.request().method() === "PUT"
  );
  await save.click();
  await waitSave;

  await page.waitForURL(/\/dashboard/, { timeout: 30000 });
  await openPreferences();

  const veganButton = page.getByRole("button", { name: "Vegan" });
  await expect(veganButton).toHaveClass(/bg-accent/);

  await expect(page.getByText("Peanuts")).toBeVisible();
});
