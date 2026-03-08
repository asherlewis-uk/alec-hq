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

// ─── Workspace Login Validator (Phase 3) ────────────────────

export interface WorkspaceLoginInput {
  workspaceSlug: string;
  pin: string;
}

export function validateWorkspaceLoginInput(
  body: unknown,
): WorkspaceLoginInput {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Invalid request payload");
  }

  const input = body as Record<string, unknown>;
  const workspaceSlug = assertString(
    input.workspaceSlug,
    "workspaceSlug",
  ).toLowerCase();
  const pin = assertString(input.pin, "pin");

  if (!/^[a-z0-9-]{3,32}$/.test(workspaceSlug)) {
    throw new ValidationError(
      "workspaceSlug must be 3-32 characters of lowercase letters, digits, or hyphens",
    );
  }

  if (!/^\d{6}$/.test(pin)) {
    throw new ValidationError("PIN must be exactly 6 digits");
  }

  return { workspaceSlug, pin };
}

// ─── Phase 4 Validators ────────────────────────────────────

export interface CreateCatalogAssetInput {
  name: string;
  category: AssetCategory;
  slug?: string | null;
  summary?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  coverImage?: string | null;
  specs?: Record<string, string> | null;
  isPublic?: boolean;
}

export function validateCreateCatalogAssetInput(
  body: unknown,
): CreateCatalogAssetInput {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Invalid request payload");
  }
  const input = body as Record<string, unknown>;
  const name = assertString(input.name, "name");
  if (name.length === 0 || name.length > 120) {
    throw new ValidationError("name must be between 1 and 120 characters");
  }
  const category = assertString(input.category, "category") as AssetCategory;
  if (!assetCategories.has(category)) {
    throw new ValidationError("category is invalid");
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
    category,
    slug: assertOptionalString(input.slug, "slug"),
    summary: assertOptionalString(input.summary, "summary"),
    manufacturer: assertOptionalString(input.manufacturer, "manufacturer"),
    model: assertOptionalString(input.model, "model"),
    coverImage: assertOptionalString(input.coverImage, "coverImage"),
    specs,
    isPublic: input.isPublic === undefined ? true : input.isPublic === true,
  };
}

export interface CreateWorkspaceAssetLinkInput {
  catalogAssetId: string;
  localStatus?: AssetStatus;
  notes?: string | null;
}

export function validateCreateWorkspaceAssetLinkInput(
  body: unknown,
): CreateWorkspaceAssetLinkInput {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Invalid request payload");
  }
  const input = body as Record<string, unknown>;
  const catalogAssetId = assertString(input.catalogAssetId, "catalogAssetId");
  if (!isValidUUID(catalogAssetId)) {
    throw new ValidationError("catalogAssetId must be a valid UUID");
  }
  let localStatus: AssetStatus | undefined;
  if (input.localStatus !== undefined) {
    localStatus = assertString(input.localStatus, "localStatus") as AssetStatus;
    if (!assetStatuses.has(localStatus)) {
      throw new ValidationError("localStatus is invalid");
    }
  }
  return {
    catalogAssetId,
    localStatus,
    notes: assertOptionalString(input.notes, "notes"),
  };
}

export interface UpdateWorkspaceAssetLinkInput {
  localStatus?: AssetStatus;
  notes?: string | null;
}

export function validateUpdateWorkspaceAssetLinkInput(
  body: unknown,
): UpdateWorkspaceAssetLinkInput {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Invalid request payload");
  }
  const input = body as Record<string, unknown>;
  const out: UpdateWorkspaceAssetLinkInput = {};
  if (input.localStatus !== undefined) {
    const localStatus = assertString(
      input.localStatus,
      "localStatus",
    ) as AssetStatus;
    if (!assetStatuses.has(localStatus)) {
      throw new ValidationError("localStatus is invalid");
    }
    out.localStatus = localStatus;
  }
  if (input.notes !== undefined) {
    out.notes = assertOptionalString(input.notes, "notes");
  }
  return out;
}

export interface CreateWorkspaceConfigurationInput {
  name: string;
  kind: string;
  notes?: string | null;
}

export function validateCreateWorkspaceConfigurationInput(
  body: unknown,
): CreateWorkspaceConfigurationInput {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Invalid request payload");
  }
  const input = body as Record<string, unknown>;
  const name = assertString(input.name, "name");
  if (name.length === 0 || name.length > 100) {
    throw new ValidationError("name must be between 1 and 100 characters");
  }
  const kind = assertString(input.kind, "kind");
  if (kind.length === 0 || kind.length > 40) {
    throw new ValidationError("kind must be between 1 and 40 characters");
  }
  return {
    name,
    kind,
    notes: assertOptionalString(input.notes, "notes"),
  };
}

export interface CreateConfigurationSlotInput {
  slotKey: string;
  label: string;
  sortOrder?: number;
}

export function validateCreateConfigurationSlotInput(
  body: unknown,
): CreateConfigurationSlotInput {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Invalid request payload");
  }
  const input = body as Record<string, unknown>;
  const slotKey = assertString(input.slotKey, "slotKey");
  if (slotKey.length === 0 || slotKey.length > 60) {
    throw new ValidationError("slotKey must be between 1 and 60 characters");
  }
  const label = assertString(input.label, "label");
  if (label.length === 0 || label.length > 100) {
    throw new ValidationError("label must be between 1 and 100 characters");
  }
  let sortOrder: number | undefined;
  if (input.sortOrder !== undefined) {
    if (
      typeof input.sortOrder !== "number" ||
      !Number.isInteger(input.sortOrder)
    ) {
      throw new ValidationError("sortOrder must be an integer");
    }
    sortOrder = input.sortOrder;
  }
  return { slotKey, label, sortOrder };
}

