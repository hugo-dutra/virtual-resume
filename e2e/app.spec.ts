import { expect, test } from '@playwright/test'

test('landing to traditional navigation', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: /escolha seu modo de navegacao/i })).toBeVisible()
  await page.locator('a[href="/traditional"]').first().click()

  await expect(page).toHaveURL(/\/traditional/)
  await expect(page.getByRole('heading', { name: /hugo alves dutra/i })).toBeVisible()
  await expect(page.getByText(/software engineer/i)).toBeVisible()
})

test('traditional mode renders real resume sections', async ({ page }) => {
  await page.goto('/traditional')

  await expect(page.getByText(/foton informatica/i)).toBeVisible()
  await expect(page.getByText(/^Ilia$/)).toBeVisible()
  await expect(page.getByText(/secretariat of state for education/i)).toBeVisible()
  await expect(page.getByText(/catholic university of brasilia/i)).toBeVisible()
})


test('adventure mode renders hud and controls', async ({ page }) => {
  await page.goto('/adventure')

  await expect(page.getByRole('heading', { name: /mapa interativo 3d/i })).toBeVisible()
  await expect(page.getByText(/wasd ou setas para mover/i)).toBeVisible()
  await expect(page.getByText(/predios interativos/i)).toBeVisible()
})
