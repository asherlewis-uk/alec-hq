import { expect, test } from "@playwright/test";

const wsASlug = process.env.E2E_WORKSPACE_A_SLUG;
const wsAPin = process.env.E2E_WORKSPACE_A_PIN;
const wsBSlug = process.env.E2E_WORKSPACE_B_SLUG;
const wsBPin = process.env.E2E_WORKSPACE_B_PIN;
const automationBypassHeaders = {
  "x-e2e-bypass-pwa-install-gate": "1",
} as const;

const workspaceLabels: Record<string, string> = {
  asher: "Asher",
  alec: "Alec",
};

const asherPrivateState = {
  wishlist: "Color-accurate reference monitor",
  configuration: "Studio Edit Bay",
  log: "Desk cable cleanup",
};

const alecPrivateState = {
  wishlist: "Track-day wheel and tyre set",
  configuration: "Weekend Track Setup",
  log: "Brake fluid refresh",
};

async function loginWorkspace(
  page: import("@playwright/test").Page,
  slug: string,
  pin: string,
) {
  await page.goto("/login");
  await page
    .getByRole("button", {
      name: new RegExp(workspaceLabels[slug] ?? slug, "i"),
    })
    .click();

  const keypad = page.getByRole("group", { name: /PIN keypad/i });

  for (const digit of pin) {
    await keypad.getByRole("button", { name: digit }).click();
  }

  await page.getByRole("button", { name: /unlock/i }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
}

async function logout(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: /sign out/i }).click();
  await expect(page).toHaveURL(/\/login/);
}

test.describe("Multi-workspace smoke tests", () => {
  test.use({ extraHTTPHeaders: automationBypassHeaders });

  test.skip(
    !wsASlug || !wsAPin || !wsBSlug || !wsBPin,
    "Set E2E_WORKSPACE_A_SLUG, E2E_WORKSPACE_A_PIN, E2E_WORKSPACE_B_SLUG, E2E_WORKSPACE_B_PIN",
  );

  test("catalog browse unauthenticated", async ({ page }) => {
    await page.goto("/catalog");
    await expect(
      page.getByRole("main").getByRole("heading", { name: "Catalog" }),
    ).toBeVisible();
  });

  test("workspace A login and create private wishlist item", async ({
    page,
  }) => {
    await loginWorkspace(page, wsASlug!, wsAPin!);

    await page.goto("/workspace/wishlist");
    await expect(
      page.getByRole("main").getByRole("heading", { name: "Wishlist" }),
    ).toBeVisible();
    await expect(page.getByText(asherPrivateState.wishlist)).toBeVisible();
    await expect(page.getByText(alecPrivateState.wishlist)).toHaveCount(0);

    await page.goto("/workspace/configurations");
    await expect(
      page.getByRole("main").getByRole("heading", { name: "Configurations" }),
    ).toBeVisible();
    await expect(page.getByText(asherPrivateState.configuration)).toBeVisible();
    await expect(page.getByText(alecPrivateState.configuration)).toHaveCount(0);

    await page.goto("/workspace/logs");
    await expect(
      page.getByRole("main").getByRole("heading", { name: "Logs" }),
    ).toBeVisible();
    await expect(page.getByText(asherPrivateState.log)).toBeVisible();
    await expect(page.getByText(alecPrivateState.log)).toHaveCount(0);

    await logout(page);
  });

  test("workspace B login and confirm workspace A data is invisible", async ({
    page,
  }) => {
    await loginWorkspace(page, wsBSlug!, wsBPin!);

    await page.goto("/workspace/wishlist");
    await expect(
      page.getByRole("main").getByRole("heading", { name: "Wishlist" }),
    ).toBeVisible();
    await expect(page.getByText(alecPrivateState.wishlist)).toBeVisible();
    await expect(page.getByText(asherPrivateState.wishlist)).toHaveCount(0);

    await page.goto("/workspace/configurations");
    await expect(
      page.getByRole("main").getByRole("heading", { name: "Configurations" }),
    ).toBeVisible();
    await expect(page.getByText(alecPrivateState.configuration)).toBeVisible();
    await expect(page.getByText(asherPrivateState.configuration)).toHaveCount(
      0,
    );

    await page.goto("/workspace/logs");
    await expect(
      page.getByRole("main").getByRole("heading", { name: "Logs" }),
    ).toBeVisible();
    await expect(page.getByText(alecPrivateState.log)).toBeVisible();
    await expect(page.getByText(asherPrivateState.log)).toHaveCount(0);

    await logout(page);
  });

  test("logged out private routes are blocked", async ({ page }) => {
    await page.goto("/workspace/wishlist");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText("Select your workspace")).toBeVisible();
  });
});
