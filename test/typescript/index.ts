/**
 * TypeScript Type Definition Validation Test
 *
 * This file validates that the @moleculer/database TypeScript type definitions
 * work correctly by exercising all major features and patterns.
 *
 * This test should compile without errors when types are correct and fail
 * compilation when there are type mismatches.
 */

import { ServiceBroker, Context, Service as MoleculerService, ServiceSchema } from "moleculer";
import {
    Service as DbService,
    Fields,
    FieldDefinition,
    StringFieldDefinition,
    NumberFieldDefinition,
    BooleanFieldDefinition,
    ArrayFieldDefinition,
    ObjectFieldDefinition,
    CustomFieldDefinition,
    PopulateDefinition,
    ScopeDefinition,
    Scopes,
    IndexDefinition,
    AdapterDefinition,
    MongoDBAdapterOptions,
    KnexAdapterOptions,
    NeDBAdapterOptions,
    FindParams,
    ListParams,
    GetParams,
    ResolveParams,
    ListResult,
    BaseAdapter,
    MongoDBAdapter,
    KnexAdapter,
    NeDBAdapter,
    Adapters,
    EntityNotFoundError,
    Errors,
    DatabaseMixinOptions,
    generateValidatorSchemaFromFields,
    generateFieldValidatorSchema,
	DatabaseServiceSettings,
	DatabaseMethods,
	DatabaseLocalVariables
} from "@moleculer/database";

// =============================================================================
// Entity Type Definitions
// =============================================================================

interface Post {
    id: string;
    title: string;
    content?: string;
    author?: string;
    votes: number;
    status: boolean;
    tags?: string[];
    categories?: any[];
    metadata?: {
        views?: number;
        likes?: number;
    };
    createdAt: number;
    updatedAt: number;
}

interface Author {
    id: string;
    name: string;
    email: string;
    bio?: string;
    isActive: boolean;
    createdAt: number;
}

interface Comment {
    id: string;
    postId: string;
    authorId: string;
    content: string;
    approved: boolean;
    createdAt: number;
}

// =============================================================================
// Field Definitions Testing
// =============================================================================

// Test basic field definitions
const basicStringField: StringFieldDefinition = {
    type: "string",
    required: true,
    min: 1,
    max: 255,
    trim: true,
    pattern: /^[a-zA-Z0-9\s]+$/,
    enum: ["draft", "published", "archived"],
    lowercase: true,
    default: "draft"
};

const basicNumberField: NumberFieldDefinition = {
    type: "number",
    required: false,
    min: 0,
    max: 10000,
    integer: true,
    positive: true,
    default: 0,
    columnType: "integer"
};

const basicBooleanField: BooleanFieldDefinition = {
    type: "boolean",
    default: true,
    convert: true
};

const basicArrayField: ArrayFieldDefinition = {
    type: "array",
    items: "string",
    min: 0,
    max: 10,
    empty: true,
    default: []
};

const complexObjectField: ObjectFieldDefinition = {
    type: "object",
    strict: true,
    properties: {
        views: { type: "number", integer: true, min: 0, default: 0 },
        likes: { type: "number", integer: true, min: 0, default: 0 },
        bookmarked: { type: "boolean", default: false }
    }
};

const customField: CustomFieldDefinition = {
    type: "custom",
    check: (value: any, errors: any[], schema: any, name: string, parent: any, context: any) => {
        if (typeof value !== "string" || value.length < 3) {
            errors.push({ type: "customValidation", field: name, message: "Value must be at least 3 characters" });
        }
        return value;
    }
};

// Test field definitions with lifecycle hooks
const fieldWithHooks: FieldDefinition = {
    type: "string",
    onCreate: (value: any, entity: any, field: FieldDefinition, ctx: Context) => value || "default",
    onUpdate: (value: any, entity: any, field: FieldDefinition, ctx: Context) => value,
    onReplace: (value: any, entity: any, field: FieldDefinition, ctx: Context) => value,
    onRemove: (value: any, entity: any, field: FieldDefinition, ctx: Context) => null,
    get: (value: any, entity: any, field: FieldDefinition, ctx: Context) => value,
    set: (value: any, entity: any, field: FieldDefinition, ctx: Context) => value,
    validate: async (value: any, entity: any, field: FieldDefinition, ctx: Context) => {
        return typeof value === "string" && value.length > 0;
    }
};

