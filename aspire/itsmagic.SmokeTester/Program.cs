using Microsoft.Playwright;
using static Microsoft.Playwright.Assertions;

const string url = "http://localhost:4200/";

Console.WriteLine("Testing begins...");

var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
var clientName = $"Smoke Test Client {timestamp}";
var clientEmail = $"smoke.{timestamp}@example.com";
var updatedName = $"Smoke Test Client Updated {timestamp}";
var updatedEmail = $"smoke.updated.{timestamp}@example.com";

var playwright = await Playwright.CreateAsync();
await using var browser = await playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions
{
    Headless = false
});
var context = await browser.NewContextAsync();
var page = await context.NewPageAsync();

Console.WriteLine("Opening website...");
await page.GotoAsync(url, new PageGotoOptions { WaitUntil = WaitUntilState.NetworkIdle });

Console.WriteLine("Navigating to clients list...");
await page.GetByRole(AriaRole.Link, new() { Name = "Clients" }).ClickAsync();
await page.GetByRole(AriaRole.Heading, new() { Name = "Clients" }).WaitForAsync();

Console.WriteLine("Creating new client...");
await page.GetByRole(AriaRole.Link, new() { Name = "New Client" }).ClickAsync();
await page.GetByRole(AriaRole.Heading, new() { Name = "Create Client" }).WaitForAsync();
await page.GetByLabel("Name").FillAsync(clientName);
await page.GetByLabel("Email").FillAsync(clientEmail);
await page.GetByRole(AriaRole.Button, new() { Name = "Create Client" }).ClickAsync();

await page.GetByRole(AriaRole.Heading, new() { Name = "Clients" }).WaitForAsync();
var createdRow = page.Locator("tbody tr").Filter(new LocatorFilterOptions { HasTextString = clientName });
await Expect(createdRow).ToHaveCountAsync(1);
await Expect(createdRow).ToContainTextAsync(clientEmail);

Console.WriteLine("Updating client...");
await createdRow.GetByRole(AriaRole.Link, new() { Name = "Edit" }).ClickAsync();
await page.GetByRole(AriaRole.Heading, new() { Name = "Edit Client" }).WaitForAsync();
await page.GetByLabel("Name").FillAsync(updatedName);
await page.GetByLabel("Email").FillAsync(updatedEmail);
await page.GetByRole(AriaRole.Button, new() { Name = "Save Changes" }).ClickAsync();

await page.GetByRole(AriaRole.Heading, new() { Name = updatedName }).WaitForAsync();
var nameValue = page.Locator(".row").Filter(new LocatorFilterOptions { HasTextString = "Name" }).Locator("strong");
var emailValue = page.Locator(".row").Filter(new LocatorFilterOptions { HasTextString = "Email" }).Locator("strong");
await Expect(nameValue).ToHaveTextAsync(updatedName);
await Expect(emailValue).ToHaveTextAsync(updatedEmail);

Console.WriteLine("Deleting client...");
var dialogTcs = new TaskCompletionSource<IDialog>();
void DialogHandler(object? _, IDialog dialog) => dialogTcs.TrySetResult(dialog);
page.Dialog += DialogHandler;
await page.GetByRole(AriaRole.Button, new() { Name = "Delete Client" }).ClickAsync();
var dialog = await dialogTcs.Task;
await dialog.AcceptAsync();
page.Dialog -= DialogHandler;

await page.GetByRole(AriaRole.Heading, new() { Name = "Clients" }).WaitForAsync();
var deletedRow = page.Locator("tbody tr").Filter(new LocatorFilterOptions { HasTextString = updatedName });
await Expect(deletedRow).ToHaveCountAsync(0);

Console.WriteLine("Smoke test completed successfully.");
