# Multi-Agent Custom Automation Engine + Essential Studio UI Edition — Setup Guide

This guide wires two external components into the `alec-hq` codeserver environment:

1. **Microsoft Multi-Agent Custom Automation Engine Solution Accelerator** — Azure-hosted multi-agent orchestration backend.
2. **Syncfusion Essential Studio® UI Edition Binary** — licensed UI component library (5-member team license, 6-month VSDE subscription).

> **Scope of this guide:** infrastructure provisioning and package wiring only.
> All API keys and the Syncfusion license key must be inserted by you.
> No existing `alec-hq` application code is modified.

---

## Prerequisites

| Tool | Minimum version | Install reference |
|------|-----------------|-------------------|
| [Azure Developer CLI (`azd`)](https://learn.microsoft.com/azure/developer/azure-developer-cli/install-azd) | latest | `winget install microsoft.azd` / `brew tap azure/azd && brew install azd` / `curl -fsSL https://aka.ms/install-azd.sh | bash` |
| Azure CLI (`az`) | 2.60+ | <https://learn.microsoft.com/cli/azure/install-azure-cli> |
| Node.js | 20 LTS | <https://nodejs.org> |
| Python | 3.11+ | <https://python.org> |
| `uv` (Python package manager) | latest | `pip install uv` |
| Docker Desktop (optional, for local backend) | latest | <https://www.docker.com/products/docker-desktop> |

> Your Azure subscription must have sufficient quota for **Azure OpenAI** (GPT-4o or GPT-4-Turbo) before running `azd up`.

---

## Part 1 — Multi-Agent Custom Automation Engine

### 1.1 Clone the accelerator repository

Open the `alec-hq` codeserver terminal and run these commands **outside** the `alec-hq` working tree (e.g., in `~/projects`):

```bash
git clone https://github.com/microsoft/Multi-Agent-Custom-Automation-Engine-Solution-Accelerator.git
cd Multi-Agent-Custom-Automation-Engine-Solution-Accelerator
```

### 1.2 Authenticate with Azure

```bash
azd auth login
```

This opens a browser tab. Sign in with the Azure account that has OpenAI quota.  
If running in a headless codeserver, append `--use-device-code`:

```bash
azd auth login --use-device-code
```

### 1.3 Provision and deploy to Azure

```bash
azd up
```

`azd up` will:

- prompt you to choose an Azure subscription and region
- create a new resource group (or let you target an existing one)
- provision Azure Container Apps, Azure Cosmos DB, and Azure OpenAI
- build and push the container images
- output the deployed **API base URL** (save this — you will need it below)

> If provisioning fails due to quota, select a different region or request a quota increase from <https://aka.ms/oai/stuquotarequest>.

### 1.4 Run the backend locally (optional)

If you want to test the backend inside codeserver before deploying:

```bash
cd src/backend
uv run uvicorn app:app --port 8000
```

The local API will be available at `http://localhost:8000`.

### 1.5 Record your API keys

After `azd up` completes, note the following values from the Azure portal or the `azd` output:

| Value | Where to find it |
|-------|-----------------|
| Multi-Agent API base URL | Shown in `azd up` output (`AZURE_CONTAINER_APP_URL`) |
| Azure OpenAI endpoint | Azure portal → your OpenAI resource → Keys and Endpoint |
| Azure OpenAI API key | Same location as above |
| Cosmos DB connection string | Azure portal → your Cosmos DB account → Connection strings |

These values go into `.env.local` — see [Part 3](#part-3--environment-variables).

---

## Part 2 — Essential Studio® UI Edition (Syncfusion)

Choose the section that matches your frontend technology.

### Option A — JavaScript / TypeScript (React / Next.js)

This is the relevant path for `alec-hq`, which is a Next.js application.

#### 2A.1 Install the packages

Navigate to the `alec-hq` repo root and install the Syncfusion packages you need.  
Example for a rich set of components:

```bash
# Core base (required by all Syncfusion JS packages)
npm install @syncfusion/ej2-base

# React component wrappers (install only the packages you use)
npm install @syncfusion/ej2-react-grids
npm install @syncfusion/ej2-react-charts
npm install @syncfusion/ej2-react-schedule
npm install @syncfusion/ej2-react-inputs
npm install @syncfusion/ej2-react-buttons
npm install @syncfusion/ej2-react-navigations
npm install @syncfusion/ej2-react-dropdowns
npm install @syncfusion/ej2-react-popups
```

> If you have the offline binary provided with the VSDE subscription, you can install from the local path instead of npm:
>
> ```bash
> npm install /path/to/syncfusion/ej2-react-grids-*.tgz
> ```

#### 2A.2 Register the license key — boilerplate snippet

> **Do not hardcode the key.** Read it from the environment variable defined in [Part 3](#part-3--environment-variables).

Add the following at the top of your application entry point (e.g., `src/app/layout.tsx` or a dedicated `src/lib/syncfusion.ts` module that you import early):

```typescript
// src/lib/syncfusion.ts  <-- create this new file; do NOT edit existing files
import { registerLicense } from '@syncfusion/ej2-base';

const key = process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY;
if (!key) {
  console.warn('[syncfusion] NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY is not set. UI components will show a license banner in non-production builds.');
} else {
  registerLicense(key);
}
```

Then import this module once, before any Syncfusion component is used:

```typescript
// At the top of the file where you first use a Syncfusion component
import '@/lib/syncfusion';
```

> All five team members share the same `NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY` value. The key is a Syncfusion-issued validation token that will be visible in the compiled client bundle — this is expected and documented by Syncfusion. Even so, keep it out of source control via `.env.local` (already in `.gitignore`) to avoid exposing it to forks, public mirrors, or contributors who should not use the same license.

---

### Option B — .NET / Blazor

If a .NET frontend is added alongside or instead of the Next.js app:

#### 2B.1 Add the NuGet package

```bash
dotnet add package Syncfusion.Blazor
```

If using the offline binaries from the VSDE subscription:

```bash
dotnet add package Syncfusion.Blazor --source /path/to/syncfusion/nuget-binaries
```

#### 2B.2 Register the license key — boilerplate snippet

In `Program.cs`, read from an environment variable and log a warning if the key is absent (consistent with the TypeScript approach):

```csharp
// Program.cs — add before builder.Build()
var syncfusionKey = builder.Configuration["SYNCFUSION_LICENSE_KEY"]
    ?? Environment.GetEnvironmentVariable("SYNCFUSION_LICENSE_KEY");

if (string.IsNullOrEmpty(syncfusionKey))
{
    // Replace with your preferred logger if available at this point in startup
    Console.Error.WriteLine("[syncfusion] SYNCFUSION_LICENSE_KEY is not configured. UI components will show a license banner in non-production builds.");
}
else
{
    Syncfusion.Licensing.SyncfusionLicenseProvider.RegisterLicense(syncfusionKey);
}
```

Set the key via `dotnet user-secrets` for local development:

```bash
dotnet user-secrets set "SYNCFUSION_LICENSE_KEY" "your_license_key_here"
```

---

## Part 3 — Environment Variables

### 3.1 Update `.env.local`

Copy the block below into your `.env.local` file (already created from `.env.example`) and fill in your actual values where indicated:

```dotenv
# ─────────────────────────────────────────────────────────────────
# Multi-Agent Custom Automation Engine
# ─────────────────────────────────────────────────────────────────
# The base URL output by `azd up` (Azure Container Apps URL)
MULTI_AGENT_API_BASE_URL=

# Azure OpenAI — obtained from Azure portal → OpenAI resource → Keys and Endpoint
AZURE_OPENAI_ENDPOINT=
AZURE_OPENAI_API_KEY=

# Azure Cosmos DB — obtained from Azure portal → Cosmos DB → Connection strings
AZURE_COSMOS_CONNECTION_STRING=

# ─────────────────────────────────────────────────────────────────
# Syncfusion Essential Studio® UI Edition
# ─────────────────────────────────────────────────────────────────
# Your 5-member team license key from the VSDE subscription portal.
# NEXT_PUBLIC_ prefix exposes this to the browser bundle (required for
# client-side registerLicense() calls in Next.js).
NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY=

# .NET only — omit if you are not using a .NET/Blazor frontend
SYNCFUSION_LICENSE_KEY=
```

> Replace every blank value with your actual key. Do not commit `.env.local` to source control (it is already in `.gitignore`).

### 3.2 Vercel / CI deployment

Add each variable above to your Vercel project environment settings (Settings → Environment Variables).  
For CI pipelines, add them as encrypted repository secrets and inject them as environment variables in your workflow.

---

## Part 4 — Team Collaboration Notes

- All five licensed developers share the **same** `NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY` value.
- Each developer must set the key in their own local `.env.local`. It is never committed to the repository.
- For deployed environments (Vercel, Azure Container Apps) the key is set once in the hosting platform's secret store and applies to all instances.
- The Multi-Agent backend is shared infrastructure — only one person needs to run `azd up`. All teammates point their `MULTI_AGENT_API_BASE_URL` at the same deployed endpoint.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `azd up` fails with "InsufficientQuota" | No Azure OpenAI quota in chosen region | Select a different region or [request a quota increase](https://aka.ms/oai/stuquotarequest) |
| Syncfusion components show a license banner | `registerLicense` was not called before component mount, or the key is empty | Ensure `import '@/lib/syncfusion'` is at the top of the entry file and `NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY` is set |
| `NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY is not set` warning in console | Variable missing from `.env.local` | Add the key as described in Part 3 |
| `azd auth login` fails in headless codeserver | Browser cannot open | Use `azd auth login --use-device-code` |
| Local backend (`uvicorn`) starts but returns 401 | Azure OpenAI key not configured in local `.env` | Export `AZURE_OPENAI_API_KEY` in your shell or add it to the backend `.env` |