// Test populate definitions
const basicPopulate: PopulateDefinition = {
    service: "authors",
    action: "get",
    keyField: "authorId",
    populateFields: "author",
    params: { fields: ["id", "name", "email"] }
};

const complexPopulate: PopulateDefinition = {
    handler: async (ids: any[], docs: any[], rule: PopulateDefinition, ctx: Context) => {
        const authors = await ctx.call("authors.resolve", {
            id: ids,
            fields: ["id", "name", "email"]
        });
        return authors;
    },
    keyField: "authorId",
    populateFields: ["author"]
};

// Complete field definitions for Post entity
const postFields: Fields = {
    id: {
        type: "string",
        primaryKey: true,
        columnName: "_id"
    },
    title: {
        type: "string",
        required: true,
        min: 1,
        max: 255,
        trim: true
    },
    content: {
        type: "string",
        required: false,
        max: 50000
    },
    author: {
        type: "string",
        populate: basicPopulate
    },
    votes: {
        type: "number",
        integer: true,
        min: 0,
        default: 0,
        columnType: "integer"
    },
    status: {
        type: "boolean",
        default: true
    },
    tags: {
        type: "array",
        items: "string",
        max: 20,
        default: []
    },
    metadata: complexObjectField,
    createdAt: {
        type: "number",
        readonly: true,
        onCreate: () => Date.now(),
        columnType: "bigint"
    },
    updatedAt: {
        type: "number",
        readonly: true,
        onUpdate: () => Date.now(),
        columnType: "bigint"
    }
};

// =============================================================================
// Adapter Configuration Testing
// =============================================================================

// Test different adapter configurations
const mongoAdapter: AdapterDefinition = {
    type: "MongoDB",
    options: {
        uri: "mongodb://localhost:27017/test",
        dbName: "testdb",
        collection: "posts",
        mongoClientOptions: {
            maxPoolSize: 10
        }
    } as MongoDBAdapterOptions
};

const knexAdapter: AdapterDefinition = {
    type: "Knex",
    options: {
        tableName: "posts",
        schema: "public",
        knex: {
            client: "postgresql",
            connection: {
                host: "localhost",
                port: 5432,
                user: "test",
                password: "test",
                database: "testdb"
            }
        }
    } as KnexAdapterOptions
};

const nedbAdapter: AdapterDefinition = {
    type: "NeDB",
    options: {
        neDB: {
            filename: "./data/posts.db",
            autoload: true
        }
    } as NeDBAdapterOptions
};

// Test string adapter definition
const simpleAdapter: AdapterDefinition = "NeDB";

// =============================================================================
// Scope Definitions Testing
// =============================================================================

const scopes: Scopes = {
    published: {
        query: { status: true }
    },
    byAuthor: {
        handler: (query: Record<string, any>, params: any, ctx: Context) => {
            if (params.authorId) {
                query.author = params.authorId;
            }
            return query;
        }
    },
    recent: {
        query: { createdAt: { $gte: Date.now() - 86400000 } } // last 24 hours
    }
};

// =============================================================================
// Service Schema Testing
// =============================================================================

// Test mixin options
const mixinOptions: DatabaseMixinOptions = {
    adapter: mongoAdapter,
    createActions: {
        find: true,
        list: true,
        count: true,
        get: true,
        resolve: true,
        create: true,
        createMany: true,
        update: true,
        replace: true,
        remove: true
    },
    actionVisibility: "published",
    generateActionParams: true,
    enableParamsConversion: true,
    strict: true,
    cache: {
        enabled: true,
        eventName: "cache.clean.posts",
        eventType: "broadcast",
        cacheCleanOnDeps: true,
        additionalKeys: ["user"]
    },
    rest: true,
    entityChangedEventType: "broadcast",
    entityChangedOldEntity: true,
    autoReconnect: true,
    maximumAdapters: 10,
    maxLimit: 1000,
    defaultPageSize: 50
};

