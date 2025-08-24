declare module "@moleculer/database" {
	import {
		Context,
		ServiceSchema,
		ServiceMethods,
		ServiceActions,
		Service as MoleculerService,
		ActionParams,
		ActionHandler,
		ServiceSettingSchema,
		ServiceEvents,
		ServiceHooks,
		Errors as MoleculerErrors,
		CallingOptions,
		ServiceBroker,
		GenericObject,
		Loggers,
		Service
	} from "moleculer";

	// Extended Context with meta properties for common use cases
	export interface DatabaseContext<TParams = GenericObject, TMeta = GenericObject>
		extends Context<TParams, TMeta> {
		meta: TMeta & {
			tenantId?: string;
			user?: {
				id?: string;
				[key: string]: any;
			};
			[key: string]: any;
		};
	}

	// Re-export the main entity not found error
	export class EntityNotFoundError extends MoleculerErrors.MoleculerClientError {
		constructor(id: any);
	}

	export namespace Errors {
		export class EntityNotFoundError extends MoleculerErrors.MoleculerClientError {
			constructor(id: any);
		}
	}

	// Field type definitions
	export type FieldType =
		| "any"
		| "array"
		| "boolean"
		| "class"
		| "currency"
		| "custom"
		| "date"
		| "email"
		| "enum"
		| "equal"
		| "forbidden"
		| "function"
		| "luhn"
		| "mac"
		| "multi"
		| "number"
		| "object"
		| "record"
		| "string"
		| "tuple"
		| "url"
		| "uuid";

	export type EntityChangedEventType = "broadcast" | "emit" | null;

	export interface PopulateDefinition {
		/** Service name for populating */
		service?: string;
		/** Action name for populating */
		action?: string;
		/** Params for populating action */
		params?: Record<string, any>;
		/** Handler function for populating */
		handler?: (ids: any[], docs: any[], rule: PopulateDefinition, ctx: Context<any, any>) => Promise<any>;
		/** Key field name in the target service */
		keyField?: string;
		/** Populated field name in entity */
		populateFields?: string | string[];
	}

	export interface BaseFieldDefinition {
		/** Field type */
		type?: FieldType | string;
		/** Field is required */
		required?: boolean;
		/** Field is optional (inverse of required) */
		optional?: boolean;
		/** Column name in database */
		columnName?: string;
		/** Column type for SQL databases */
		columnType?: string;
		/** Primary key field */
		primaryKey?: boolean;
		/** Field is hidden from results */
		hidden?: boolean | "byDefault";
		/** Field is read-only */
		readonly?: boolean;
		/** Field is immutable after creation */
		immutable?: boolean;
		/** Default value */
		default?: any | (() => any);
		/** Permission required for this field */
		permission?: string | string[];
		/** Read permission required for this field */
		readPermission?: string | string[];
		/** Population configuration */
		populate?:
			| PopulateDefinition
			| ((ctx: Context<any, any>, values: any[], docs: any[]) => Promise<any>);
		/** Transformation function when getting value */
		get?: (value: any, entity: any, field: BaseFieldDefinition, ctx: Context<any, any>) => any;
		/** Transformation function when setting value */
		set?: (value: any, entity: any, field: BaseFieldDefinition, ctx: Context<any, any>) => any;
		/** Custom validation function */
		validate?: (
			value: any,
			entity: any,
			field: BaseFieldDefinition,
			ctx: Context<any, any>
		) => Promise<boolean | string>;
		/** Lifecycle hook: called when entity is created */
		onCreate?: (value: any, entity: any, field: BaseFieldDefinition, ctx: Context<any, any>) => any;
		/** Lifecycle hook: called when entity is updated */
		onUpdate?: (value: any, entity: any, field: BaseFieldDefinition, ctx: Context<any, any>) => any;
		/** Lifecycle hook: called when entity is replaced */
		onReplace?: (value: any, entity: any, field: BaseFieldDefinition, ctx: Context<any, any>) => any;
		/** Lifecycle hook: called when entity is removed (enables soft delete) */
		onRemove?: (value: any, entity: any, field: BaseFieldDefinition, ctx: Context<any, any>) => any;
	}

	export interface StringFieldDefinition extends BaseFieldDefinition {
		type: "string";
		/** Minimum length */
		min?: number;
		/** Maximum length */
		max?: number;
		/** Exact length */
		length?: number;
		/** Pattern to match */
		pattern?: string | RegExp;
		/** Whether to trim whitespace */
		trim?: boolean;
		/** Whether field is required to be empty */
		empty?: boolean;
		/** Enumeration of allowed values */
		enum?: string[];
		/** Lowercase transformation */
		lowercase?: boolean;
		/** Uppercase transformation */
		uppercase?: boolean;
		/** Convert to alphanumeric */
		alphanum?: boolean;
		/** Convert to alpha only */
		alpha?: boolean;
		/** Convert to numeric only */
		numeric?: boolean;
		/** Convert to base64 */
		base64?: boolean;
		/** Convert to hex */
		hex?: boolean;
		/** Starts with string */
		startsWith?: string;
		/** Ends with string */
		endsWith?: string;
		/** Contains string */
		contains?: string | string[];
		/** Convert value */
		convert?: boolean;
	}

	export interface NumberFieldDefinition extends BaseFieldDefinition {
		type: "number";
		/** Minimum value */
		min?: number;
		/** Maximum value */
		max?: number;
		/** Equal to value */
		equal?: number;
		/** Not equal to value */
		notEqual?: number;
		/** Integer validation */
		integer?: boolean;
		/** Positive number validation */
		positive?: boolean;
		/** Negative number validation */
		negative?: boolean;
		/** Convert value */
		convert?: boolean;
	}

	export interface BooleanFieldDefinition extends BaseFieldDefinition {
		type: "boolean";
		/** Convert value */
		convert?: boolean;
	}

	export interface DateFieldDefinition extends BaseFieldDefinition {
		type: "date";
		/** Convert value */
		convert?: boolean;
	}

	export interface ArrayFieldDefinition extends BaseFieldDefinition {
		type: "array";
		/** Minimum length */
		min?: number;
		/** Maximum length */
		max?: number;
		/** Exact length */
		length?: number;
		/** Whether array can be empty */
		empty?: boolean;
		/** Items validation schema */
		items?: FieldDefinition | string;
		/** Enumeration of allowed values */
		enum?: any[];
		/** Convert value */
		convert?: boolean;
	}

	export interface ObjectFieldDefinition extends BaseFieldDefinition {
		type: "object";
		/** Strict mode - remove unknown properties */
		strict?: boolean | "remove";
		/** Object properties schema */
		properties?: Record<string, FieldDefinition>;
		/** Item properties for dynamic objects */
		itemProperties?: FieldDefinition;
		/** Convert value */
		convert?: boolean;
	}

	export interface CustomFieldDefinition extends BaseFieldDefinition {
		type: "custom";
		/** Custom checker function */
		check: (
			value: any,
			errors: any[],
			schema: any,
			name: string,
			parent: any,
			context: any
		) => any;
	}

	export type FieldDefinition =
		| StringFieldDefinition
		| NumberFieldDefinition
		| BooleanFieldDefinition
		| DateFieldDefinition
		| ArrayFieldDefinition
		| ObjectFieldDefinition
		| CustomFieldDefinition
		| BaseFieldDefinition
		| string
		| boolean;

	export interface Fields {
		[fieldName: string]: FieldDefinition;
	}

	export interface Scopes {
		[scopeName: string]: Record<string, any>
			| ((query: Record<string, any>, ctx: Context<any, any>, params: any) => Record<string, any>);
	}

	export interface IndexDefinition {
		/** Fields to index */
		fields: Record<string, string> | string | string[];
		/** Index name */
		name?: string;
		/** Index options */
		unique?: boolean;
		sparse?: boolean;
		type?: string;
		expireAfterSeconds?: number;
	}

	// Adapter interfaces
	export interface BaseAdapterOptions {}

	export interface MongoDBAdapterOptions extends BaseAdapterOptions {
		/** MongoDB connection URI */
		uri?: string;
		/** Database name */
		dbName?: string;
		/** Collection name */
		collection?: string;
		/** MongoDB client options */
		mongoClientOptions?: Record<string, any>;
		/** Database options */
		dbOptions?: Record<string, any>;
	}

	export interface KnexAdapterOptions extends BaseAdapterOptions {
		/** Table name */
		tableName?: string;
		/** Database schema */
		schema?: string;
		/** Knex configuration */
		knex?: Record<string, any>;
	}

	export interface NeDBAdapterOptions extends BaseAdapterOptions {
		/** NeDB configuration */
		neDB?: Record<string, any>;
	}

	export type AdapterDefinition =
		| string
		| {
				type?: "NeDB";
				options?: NeDBAdapterOptions | string;
		  }
		| {
				type?: "MongoDB";
				options?: MongoDBAdapterOptions;
		  }
		| {
				type?: "Knex";
				options?: KnexAdapterOptions;
		  }
		| BaseAdapter;

	// Database adapter base class
	export abstract class BaseAdapter {
		protected opts: BaseAdapterOptions;
		protected service: Service;
		protected logger: Loggers;
		protected broker: ServiceBroker;
		protected Promise: PromiseConstructor;

		constructor(opts?: BaseAdapterOptions);

		/** Whether adapter supports nested fields */
		get hasNestedFieldSupport(): boolean;

		/** Initialize adapter */
		init(service: any): void;

		/** Check client library version */
		checkClientLibVersion(library: string, requiredVersions: string): boolean;

		/** Get client from global store */
		getClientFromGlobalStore(key: string): any;

		/** Set client to global store */
		setClientToGlobalStore(key: string, client: any): void;

		/** Remove adapter from client global store */
		removeAdapterFromClientGlobalStore(key: string): boolean;

		/** Connect to database */
		connect(): Promise<void>;

		/** Disconnect from database */
		disconnect(): Promise<void>;

		/** Find entities */
		find<TEntity>(params: any): Promise<TEntity[]>;

		/** Find entity */
		findOne<TEntity>(params: any): Promise<TEntity>;

		/** Find entity */
		findById<TEntity>(id: any): Promise<TEntity>;

		/** Find entities */
		findByIds<TEntity>(id: any[]): Promise<TEntity[]>;

		/** Stream entities */
		findStream<TEntity>(params: any, opts?: any): TEntity;

		/** Count entities */
		count(params?: any): Promise<number>;

		/** Insert entity */
		insert<TEntity>(entity: TEntity, opts?: any): Promise<TEntity>;

		/** Insert many entities */
		insertMany<TEntity>(entities: TEntity[], opts?: any): Promise<TEntity[]>;

		/** Update entity by ID */
		updateById<TEntity>(id: any, update: any, opts?: any): Promise<TEntity>;

		/** Update many entities */
		updateMany(query: any, update: any, opts?: any): Promise<number>;

		/** Replace entity by ID */
		replaceById<TEntity>(id: any, entity: TEntity, opts?: any): Promise<TEntity>;

		/** Remove entity by ID */
		removeById<TEntity>(id: any, opts?: any): Promise<TEntity>;

		/** Remove many entities */
		removeMany(query: any, opts?: any): Promise<number>;

		/** Clear all entities */
		clear(opts?: any): Promise<number>;

		/** Convert entity to JSON */
		entityToJSON(entity: any): any;

		/** Before save transformation */
		beforeSave(entity: any, ctx: Context<any, any>): any;

		/** After retrieve transformation */
		afterRetrieve(entity: any): any;

		/** Create table/collection */
		createTable?(): Promise<void>;
	}

	// Specific adapter classes
	export declare class MongoDBAdapter extends BaseAdapter {
		constructor(opts?: MongoDBAdapterOptions);
	}

	export declare class KnexAdapter extends BaseAdapter {
		constructor(opts?: KnexAdapterOptions);
	}

	export declare class NeDBAdapter extends BaseAdapter {
		constructor(opts?: NeDBAdapterOptions);
	}

	export namespace Adapters {
		export const Base: typeof BaseAdapter;
		export const MongoDB: typeof MongoDBAdapter;
		export const Knex: typeof KnexAdapter;
		export const NeDB: typeof NeDBAdapter;

		export function resolve(opt: AdapterDefinition): BaseAdapter;
		export function register(name: string, adapter: typeof BaseAdapter): void;
	}

	// Mixin options interface
	export interface DatabaseMixinOptions {
		/** Adapter configuration */
		adapter?: AdapterDefinition;
		/** Whether to create CRUD actions */
		createActions?:
			| boolean
			| Partial<
					Record<
						| "find"
						| "list"
						| "count"
						| "get"
						| "resolve"
						| "create"
						| "createMany"
						| "update"
						| "replace"
						| "remove",
						boolean
					>
			  >;
		/** Default visibility of generated actions */
		actionVisibility?: "published" | "public" | "protected" | "private";
		/** Generate params schema for actions from fields */
		generateActionParams?: boolean;
		/** Enable params conversion */
		enableParamsConversion?: boolean;
		/** Strict mode for validation */
		strict?: boolean | "remove";
		/** Caching configuration */
		cache?: {
			enabled?: boolean;
			eventName?: string | false;
			eventType?: "broadcast" | "emit";
			cacheCleanOnDeps?: boolean | string[];
			additionalKeys?: string[];
			cacheCleaner?: (this: any) => Promise<void>;
		};
		/** Enable REST endpoints */
		rest?: boolean;
		/** Entity changed event type */
		entityChangedEventType?: EntityChangedEventType;
		/** Include old entity in changed events */
		entityChangedOldEntity?: boolean;
		/** Auto reconnect setting */
		autoReconnect?: boolean;
		/** Maximum number of adapters for multi-tenancy */
		maximumAdapters?: number;
		/** Maximum limit for find operations */
		maxLimit?: number;
		/** Default page size for list operations */
		defaultPageSize?: number;
	}

	// Database service settings
	export interface DatabaseServiceSettings extends ServiceSettingSchema {
		/** Field definitions */
		fields?: Fields;
		/** Scope definitions */
		scopes?: Scopes;
		/** Default scopes applied to find & list actions */
		defaultScopes?: string[];
		/** Default populated fields */
		defaultPopulates?: string[];
		/** Index definitions */
		indexes?: IndexDefinition[];
	}

	type ScopeParam = boolean | string | string[];

	// Query parameters for database operations
	export interface FindParams {
		/** Maximum number of entities to return */
		limit?: number | undefined;
		/** Number of entities to skip */
		offset?: number | undefined;
		/** Fields to include in results */
		fields?: string | string[];
		/** Sort order */
		sort?: string | string[] | Record<string, any>;
		/** Search text */
		search?: string;
		/** Fields to search in */
		searchFields?: string | string[];
		/** Collation options */
		collation?: Record<string, any>;
		/** Scope to apply */
		scope?: ScopeParam;
		/** Fields to populate */
		populate?: string | string[];
		/** Custom query */
		query?: Record<string, any> | string;
	}

	export interface ListParams extends FindParams {
		/** Page number (starts from 1) */
		page?: number;
		/** Page size */
		pageSize?: number;
	}

	export interface GetParams {
		/** Entity ID */
		[idField: string]: any;
		/** Fields to include in results */
		fields?: string | string[];
		/** Scope to apply */
		scope?: ScopeParam;
		/** Fields to populate */
		populate?: string | string[];
	}

	export interface ResolveParams {
		/** Entity ID(s) */
		[idField: string]: any | any[];
		/** Fields to include in results */
		fields?: string | string[];
		/** Scope to apply */
		scope?: ScopeParam;
		/** Fields to populate */
		populate?: string | string[];
		/** Convert result array to object with ID as key */
		mapping?: boolean;
		/** Throw error if entity not found */
		throwIfNotExist?: boolean;
		/** Reorder results to match input order */
		reorderResult?: boolean;
	}

	export interface ListResult<T = any> {
		/** Result rows */
		rows: T[];
		/** Total count */
		total: number;
		/** Current page */
		page: number;
		/** Page size */
		pageSize: number;
		/** Total pages */
		totalPages: number;
	}

	export interface FindOptions {
		/** Enable transformation of results */
		transform?: boolean;
	}

	export interface ResolveEntityOptions {
		/** Enable transformation of results */
		transform?: boolean;
		/** Throw error if entity not found */
		throwIfNotExist?: boolean;
		/** Reorder results to match input order */
		reorderResult?: boolean;
	}

	export interface CreateEntityOptions {
		/** Enable transformation of results */
		transform?: boolean;
		/** Enable permissive updates */
		permissive?: boolean;
	}

	export interface CreateEntitiesOptions extends CreateEntityOptions {
		/** Return created entities */
		returnEntities?: boolean;
	}

	export interface UpdateEntityOptions {
		/** Return raw database response */
		raw?: boolean;
		/** Enable permissive updates */
		permissive?: boolean;
		/** Skip "onCreate", "onUpdate" and "onDelete" hooks */
		skipOnHooks?: boolean;
		/** Enable transformation of results */
		transform?: boolean;
		/** Scope to apply */
		scope?: ScopeParam;
	}

	export interface UpdateEntitiesParams<T = any> {
		/** Query to match entities */
		query: Record<string, any>;
		/** Fields to update */
		changes: Partial<T>;
		/** Scope to apply */
		scope?: ScopeParam;
	}

	export interface RemoveEntityOptions {
		/** Enable transformation of results */
		transform?: boolean;
		/** Scope to apply */
		scope?: ScopeParam;
		/** Enable soft delete */
		softDelete?: boolean;
	}

	export interface RemoveEntitiesOptions {
		/** Enable transformation of results */
		transform?: boolean;
		/** Enable soft delete */
		softDelete?: boolean;
	}

	export interface RemoveEntitiesParams {
		/** Query to match entities */
		query: Record<string, any>;
		/** Scope to apply */
		scope?: ScopeParam;
	}

	export interface ValidateParamsOptions {
		/** Type of validation */
		type?: "create" | "update" | "replace";
		/** Enable permissive updates */
		permissive?: boolean;
		/** Skip "onCreate", "onUpdate" and "onDelete" hooks */
		skipOnHooks?: boolean;
	}

	export interface EntityChangedOptions {
		/** It was a batch operation */
		batch: boolean;
		/** It's soft deleted */
		softDelete: boolean;
	}

	// Database service methods
	export interface DatabaseMethods {
		// Adapter methods
		getAdapter(ctx?: Context<any, any>): Promise<BaseAdapter>;
		getAdapterByContext(ctx?: Context<any, any>, adapterDef?: any): [string, any];
		maintenanceAdapters(): Promise<void>;

		// Entity methods
		findEntities<T = any>(ctx: Context<any, any>, params?: FindParams, opts?: FindOptions): Promise<T[]>;
		countEntities(
			ctx: Context<any, any>,
			params?: Omit<FindParams, "limit" | "offset" | "fields" | "sort">
		): Promise<number>;
		findEntity<T = any>(ctx: Context<any, any>, params?: GetParams, opts?: FindOptions): Promise<T | null>;
		resolveEntities<T = any>(
			ctx: Context<any, any>,
			params?: ResolveParams,
			opts?: ResolveEntityOptions
		): Promise<T | T[] | Record<string, T>>;
		createEntity<T = any>(ctx: Context<any, any>, params?: any, opts?: CreateEntityOptions): Promise<T>;
		createEntities<T = any>(
			ctx: Context<any, any>,
			entities: Partial<T>[],
			opts?: CreateEntitiesOptions
		): Promise<T[] | number>;
		updateEntity<T = any>(ctx: Context<any, any>, params?: Partial<T>, opts?: UpdateEntityOptions): Promise<T>;
		updateEntities<T = any>(
			ctx: Context<any, any>,
			params: UpdateEntitiesParams<T>,
			opts?: UpdateEntityOptions
		): Promise<T[]>;
		replaceEntity<T = any>(ctx: Context<any, any>, params?: Partial<T>, opts?: UpdateEntityOptions): Promise<T>;
		removeEntity(ctx: Context<any, any>, params?: { [idField: string]: any }, opts?: RemoveEntityOptions): Promise<any>;
		removeEntities(ctx: Context<any, any>, params?: RemoveEntitiesParams, opts?: RemoveEntitiesOptions): Promise<number>;
		clearEntities(ctx?: Context<any, any>): Promise<number>;
		streamEntities(ctx: Context<any, any>, params?: FindParams, opts?: FindOptions): any;

		// Validation methods
		validateParams<T = any>(
			ctx: Context<any, any>,
			params?: Partial<T>,
			opts?: ValidateParamsOptions
		): Promise<T>;
		authorizeFields(fields: any[], ctx: Context<any, any>, params: any, opts?: any): Promise<any[]>;
		sanitizeParams(params: any, opts?: any): any;

		// Transformation methods
		transformResult<T = any>(
			adapter: BaseAdapter | null,
			docs: T | T[],
			params?: Record<string, any>,
			ctx?: Context<any, any>
		): Promise<T | T[]>;

		// Event methods
		entityChanged<T = any>(
			type: "create" | "update" | "replace" | "remove" | "clear",
			data: T | T[],
			oldData: T,
			ctx: Context<any, any>,
			opts?: EntityChangedOptions
		): void;

		// Encode & Decode ID
		encodeID<TOld, TNew>(id: TOld): TNew;
		decodeID<TOld, TNew>(id: TOld): TNew;

		// Field authorization
		checkFieldAuthority<T = any>(ctx?: Context<any, any> | null, permission: any, params: T, field: Record<string, any>): Promise<boolean>;
		checkScopeAuthority(ctx?: Context<any, any> | null, name: string, operation: "add" | "remove", scope: Record<string, any>): Promise<boolean>;

		// Monitoring
		startSpan(ctx: Context<any, any>, name: string, tags?: Record<string, any>): any;
		finishSpan(ctx: Context<any, any>, span: any, tags?: Record<string, any>): void;
	}

	// Database service actions
	export interface DatabaseActions {
		find?: ActionHandler<FindParams>;
		list?: ActionHandler<ListParams>;
		count?: ActionHandler<Omit<FindParams, "limit" | "offset" | "fields" | "sort">>;
		get?: ActionHandler<GetParams>;
		resolve?: ActionHandler<ResolveParams>;
		create?: ActionHandler<any>;
		createMany?: ActionHandler<any[]>;
		update?: ActionHandler<any>;
		replace?: ActionHandler<any>;
		remove?: ActionHandler<{ [idField: string]: any }>;
	}

	// Database action handler with proper this context
	export interface DatabaseActionHandler<TParams = any, TMeta = any> {
		(this: DatabaseService, ctx: Context<TParams, TMeta>): Promise<any> | any;
	}

	// Database action definition
	export interface DatabaseActionDef<TParams = any, TMeta = any> {
		params?: ActionParams;
		handler?: DatabaseActionHandler<TParams, TMeta>;
	}

		// Custom hooks interface
	export interface DatabaseHooks extends ServiceHooks {
		customs?: Record<string, Function | Function[] | string | string[]>;
	}

	export interface DatabaseLocalVariables {
				// Adapter management
		adapters: Map<string, any>;

		// Field definitions
		$fields: any[] | null;
		$primaryField: { name: string; columnName: string } | null;
		$softDelete: boolean;
		$shouldAuthorizeFields: boolean;
		$validators: {
			create: Function;
			update: Function;
			replace: Function;
		};

		// Custom hooks
		$hooks: Record<string, Function>;
	}

	// Main service factory function
	export function Service(options?: DatabaseMixinOptions): ServiceSchema;

	// Schema generation utilities
	export function generateValidatorSchemaFromFields(
		fields: Fields,
		opts?: {
			type?: "create" | "update" | "replace";
			strict?: boolean | "remove";
			enableParamsConversion?: boolean;
			level?: number;
		}
	): Record<string, any>;

	export function generateFieldValidatorSchema(
		field: FieldDefinition,
		opts?: {
			type?: "create" | "update" | "replace";
			strict?: boolean | "remove";
			enableParamsConversion?: boolean;
			level?: number;
		}
	): Record<string, any> | null;

	// Default export is the Service factory function
	declare const DatabaseModule: {
		Service: ServiceSchema;
		Adapters: typeof Adapters;
		Errors: {
			EntityNotFoundError: typeof EntityNotFoundError;
		};
		generateValidatorSchemaFromFields: typeof generateValidatorSchemaFromFields;
		generateFieldValidatorSchema: typeof generateFieldValidatorSchema;
	};

	export default DatabaseModule;
}
