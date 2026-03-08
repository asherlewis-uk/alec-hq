import type {
  AssetCategory,
  AssetStatus,
  ComponentCondition,
  CreateAssetInput,
  CreateAssetLogInput,
  CreateComponentInput,
  CreateWishlistInput,
  LogType,
  UpdateAssetInput,
  WishlistPriority,
} from "@/lib/types";

export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isValidUUID(id: string): boolean {
  return UUID_REGEX.test(id);
}

const assetCategories = new Set<AssetCategory>([
  "VEHICLE",
  "RIG",
  "PERIPHERAL",
  "NETWORK",
]);
const assetStatuses = new Set<AssetStatus>([
  "ACTIVE",
  "STORED",
  "SOLD",
  "WISHLIST",
]);
const componentConditions = new Set<ComponentCondition>([
  "STOCK",
  "UPGRADED",
  "AFTERMARKET",
  "WORN",
  "FAILED",
]);
const logTypes = new Set<LogType>([
  "MAINTENANCE",
  "UPGRADE",
  "REPAIR",
  "INSPECTION",
  "NOTE",
]);
const wishlistPriorities = new Set<WishlistPriority>(["LOW", "MEDIUM", "HIGH"]);

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

function assertString(value: unknown, field: string): string {
  if (typeof value !== "string") {
    throw new ValidationError(`${field} must be a string`);
  }
  return value.trim();
}

function assertOptionalString(value: unknown, field: string): string | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  if (typeof value !== "string") {
    throw new ValidationError(`${field} must be a string`);
  }
  return value.trim();
}

function assertOptionalNumber(value: unknown, field: string): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new ValidationError(`${field} must be a number`);
  }
  if (value < 0) {
    throw new ValidationError(`${field} must be non-negative`);
  }
  return value;
}

function assertUrl(value: string | null, field: string): string | null {
  if (!value) return null;
  try {
    new URL(value);
    return value;
  } catch {
    throw new ValidationError(`${field} must be a valid URL`);
  }
}

export function validateCreateAssetInput(body: unknown): CreateAssetInput {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Invalid request payload");
  }
  const input = body as Record<string, unknown>;
  const name = assertString(input.name, "name");
  if (name.length === 0 || name.length > 100) {
    throw new ValidationError("name must be between 1 and 100 characters");
  }
  const category = assertString(input.category, "category") as AssetCategory;
  if (!assetCategories.has(category)) {
    throw new ValidationError("category is invalid");
  }
  const status = assertString(input.status, "status") as AssetStatus;
  if (!assetStatuses.has(status)) {
    throw new ValidationError("status is invalid");
  }
  if (typeof input.isPublic !== "boolean") {
    throw new ValidationError("isPublic must be a boolean");
  }
  return {
    name,
    category,
    status,
    isPublic: input.isPublic,
    coverImage: assertOptionalString(input.coverImage, "coverImage"),
    purchaseDate: assertOptionalString(input.purchaseDate, "purchaseDate"),
    purchasePrice: assertOptionalNumber(input.purchasePrice, "purchasePrice"),
    notes: assertOptionalString(input.notes, "notes"),
  };
}

export function validateUpdateAssetInput(body: unknown): UpdateAssetInput {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Invalid request payload");
  }
  const input = body as Record<string, unknown>;
  const out: UpdateAssetInput = {};

  if (input.name !== undefined) {
    const name = assertString(input.name, "name");
    if (name.length === 0 || name.length > 100) {
      throw new ValidationError("name must be between 1 and 100 characters");
    }
    out.name = name;
  }
  if (input.category !== undefined) {
    const category = assertString(input.category, "category") as AssetCategory;
    if (!assetCategories.has(category))
      throw new ValidationError("category is invalid");
    out.category = category;
  }
  if (input.status !== undefined) {
    const status = assertString(input.status, "status") as AssetStatus;
    if (!assetStatuses.has(status))
      throw new ValidationError("status is invalid");
    out.status = status;
  }
  if (input.isPublic !== undefined) {
    if (typeof input.isPublic !== "boolean")
      throw new ValidationError("isPublic must be a boolean");
    out.isPublic = input.isPublic;
  }
  if (input.coverImage !== undefined)
    out.coverImage = assertOptionalString(input.coverImage, "coverImage");
  if (input.purchaseDate !== undefined)
    out.purchaseDate = assertOptionalString(input.purchaseDate, "purchaseDate");
  if (input.purchasePrice !== undefined)
    out.purchasePrice = assertOptionalNumber(
      input.purchasePrice,
      "purchasePrice",
    );
  if (input.notes !== undefined)
    out.notes = assertOptionalString(input.notes, "notes");
  return out;
}

export function validateCreateComponentInput(
  body: unknown,
): CreateComponentInput {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Invalid request payload");
  }
  const input = body as Record<string, unknown>;
  const name = assertString(input.name, "name");
  if (name.length === 0 || name.length > 100) {
    throw new ValidationError("name must be between 1 and 100 characters");
  }
  const condition = assertString(
    input.condition,
    "condition",
  ) as ComponentCondition;
  if (!componentConditions.has(condition)) {
    throw new ValidationError("condition is invalid");
  }

  let specs: Record<string, string> | null = null;
  if (input.specs !== undefined && input.specs !== null) {
    if (typeof input.specs !== "object") {
      throw new ValidationError("specs must be an object");
    }
    specs = {};
    for (const [key, value] of Object.entries(
      input.specs as Record<string, unknown>,
    )) {
      if (typeof value !== "string") {
        throw new ValidationError(
          `Invalid value for spec "${key}". All spec values must be strings.`,
        );
      }
      specs[key] = value;
    }
  }

  return {
    name,
    brand: assertOptionalString(input.brand, "brand"),
    model: assertOptionalString(input.model, "model"),
    condition,
    specs,
    installedDate: assertOptionalString(input.installedDate, "installedDate"),
    notes: assertOptionalString(input.notes, "notes"),
  };
}

export function validateCreateLogInput(body: unknown): CreateAssetLogInput {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Invalid request payload");
  }
  const input = body as Record<string, unknown>;
  const type = assertString(input.type, "type") as LogType;
  if (!logTypes.has(type)) throw new ValidationError("type is invalid");
  const title = assertString(input.title, "title");
  if (title.length === 0 || title.length > 100) {
    throw new ValidationError("title must be between 1 and 100 characters");
  }
  const date = assertString(input.date, "date");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new ValidationError("date must be YYYY-MM-DD");
  }
  return {
    type,
    title,
    date,
    description: assertOptionalString(input.description, "description"),
    mileage: assertOptionalNumber(input.mileage, "mileage"),
    cost: assertOptionalNumber(input.cost, "cost"),
    performedBy: assertOptionalString(input.performedBy, "performedBy"),
  };
}

export function validateCreateWishlistInput(
  body: unknown,
): CreateWishlistInput {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Invalid request payload");
  }
  const input = body as Record<string, unknown>;
  const name = assertString(input.name, "name");
  if (name.length === 0 || name.length > 100) {
    throw new ValidationError("name must be between 1 and 100 characters");
  }
  const priority = assertString(input.priority, "priority") as WishlistPriority;
  if (!wishlistPriorities.has(priority))
    throw new ValidationError("priority is invalid");

  const url = assertUrl(assertOptionalString(input.url, "url"), "url");
  return {
    name,
    priority,
    brand: assertOptionalString(input.brand, "brand"),
    url,
    estimatedPrice: assertOptionalNumber(
      input.estimatedPrice,
      "estimatedPrice",
    ),
    notes: assertOptionalString(input.notes, "notes"),
  };
}