// Test service schema definition
const postServiceSchema: ServiceSchema<DatabaseServiceSettings, DatabaseMethods, DatabaseLocalVariables> = {
    name: "posts",
    mixins: [DbService(mixinOptions)],
    settings: {
        fields: postFields,
        scopes: scopes,
        defaultScopes: ["published"],
        defaultPopulates: ["author"],
        indexes: [
            {
                fields: { title: 1 },
                options: { unique: false }
            },
            {
                fields: ["status", "createdAt"],
                options: { background: true }
            }
        ] as IndexDefinition[]
    },
    actions: {
        // Custom action that uses database methods
        findByAuthor: {
            params: {
                authorId: "string",
                limit: { type: "number", optional: true, default: 10 }
            },
            async handler(ctx: Context<{ authorId: string; limit?: number }>) {
                const posts = await this.findEntities<Post>(ctx, {
                    query: { author: ctx.params.authorId },
                    limit: ctx.params.limit,
                    populate: ["author"]
                });
                return posts;
            }
        },
        // Test custom update action
        incrementVotes: {
            params: {
                id: "string"
            },
            async handler(ctx: Context<{ id: string }>) {
                const post = await this.findEntity<Post>(ctx, { id: ctx.params.id });
                if (!post) {
                    throw new EntityNotFoundError(ctx.params.id);
                }
                return this.updateEntity<Post>(ctx, {
                    id: ctx.params.id,
                    votes: post.votes + 1
                });
            }
        }
    },
    methods: {
        // Test custom method with proper typing
        async getPopularPosts(ctx: Context, minVotes: number = 10): Promise<Post[]> {
            return this.findEntities<Post>(ctx, {
                query: { votes: { $gte: minVotes } },
                sort: "-votes",
                limit: 20,
                populate: ["author"]
            });
        },

        // Test method that uses validation
        async validatePostData(data: Partial<Post>): Promise<Post> {
            const validated = await this.validateEntity(data, { type: "create" });
            return validated;
        },

        // Test method that uses transformation
        async transformPostForAPI(post: Post, ctx: Context): Promise<any> {
            return this.transformResult(null, post, {}, ctx);
        },

        // Test adapter access
        async getAdapterInfo(ctx?: Context): Promise<string> {
            const adapter = await this.getAdapter(ctx);
            return adapter.constructor.name;
        },

        // Test entity change events
        notifyPostChanged(type: "created" | "updated" | "replaced" | "removed", post: Post, ctx: Context): void {
            this.entityChanged(type, post, ctx);
        }
    },
    async started() {
        // Test adapter initialization
        const adapter = await this.getAdapter();
        if ("createTable" in adapter && typeof adapter.createTable === "function") {
            await adapter.createTable();
        }
        await this.clearEntities();
    }
};

// =============================================================================
// Parameter Types Testing
// =============================================================================

// Test find parameters
const findParams: FindParams = {
    limit: 20,
    offset: 0,
    fields: ["id", "title", "votes", "status"],
    sort: ["-createdAt", "title"],
    search: "moleculer",
    searchFields: ["title", "content"],
    scope: ["published", "recent"],
    populate: ["author"],
    query: { votes: { $gte: 5 } }
};

// Test list parameters
const listParams: ListParams = {
    ...findParams,
    page: 1,
    pageSize: 10
};

// Test get parameters
const getParams: GetParams = {
    id: "507f1f77bcf86cd799439011",
    fields: ["id", "title", "content", "author"],
    scope: false,
    populate: ["author"]
};

// Test resolve parameters
const resolveParams: ResolveParams = {
    id: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
    fields: ["id", "title", "votes"],
    mapping: true,
    throwIfNotExist: false,
    reorderResult: true
};

// =============================================================================
// Service Usage Testing (simulating broker calls)
// =============================================================================