export interface CreateSlotAssignmentInput {
  catalogAssetId: string;
  workspaceAssetLinkId?: string | null;
  installedAt?: string | null;
  notes?: string | null;
}

export function validateCreateSlotAssignmentInput(
  body: unknown,
): CreateSlotAssignmentInput {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Invalid request payload");
  }
  const input = body as Record<string, unknown>;
  const catalogAssetId = assertString(input.catalogAssetId, "catalogAssetId");
  if (!isValidUUID(catalogAssetId)) {
    throw new ValidationError("catalogAssetId must be a valid UUID");
  }
  if (
    input.workspaceAssetLinkId !== undefined &&
    input.workspaceAssetLinkId !== null
  ) {
    const linkId = assertString(
      input.workspaceAssetLinkId,
      "workspaceAssetLinkId",
    );
    if (!isValidUUID(linkId)) {
      throw new ValidationError("workspaceAssetLinkId must be a valid UUID");
    }
  }
  return {
    catalogAssetId,
    workspaceAssetLinkId: assertOptionalString(
      input.workspaceAssetLinkId,
      "workspaceAssetLinkId",
    ),
    installedAt: assertOptionalString(input.installedAt, "installedAt"),
    notes: assertOptionalString(input.notes, "notes"),
  };
}

export interface CreateWorkspaceLogInput {
  workspaceAssetLinkId?: string | null;
  slotAssignmentId?: string | null;
  type: LogType;
  title: string;
  description?: string | null;
  date: string;
  mileage?: number | null;
  cost?: number | null;
  performedBy?: string | null;
}

export function validateCreateWorkspaceLogInput(
  body: unknown,
): CreateWorkspaceLogInput {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Invalid request payload");
  }
  const input = body as Record<string, unknown>;
  const type = assertString(input.type, "type") as LogType;
  if (!logTypes.has(type)) {
    throw new ValidationError("type is invalid");
  }
  const title = assertString(input.title, "title");
  if (title.length === 0 || title.length > 120) {
    throw new ValidationError("title must be between 1 and 120 characters");
  }
  const date = assertString(input.date, "date");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new ValidationError("date must be YYYY-MM-DD");
  }
  if (
    input.workspaceAssetLinkId !== undefined &&
    input.workspaceAssetLinkId !== null
  ) {
    const linkId = assertString(
      input.workspaceAssetLinkId,
      "workspaceAssetLinkId",
    );
    if (!isValidUUID(linkId)) {
      throw new ValidationError("workspaceAssetLinkId must be a valid UUID");
    }
  }
  if (input.slotAssignmentId !== undefined && input.slotAssignmentId !== null) {
    const assignmentId = assertString(
      input.slotAssignmentId,
      "slotAssignmentId",
    );
    if (!isValidUUID(assignmentId)) {
      throw new ValidationError("slotAssignmentId must be a valid UUID");
    }
  }
  return {
    type,
    title,
    date,
    workspaceAssetLinkId: assertOptionalString(
      input.workspaceAssetLinkId,
      "workspaceAssetLinkId",
    ),
    slotAssignmentId: assertOptionalString(
      input.slotAssignmentId,
      "slotAssignmentId",
    ),
    description: assertOptionalString(input.description, "description"),
    mileage: assertOptionalNumber(input.mileage, "mileage"),
    cost: assertOptionalNumber(input.cost, "cost"),
    performedBy: assertOptionalString(input.performedBy, "performedBy"),
  };
}

export interface CreateWorkspaceWishlistInput {
  catalogAssetId?: string | null;
  name: string;
  brand?: string | null;
  url?: string | null;
  estimatedPrice?: number | null;
  priority: WishlistPriority;
  notes?: string | null;
}

export function validateCreateWorkspaceWishlistInput(
  body: unknown,
): CreateWorkspaceWishlistInput {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Invalid request payload");
  }
  const input = body as Record<string, unknown>;
  const name = assertString(input.name, "name");
  if (name.length === 0 || name.length > 120) {
    throw new ValidationError("name must be between 1 and 120 characters");
  }
  const priority = assertString(input.priority, "priority") as WishlistPriority;
  if (!wishlistPriorities.has(priority)) {
    throw new ValidationError("priority is invalid");
  }
  if (input.catalogAssetId !== undefined && input.catalogAssetId !== null) {
    const catId = assertString(input.catalogAssetId, "catalogAssetId");
    if (!isValidUUID(catId)) {
      throw new ValidationError("catalogAssetId must be a valid UUID");
    }
  }
  const url = assertUrl(assertOptionalString(input.url, "url"), "url");
  return {
    name,
    priority,
    catalogAssetId: assertOptionalString(
      input.catalogAssetId,
      "catalogAssetId",
    ),
    brand: assertOptionalString(input.brand, "brand"),
    url,
    estimatedPrice: assertOptionalNumber(
      input.estimatedPrice,
      "estimatedPrice",
    ),
    notes: assertOptionalString(input.notes, "notes"),
  };
}
