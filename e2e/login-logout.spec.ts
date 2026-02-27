import { test, expect } from "@playwright/test";

test("user can log in, stay logged in, and log out", async ({ page, request }) => {
  const email = `login+${Date.now()}@test.com`;
  const password = "Password1!";

  await request.post("http://localhost:4000/api/auth/register", {
    data: { email, password, name: "Login User" },
  });

  await page.goto("/login?register=false");

  await page.getByLabel("Email Address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log In" }).click();

  // Wait 10 seconds for the customization transitions to complete
  await page.waitForTimeout(10000);

  // Click the first option in Favorite Cuisines section
  const firstCuisine = page.locator('text="Favorite Cuisines"').locator('..').locator('.cursor-pointer').first();
  await firstCuisine.click();

  // Click on the Allergies input text box
  const allergiesInput = page.getByPlaceholder(/Search allergies/i);
  await allergiesInput.click();

  // Press Enter to submit the first form
  await page.keyboard.press('Enter');

  // Wait 1 second
  await page.waitForTimeout(1000);

  // Click on Age text box
  const ageInput = page.getByLabel(/^Age/);
  await ageInput.click();

  // Type 20
  await ageInput.fill('20');

  // Press Enter to submit the second form
  await page.keyboard.press('Enter');

  // Wait 5 seconds
  await page.waitForTimeout(5000);

  // Verify user is in /dashboard
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });

  const storedBefore = await page.evaluate(() =>
    window.localStorage.getItem("user")
  );
  expect(storedBefore).toContain(email);

  // Navigate to home page
  await page.goto("/");
  
  // Wait for page to fully load and React effects to complete
  await page.waitForTimeout(1000);
  
  const storedAfterNav = await page.evaluate(() =>
    window.localStorage.getItem("user")
  );
  expect(storedAfterNav).toContain(email);

  // Click logout button in navbar
  await page.getByRole("button", { name: "Logout" }).click();
  
  // Should redirect to login or home
  await page.waitForURL(/\/(login|)$/, { timeout: 5000 });

});