// This section demonstrates how the service would be used in practice
function demonstrateServiceUsage() {
    const broker = new ServiceBroker({ logger: false });
    const service = broker.createService(postServiceSchema);

    // These calls would be made in a real application
    return {
        // Test CRUD operations
        async createPost() {
            const post = await broker.call<Post, Partial<Post>>("posts.create", {
                title: "My First Post",
                content: "This is the content of my first post",
                author: "user123",
                tags: ["moleculer", "database"]
            });
            return post;
        },

        async updatePost(id: string) {
            const updatedPost = await broker.call<Post, Partial<Post>>("posts.update", {
                id,
                title: "Updated Post Title",
                votes: 5
            });
            return updatedPost;
        },

        async findPosts() {
            const posts = await broker.call<Post[], FindParams>("posts.find", {
                limit: 10,
                sort: "-createdAt",
                populate: ["author"],
                scope: ["published"]
            });
            return posts;
        },

        async listPosts() {
            const result = await broker.call<ListResult<Post>, ListParams>("posts.list", {
                page: 1,
                pageSize: 20,
                fields: ["id", "title", "votes", "status"],
                scope: ["published"]
            });
            return result;
        },

        async getPost(id: string) {
            const post = await broker.call<Post, GetParams>("posts.get", {
                id,
                populate: ["author"]
            });
            return post;
        },

        async resolvePosts(ids: string[]) {
            const posts = await broker.call<Post, ResolveParams>("posts.resolve", {
                id: ids,
                mapping: true,
                fields: ["id", "title", "votes"]
            });
            return posts;
        },

        async countPosts() {
            const count = await broker.call<number, FindParams>("posts.count", {
                scope: ["published"],
                query: { votes: { $gte: 1 } }
            });
            return count;
        },

        async removePost(id: string) {
            const result = await broker.call("posts.remove", { id });
            return result;
        },

        // Test custom actions
        async findByAuthor(authorId: string) {
            const posts = await broker.call<Post[], { authorId: string; limit: number }>("posts.findByAuthor", {
                authorId,
                limit: 5
            });
            return posts;
        },

        async incrementVotes(id: string) {
            const post = await broker.call<Post, { id: string }>("posts.incrementVotes", { id });
            return post;
        }
    };
}

// =============================================================================
// Direct Service Method Testing
// =============================================================================

function demonstrateDirectServiceMethods(service: MoleculerService & DatabaseMethods) {
    return {
        // Test entity methods with proper typing
        async testEntityMethods(ctx: Context) {
            // Find entities
            const posts = await service.findEntities<Post>(ctx, findParams);
            const firstPost: Post | undefined = posts[0];

            // Find single entity
            const post = await service.findEntity<Post>(ctx, getParams);
            const title: string | undefined = post?.title;

            // Count entities
            const count = await service.countEntities(ctx, { scope: ["published"] });
            const totalCount: number = count;

            // Create entity
            const newPost = await service.createEntity<Post>(ctx, {
                title: "New Post",
                content: "Post content",
                author: "user123"
            });
            const newPostId: string = newPost.id;

            // Create multiple entities
            const createdPosts = await service.createEntities<Post>(ctx, [
                { title: "Post 1", author: "user1" },
                { title: "Post 2", author: "user2" }
            ], { returnEntities: true });
            const firstCreated: Post[] = createdPosts as Post[];

            // Update entity
            const updatedPost = await service.updateEntity<Post>(ctx, {
                id: "someId",
                title: "Updated Title"
            });
            const updatedTitle: string = updatedPost.title;

            // Replace entity
            const replacedPost = await service.replaceEntity<Post>(ctx, {
                id: "someId",
                title: "Replaced Title",
                author: "newAuthor"
            });

            // Remove entity
            const removeResult = await service.removeEntity(ctx, { id: "someId" });

            return {
                posts,
                post,
                count: totalCount,
                newPost,
                createdPosts: firstCreated,
                updatedPost,
                replacedPost,
                removeResult
            };
        },

        // Test validation methods
        async testValidation(ctx: Context) {
            const validatedEntity = await service.validateEntity({
                title: "Test Post",
                content: "Test content"
            }, { type: "create" });

            const authorizedFields = await service.authorizeFields(
                ["id", "title", "content"],
                ctx,
                {},
                {}
            );

            const sanitizedParams = service.sanitizeParams({
                title: "  Test Title  ",
                invalidField: "should be removed"
            });

            return { validatedEntity, authorizedFields, sanitizedParams };
        },

        // Test transformation methods
        async testTransformation(ctx: Context) {
            const mockPost: Post = {
                id: "1",
                title: "Test",
                votes: 5,
                status: true,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };

            const transformedResult = await service.transformResult<Post>(
                null,
                mockPost,
                { fields: ["id", "title"] },
                ctx
            );

            const encodedEntity = service.encodeEntity(mockPost);
            const decodedEntity = service.decodeEntity(encodedEntity);

            const populatedPosts = await service.populateEntities<Post>(
                ctx,
                [mockPost],
                ["author"]
            );

            return { transformedResult, encodedEntity, decodedEntity, populatedPosts };
        },

        // Test adapter methods
        async testAdapterMethods(ctx: Context) {
            const adapter = await service.getAdapter(ctx);
            const adapterName: string = adapter.constructor.name;

            const [adapterKey, adapterDef] = service.getAdapterByContext(ctx);

            await service.maintenanceAdapters();

            return { adapterName, adapterKey, adapterDef };
        }
    };
}

