import { test, expect } from "@playwright/test";

test("user can register and reaches preferences flow", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Get Started" }).click();
  await expect(page).toHaveURL(/\/login/);

  // Already in register mode after clicking "Get Started"
  // Just fill in the form directly without clicking the toggle

  await expect(page.getByLabel("Full Name")).toBeVisible();

  const email = `alice+${Date.now()}@test.com`;
  await page.getByLabel("Full Name").fill("Alice Tester");
  await page.getByLabel("Email Address").fill(email);
  await page.getByLabel("Password").fill("Password1!");

  await page.getByRole("button", { name: "Create Account" }).click();

  await expect(
    page.getByRole("heading", { name: "Customize Your Culinary Experience" })
  ).toBeVisible({ timeout: 20000 });

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

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 20000 });
});
