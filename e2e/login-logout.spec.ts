import { test, expect } from "@playwright/test";

test("user can log in, stay logged in, and log out", async ({ page, request }) => {
  const email = `login+${Date.now()}@test.com`;
  const password = "Password1!";

  // Create a non-customized user via BetterAuth API
  const registerRes = await page.request.post("http://localhost:4000/api/auth/sign-up/email", {
    data: {
      email,
      password,
      name: "Login User",
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

  // Wait explicitly for both email and password fields to guarantee they're rendered before interaction
  await page.waitForSelector('input[name="email"]', { timeout: 15000 });
  await page.waitForSelector('input[name="password"]', { timeout: 15000 });

  await page.getByLabel("Email Address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log In" }).click({ force: true, timeout: 10000 });

  let needsCustomization = false;
  try {
    await page
      .getByRole("heading", { name: "Customize Your Culinary Experience" })
      .waitFor({ state: "visible", timeout: 20000 });
    needsCustomization = true;
  } catch {
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 20000 });
  }

  if (needsCustomization) {
    // Click the first option in Favorite Cuisines section
    const firstCuisine = page.locator('text="Favorite Cuisines"').locator('..').locator('.cursor-pointer').first();
    await firstCuisine.click();

    // Click on the Allergies input text box
    const allergiesInput = page.getByPlaceholder(/Search allergies/i);
    await allergiesInput.click();

    // Press Enter to submit the first form
    await page.keyboard.press("Enter");

    await expect(
      page.getByRole("heading", { name: "Tell Us About Yourself" })
    ).toBeVisible({ timeout: 10000 });

    // Click on Age text box
    const ageInput = page.getByLabel(/^Age/);
    await ageInput.click();

    // Type 20
    await ageInput.fill("20");

    // Press Enter to submit the second form
    await page.keyboard.press("Enter");
  }

  // Verify user is in /dashboard
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });

  await expect(page.getByRole("button", { name: "Logout" })).toBeVisible();

  // Navigate to home page
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Logout" })).toBeVisible();
  
  await expect(page.getByRole("button", { name: "Logout" })).toBeVisible();

  // Click logout button in navbar
  await page.getByRole("button", { name: "Logout" }).click();
  
  // Should redirect to login or home
  await page.waitForURL(/\/(login|)$/ , { timeout: 5000 });

  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  await expect(page.getByRole("button", { name: "Log In" })).toBeVisible();
});