// =============================================================================
// Error Handling Testing
// =============================================================================

function demonstrateErrorHandling() {
    // Test EntityNotFoundError
    const error1 = new EntityNotFoundError("someId");
    const errorMessage: string = error1.message;

    // Test using Errors namespace
    const error2 = new Errors.EntityNotFoundError("anotherId");
    const errorName: string = error2.name;

    // Test error in async context
    async function testAsyncError(ctx: Context): Promise<Post | null> {
        try {
            const service = ctx.service as MoleculerService & DatabaseMethods;
            const post = await service.findEntity<Post>(ctx, { id: "nonExistentId" });
            return post;
        } catch (error) {
            if (error instanceof EntityNotFoundError) {
                console.log(`Entity not found: ${error.message}`);
                return null;
            }
            throw error;
        }
    }

    return { error1, error2, testAsyncError };
}

// =============================================================================
// Adapter Class Testing
// =============================================================================

function demonstrateAdapterUsage() {
    // Test MongoDB adapter
    const mongoAdapter = new MongoDBAdapter({
        uri: "mongodb://localhost:27017/test",
        dbName: "testdb",
        collection: "posts"
    });

    // Test Knex adapter
    const knexAdapter = new KnexAdapter({
        tableName: "posts",
        knex: {
            client: "postgresql",
            connection: "postgres://user:pass@localhost/testdb"
        }
    });

    // Test NeDB adapter
    const nedbAdapter = new NeDBAdapter({
        neDB: { filename: "./test.db" }
    });

    // Test adapter resolution
    const resolvedAdapter = Adapters.resolve("MongoDB");
    const resolvedAdapter2 = Adapters.resolve(mongoAdapter);

    return { mongoAdapter, knexAdapter, nedbAdapter, resolvedAdapter, resolvedAdapter2 };
}

// =============================================================================
// Schema Generation Testing
// =============================================================================

function demonstrateSchemaGeneration() {
    // Test validator schema generation
    const validatorSchema = generateValidatorSchemaFromFields(postFields, {
        type: "create",
        strict: true,
        enableParamsConversion: true
    });

    // Test field validator schema generation
    const fieldSchema = generateFieldValidatorSchema(basicStringField, {
        type: "update",
        strict: "remove"
    });

    return { validatorSchema, fieldSchema };
}

// =============================================================================
// Multi-tenant Testing
// =============================================================================

const multiTenantServiceSchema: ServiceSchema<DatabaseServiceSettings, DatabaseMethods, DatabaseLocalVariables> = {
    name: "tenant-posts",
    mixins: [DbService({
        adapter: "NeDB",
        maximumAdapters: 100
    })],
    settings: {
        fields: {
            id: { type: "string", primaryKey: true },
            title: { type: "string", required: true },
            tenantId: {
                type: "string",
                required: true,
                set: (value: any, entity: any, field: FieldDefinition, ctx: Context) => {
                    return (ctx.meta as any)?.tenantId || value;
                }
            }
        },
        scopes: {
            tenant: {
                handler: (query: Record<string, any>, params: any, ctx: Context) => {
                    if ((ctx.meta as any)?.tenantId) {
                        query.tenantId = (ctx.meta as any).tenantId;
                    }
                    return query;
                }
            }
        },
        defaultScopes: ["tenant"]
    },
    methods: {
        getAdapterByContext(ctx?: Context) {
            const tenantId = (ctx?.meta as any)?.tenantId || "default";
            return [
                tenantId,
                {
                    type: "NeDB",
                    options: {
                        neDB: { filename: `./data/tenant-${tenantId}.db` }
                    }
                }
            ] as [string, any];
        }
    }
};

// =============================================================================
// Complex Field Definitions Testing
// =============================================================================

