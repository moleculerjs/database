/**
 * Compile-time tests for the entity type inference from field definitions
 * (`defineFields`, `InferEntity`, `InferCreate`, `InferUpdate`, `EntityQuery`).
 *
 * Every assertion is checked by `npm run test:ts`. The `@ts-expect-error` lines
 * must fail to compile, otherwise the directive itself becomes an error.
 */

import { Context } from "moleculer";
import DbModule, {
	Service as DbService,
	defineFields,
	InferEntity,
	InferCreate,
	InferUpdate,
	EntityQuery,
	FindParams,
	DatabaseMethods,
	DatabaseServiceSettings,
	HookCustomFunctionArgument
} from "@moleculer/database";

// Type-level assertion helpers (no dependencies)
type Equal<A, B> =
	(<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Expect<T extends true> = T;

// =============================================================================
// Basic example
// =============================================================================

const userFields = defineFields({
	id: { type: "string", primaryKey: true, columnName: "_id" },
	name: { type: "string", required: true },
	age: { type: "number" },
	status: { type: "enum", values: ["active", "banned"] },
	tags: { type: "array", items: "string" },
	address: {
		type: "object",
		properties: {
			city: { type: "string", required: true },
			zip: { type: "number" }
		}
	},
	password: { type: "string", hidden: true },
	createdAt: { type: "number", readonly: true, onCreate: () => Date.now() }
});

type User = InferEntity<typeof userFields>;
type UserCreate = InferCreate<typeof userFields>;
type UserUpdate = InferUpdate<typeof userFields>;

export type BasicTests = [
	Expect<
		Equal<
			User,
			{
				id: string;
				name: string;
				age?: number;
				status?: "active" | "banned";
				tags?: string[];
				address?: { city: string; zip?: number };
				createdAt: number;
			}
		>
	>,
	Expect<
		Equal<
			UserCreate,
			{
				name: string;
				age?: number;
				status?: "active" | "banned";
				tags?: string[];
				address?: { city: string; zip?: number };
				password?: string;
			}
		>
	>,
	Expect<
		Equal<
			UserUpdate,
			{
				id: string;
				name?: string;
				age?: number;
				status?: "active" | "banned";
				tags?: string[];
				address?: { city?: string; zip?: number };
				password?: string;
			}
		>
	>
];

// `defineFields` is an identity function and also on the default export
const sameFields: typeof userFields = DbModule.defineFields(userFields);

// =============================================================================
// Required / optional rules
// =============================================================================

const flagFields = defineFields({
	id: { type: "number", primaryKey: true, generated: "user", required: true },
	req: { type: "string", required: true },
	notOptional: { type: "string", optional: false },
	requiredWins: { type: "string", required: false, optional: false },
	withDefault: { type: "boolean", required: true, default: true },
	withDefaultFn: { type: "number", default: () => 5 },
	withSet: { type: "string", required: true, set: ({ value }) => String(value) },
	nullable: { type: "string", required: true, nullable: true },
	byDefault: { type: "number", hidden: "byDefault", required: true },
	perm: { type: "string", required: true, readPermission: "admin" },
	virtualField: { type: "string", virtual: true, get: (v: any) => String(v) },
	immutableField: { type: "string", immutable: true },
	updatedAt: { type: "number", onUpdate: () => Date.now() },
	author: { type: "string", populate: "users.resolve" },
	disabled: false,
	anything: true
});

export type FlagTests = [
	Expect<
		Equal<
			InferEntity<typeof flagFields>,
			{
				id: number;
				req: string;
				notOptional: string;
				withDefault: boolean;
				withDefaultFn: number;
				withSet: string;
				nullable: string | null;
				requiredWins?: string;
				byDefault?: number;
				perm?: string;
				virtualField?: string;
				immutableField?: string;
				updatedAt?: number;
				author?: unknown;
				anything?: unknown;
			}
		>
	>,
	Expect<
		Equal<
			InferCreate<typeof flagFields>,
			{
				id: number;
				req: string;
				notOptional: string;
				nullable: string | null;
				byDefault: number;
				perm: string;
				requiredWins?: string;
				withDefault?: boolean;
				withDefaultFn?: number;
				withSet?: string;
				immutableField?: string;
				updatedAt?: number;
				author?: string;
				anything?: unknown;
			}
		>
	>,
	Expect<
		Equal<
			InferUpdate<typeof flagFields>,
			{
				id: number;
				req?: string;
				notOptional?: string;
				requiredWins?: string;
				withDefault?: boolean;
				withDefaultFn?: number;
				withSet?: string;
				nullable?: string | null;
				byDefault?: number;
				perm?: string;
				author?: string;
				anything?: unknown;
			}
		>
	>
];

// Database-generated primary key is not accepted on create
const generatedPk = defineFields({ id: { type: "string", primaryKey: true } });
export type GeneratedPkTests = [
	Expect<Equal<InferEntity<typeof generatedPk>, { id: string }>>,
	Expect<Equal<InferCreate<typeof generatedPk>, {}>>,
	Expect<Equal<InferUpdate<typeof generatedPk>, { id: string }>>
];

// =============================================================================
// Value types
// =============================================================================

const valueFields = defineFields({
	str: { type: "string" },
	strEnum: { type: "string", enum: ["a", "b"] },
	email: { type: "email" },
	url: { type: "url" },
	uuid: { type: "uuid" },
	num: { type: "number" },
	bool: { type: "boolean" },
	date: { type: "date" },
	strictDate: { type: "date", convert: false },
	numEnum: { type: "enum", values: [1, 2, 3] },
	anyField: { type: "any" },
	custom: { type: "custom", check: (value: any) => value },
	unknownType: { type: "objectID", columnType: "string" },
	plainObject: { type: "object" },
	record: { type: "record" },
	plainArray: { type: "array" },
	numbers: { type: "array", items: { type: "number" } },
	matrix: { type: "array", items: { type: "array", items: "number" } },
	dates: { type: "array", items: "date" },
	phones: {
		type: "array",
		items: {
			type: "object",
			properties: {
				type: { type: "enum", values: ["home", "mobile"], required: true },
				number: { type: "string", required: true },
				primary: { type: "boolean", default: false },
				secret: { type: "string", hidden: true },
				addedAt: { type: "number", readonly: true, onCreate: () => Date.now() }
			}
		}
	},
	nested: {
		type: "object",
		properties: {
			level2: {
				type: "object",
				required: true,
				properties: {
					level3: { type: "string", required: true },
					note: { type: "string", immutable: true }
				}
			}
		}
	}
});

type Values = InferEntity<typeof valueFields>;
type ValuesCreate = InferCreate<typeof valueFields>;
type ValuesUpdate = InferUpdate<typeof valueFields>;

type Phone = NonNullable<Values["phones"]>[number];

export type ValueTests = [
	Expect<Equal<Values["str"], string | undefined>>,
	Expect<Equal<Values["strEnum"], "a" | "b" | undefined>>,
	Expect<Equal<Values["email"], string | undefined>>,
	Expect<Equal<Values["url"], string | undefined>>,
	Expect<Equal<Values["uuid"], string | undefined>>,
	Expect<Equal<Values["num"], number | undefined>>,
	Expect<Equal<Values["bool"], boolean | undefined>>,
	// Output date is a `Date`, the input accepts anything the validator converts
	Expect<Equal<Values["date"], Date | undefined>>,
	Expect<Equal<ValuesCreate["date"], Date | string | number | undefined>>,
	Expect<Equal<ValuesUpdate["date"], Date | string | number | undefined>>,
	Expect<Equal<ValuesCreate["strictDate"], Date | undefined>>,
	Expect<Equal<Values["numEnum"], 1 | 2 | 3 | undefined>>,
	Expect<Equal<Values["anyField"], unknown>>,
	Expect<Equal<Values["custom"], unknown>>,
	Expect<Equal<Values["unknownType"], unknown>>,
	Expect<Equal<Values["plainObject"], Record<string, unknown> | undefined>>,
	Expect<Equal<Values["record"], Record<string, unknown> | undefined>>,
	Expect<Equal<Values["plainArray"], unknown[] | undefined>>,
	Expect<Equal<Values["numbers"], number[] | undefined>>,
	Expect<Equal<Values["matrix"], number[][] | undefined>>,
	Expect<Equal<Values["dates"], Date[] | undefined>>,
	Expect<Equal<ValuesCreate["dates"], (Date | string | number)[] | undefined>>,
	// Array of objects: the item rules follow the same mode
	Expect<
		Equal<
			Phone,
			{
				type: "home" | "mobile";
				number: string;
				primary: boolean;
				addedAt: number;
			}
		>
	>,
	Expect<
		Equal<
			NonNullable<ValuesCreate["phones"]>[number],
			{
				type: "home" | "mobile";
				number: string;
				primary?: boolean;
				secret?: string;
			}
		>
	>,
	// Nested objects: recursive, update is partial at every level (like the runtime validator)
	Expect<Equal<Values["nested"], { level2: { level3: string; note?: string } } | undefined>>,
	Expect<
		Equal<ValuesCreate["nested"], { level2: { level3: string; note?: string } } | undefined>
	>,
	Expect<Equal<ValuesUpdate["nested"], { level2?: { level3?: string } } | undefined>>
];

// =============================================================================
// Shorthand string definitions
// =============================================================================

const shorthandFields = defineFields({
	id: { type: "string", primaryKey: true, columnName: "_id" },
	title: "string|required|max:100",
	subtitle: "string | required",
	votes: "number|integer|min:0",
	score: "number|default:5",
	flag: "boolean|optional:false",
	notReq: "string|no-required",
	stamp: "number|readonly",
	labels: "string[]",
	weird: "enum|values:a,b"
});

export type ShorthandTests = [
	Expect<
		Equal<
			InferEntity<typeof shorthandFields>,
			{
				id: string;
				title: string;
				subtitle: string;
				score: number;
				flag: boolean;
				votes?: number;
				notReq?: string;
				stamp?: number;
				labels?: string[];
				weird?: unknown;
			}
		>
	>,
	Expect<
		Equal<
			InferCreate<typeof shorthandFields>,
			{
				title: string;
				subtitle: string;
				flag: boolean;
				votes?: number;
				score?: number;
				notReq?: string;
				labels?: string[];
				weird?: unknown;
			}
		>
	>
];

// =============================================================================
// Typed query
// =============================================================================

const query: EntityQuery<User> = {
	name: "John",
	age: { $gte: 18, $lt: 65 },
	status: { $in: ["active"] },
	tags: "admin",
	createdAt: { $exists: true }
};
const findParams: FindParams = { query, limit: 10 };

// @ts-expect-error `status` is a literal union
const badQueryValue: EntityQuery<User> = { status: "deleted" };
// @ts-expect-error unknown field
const badQueryField: EntityQuery<User> = { nonExisting: 1 };
// @ts-expect-error operator value must match the field type
const badQueryOperator: EntityQuery<User> = { age: { $gt: "18" } };

// =============================================================================
// Usage in a service
// =============================================================================

export const UsersService = {
	name: "users",
	mixins: [DbService({ adapter: "NeDB" })],
	settings: {
		fields: userFields
	} satisfies DatabaseServiceSettings,
	actions: {
		async register(this: DatabaseMethods, ctx: Context<UserCreate>): Promise<User> {
			return this.createEntity<User>(ctx, ctx.params);
		},
		async rename(
			this: DatabaseMethods,
			ctx: Context<{ id: string; name: string }>
		): Promise<User> {
			const changes: UserUpdate = { id: ctx.params.id, name: ctx.params.name };
			// `updateEntity<T>` expects a shallow `Partial<T>`, while `InferUpdate` is
			// deep-partial (nested objects are patched), hence the cast.
			return this.updateEntity<User>(ctx, changes as Partial<User>);
		},
		async adults(this: DatabaseMethods, ctx: Context): Promise<User[]> {
			return this.findEntities<User>(ctx, { query: { age: { $gte: 18 } } });
		}
	}
};

// Hook callbacks keep their argument type when it's annotated
const hookFields = defineFields({
	owner: {
		type: "string",
		onCreate: ({ ctx }: HookCustomFunctionArgument) => ctx.meta.userID
	}
});
export type HookTests = [
	Expect<Equal<InferEntity<typeof hookFields>, { owner: string }>>,
	Expect<Equal<InferCreate<typeof hookFields>, {}>>
];

// =============================================================================
// Negative cases
// =============================================================================

// @ts-expect-error `name` is required on create
const missingRequired: UserCreate = { age: 30 };

// @ts-expect-error nested required field on create
const missingNested: UserCreate = { name: "John", address: { zip: 1234 } };

// @ts-expect-error the value of an enum field must be one of the `values`
const wrongEnum: UserCreate = { name: "John", status: "deleted" };

// @ts-expect-error array item type
const wrongItem: UserCreate = { name: "John", tags: [1, 2] };

// @ts-expect-error readonly field can't be set on create
const readonlyOnCreate: UserCreate = { name: "John", createdAt: 1 };

// @ts-expect-error primary key is generated by the database
const pkOnCreate: UserCreate = { id: "abc", name: "John" };

// @ts-expect-error readonly field can't be set on update
const readonlyOnUpdate: UserUpdate = { id: "abc", createdAt: 1 };

// @ts-expect-error the primary key is required on update
const missingIdOnUpdate: UserUpdate = { name: "Jane" };

declare const user: User;
// @ts-expect-error hidden field is not in the entity
user.password;

const immutableFields = defineFields({
	id: { type: "string", primaryKey: true },
	kind: { type: "string", immutable: true },
	updatedAt: { type: "number", onUpdate: () => Date.now() },
	virtualName: { type: "string", virtual: true, get: (v: any) => String(v) }
});
// @ts-expect-error immutable field can't be set on update
const immutableOnUpdate: InferUpdate<typeof immutableFields> = { id: "a", kind: "x" };
// @ts-expect-error field set by `onUpdate` can't be set on update
const onUpdateOnUpdate: InferUpdate<typeof immutableFields> = { id: "a", updatedAt: 1 };
// @ts-expect-error virtual field can't be set on create
const virtualOnCreate: InferCreate<typeof immutableFields> = { virtualName: "x" };

// `defineFields` still reports mistakes in the definitions
defineFields({
	// @ts-expect-error unknown option (typo)
	name: { type: "string", requird: true }
});
defineFields({
	// @ts-expect-error option of another field type
	age: { type: "number", trim: true }
});
defineFields({
	// @ts-expect-error wrong option value type
	age: { type: "number", integer: "yes" }
});
defineFields({
	address: {
		type: "object",
		properties: {
			// @ts-expect-error nested unknown option
			city: { type: "string", hiden: true }
		}
	}
});