const complexFields: Fields = {
    // String field with all options
    slug: {
        type: "string",
        required: true,
        min: 3,
        max: 100,
        pattern: /^[a-z0-9-]+$/,
        trim: true,
        lowercase: true,
        alphanum: false,
        set: (value: any) => value?.toString().toLowerCase().replace(/\s+/g, "-")
    },

    // Number field with validation
    price: {
        type: "number",
        required: true,
        min: 0.01,
        positive: true,
        convert: true,
        validate: async (value: number) => {
            return value > 0 && value < 10000;
        }
    },

    // Array field with complex items
    categories: {
        type: "array",
        items: {
            type: "object",
            properties: {
                id: { type: "string", required: true },
                name: { type: "string", required: true },
                weight: { type: "number", min: 0, default: 1 }
            }
        },
        min: 1,
        max: 5
    },

    // Object field with nested properties
    settings: {
        type: "object",
        strict: "remove",
        properties: {
            notifications: {
                type: "object",
                properties: {
                    email: { type: "boolean", default: true },
                    push: { type: "boolean", default: false },
                    frequency: {
                        type: "string",
                        enum: ["immediate", "daily", "weekly"],
                        default: "daily"
                    }
                }
            },
            privacy: {
                type: "object",
                properties: {
                    profileVisible: { type: "boolean", default: true },
                    allowMessages: { type: "boolean", default: true }
                }
            }
        }
    },

    // Field with complex populate
    relatedPosts: {
        type: "array",
        items: "string",
        populate: {
            service: "posts",
            action: "resolve",
            params: { fields: ["id", "title", "status"] },
            handler: async (ids: string[], docs: any[], rule: PopulateDefinition, ctx: Context) => {
                const posts = await ctx.call("posts.resolve", {
                    id: ids,
                    fields: rule.params?.fields
                });
                return posts;
            }
        }
    },

    // Field with all lifecycle hooks
    auditInfo: {
        type: "object",
        readonly: true,
        onCreate: (value: any, entity: any, field: FieldDefinition, ctx: Context) => ({
            createdBy: (ctx.meta as any)?.user?.id,
            createdAt: Date.now(),
            version: 1
        }),
        onUpdate: (value: any, entity: any, field: FieldDefinition, ctx: Context) => ({
            ...value,
            updatedBy: (ctx.meta as any)?.user?.id,
            updatedAt: Date.now(),
            version: (value.version || 0) + 1
        }),
        onRemove: (value: any, entity: any, field: FieldDefinition, ctx: Context) => ({
            ...value,
            deletedBy: (ctx.meta as any)?.user?.id,
            deletedAt: Date.now()
        })
    }
};

// =============================================================================
// Type Inference Testing
// =============================================================================

// These examples test that TypeScript can properly infer types
function testTypeInference() {
    // This should infer the correct return types
    const createService = () => {
        const broker = new ServiceBroker();
        return broker.createService(postServiceSchema);
    };

    // This should properly type the context and return values
    const testAction = async (ctx: Context<{ id: string }>) => {
        const service = ctx.service as MoleculerService & DatabaseMethods;

        // Should infer Post type
        const post = await service.findEntity<Post>(ctx, { id: ctx.params.id });

        // Should infer Post[] type
        const posts = await service.findEntities<Post>(ctx, { limit: 10 });

        // Should infer number type
        const count = await service.countEntities(ctx, {});

        return { post, posts, count };
    };

    return { createService, testAction };
}

// =============================================================================
// Advanced Usage Patterns
// =============================================================================

// Custom service with advanced patterns
const advancedServiceSchema: ServiceSchema<DatabaseServiceSettings, DatabaseMethods, DatabaseLocalVariables> = {
    name: "advanced-posts",
    mixins: [DbService({
        adapter: {
            type: "MongoDB",
            options: {
                uri: "mongodb://localhost:27017/advanced",
                dbName: "blog"
            }
        },
        cache: {
            enabled: true,
            eventType: "broadcast",
            additionalKeys: ["user"],
            cacheCleaner: async function() {
                await this.broker.cacher?.clean("posts.**");
            }
        },
        entityChangedEventType: "emit",
        entityChangedOldEntity: true
    })],

    settings: {
        fields: complexFields,
        scopes: {
            published: { query: { status: "published" } },
            byUser: {
                handler: (query: Record<string, any>, params: any, ctx: Context<any, { user: { id: string } }>) => {
                    if (ctx.meta?.user?.id) {
                        query.createdBy = ctx.meta.user.id;
                    }
                    return query;
                }
            }
        },
        defaultScopes: ["published"],
        defaultPopulates: ["author", "categories"],
        indexes: [
            { fields: { slug: 1 }, options: { unique: true } },
            { fields: { "categories.id": 1, status: 1 } },
            { fields: { createdAt: -1, status: 1 } }
        ]
    },

    actions: {
        findBySlug: {
            params: { slug: "string" },
            async handler(ctx: Context<{ slug: string }>) {
                const post = await this.findEntity<Post>(ctx, {
                    query: { slug: ctx.params.slug },
                    populate: ["author", "categories"]
                });
                return post;
            }
        },

        search: {
            params: {
                q: "string",
                category: { type: "string", optional: true },
                limit: { type: "number", optional: true, default: 20 }
            },
            async handler(ctx: Context<{ q: string; category?: string; limit?: number }>) {
                const query: Record<string, any> = {
                    $text: { $search: ctx.params.q }
                };

                if (ctx.params.category) {
                    query["categories.id"] = ctx.params.category;
                }

                return this.findEntities<Post>(ctx, {
                    query,
                    limit: ctx.params.limit,
                    sort: { score: { $meta: "textScore" } },
                    populate: ["author"]
                });
            }
        }
    },

    events: {
        "posts.created"(ctx: Context<{ entity: Post }>) {
            this.logger.info("Post created:", ctx.params.entity.id);
        },

        "posts.updated"(ctx: Context<{ entity: Post; oldEntity: Post }>) {
            this.logger.info("Post updated:", ctx.params.entity.id);
            // Check if status changed from draft to published
            if (ctx.params.oldEntity.status !== ctx.params.entity.status && ctx.params.entity.status) {
                this.broker.emit("post.published", { post: ctx.params.entity });
            }
        }
    },

    methods: {
        async generateSlug(ctx: Context, title: string): Promise<string> {
            const baseSlug = title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .substring(0, 100);

            let slug = baseSlug;
            let counter = 1;

            // Ensure uniqueness
            while (await this.findEntity(ctx, { slug })) {
                slug = `${baseSlug}-${counter}`;
                counter++;
            }

            return slug;
        },

        async getRelatedPosts(ctx: Context, postId: string, limit: number = 5): Promise<Post[]> {
            const post = await this.findEntity<Post>(ctx, {
                id: postId,
                populate: ["categories"]
            });

            if (!post || !post.categories?.length) {
                return [];
            }

            return this.findEntities<Post>(ctx, {
                query: {
                    id: { $ne: postId },
                    "categories.id": { $in: post.categories.map((c: any) => c.id) }
                },
                limit,
                sort: "-createdAt",
                populate: ["author"]
            });
        }
    }
};

// =============================================================================
// Export for compilation testing
// =============================================================================

export {
    // Entity types
    Post,
    Author,
    Comment,

    // Field definitions
    basicStringField,
    basicNumberField,
    basicBooleanField,
    basicArrayField,
    complexObjectField,
    customField,
    postFields,
    complexFields,

    // Adapter configurations
    mongoAdapter,
    knexAdapter,
    nedbAdapter,
    simpleAdapter,

    // Service schemas
    postServiceSchema,
    multiTenantServiceSchema,
    advancedServiceSchema,

    // Parameter examples
    findParams,
    listParams,
    getParams,
    resolveParams,

    // Demonstration functions
    demonstrateServiceUsage,
    demonstrateDirectServiceMethods,
    demonstrateErrorHandling,
    demonstrateAdapterUsage,
    demonstrateSchemaGeneration,
    testTypeInference
};

/**
 * Compilation Test Notes:
 *
 * This file should compile successfully with strict TypeScript settings,
 * demonstrating that:
 *
 * 1. All type definitions are correctly structured
 * 2. Field definitions support all documented options
 * 3. Service schemas can be properly typed
 * 4. Method signatures match the expected interfaces
 * 5. Generic types work correctly for entities
 * 6. Adapter configurations are properly typed
 * 7. Parameter objects match expected structures
 * 8. Error types are correctly defined
 * 9. Complex nested types compile correctly
 * 10. Type inference works as expected
 *
 * If compilation fails, it indicates issues with the type definitions
 * that need to be addressed.
 */
