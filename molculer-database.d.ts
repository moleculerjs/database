/**
 * ProjectName: @moleculer/database
 * MainRepo : https://github.com/moleculerjs/database/
 * Definition of the Database Service in TypeScript for the Molculer framework.
 * Author: Saeed Tabrizi , saeed.tabrizi@gmail.com , https://github.com/saeedtabrizi
 * License: MIT
 * Version: v1.0.0
 */

declare module "@moleculer/database" {
  import { Context, Service as BaseService, ServiceSchema, Errors as BaseErrors } from "moleculer";
  import Stream from "stream";
  export  type DataFieldHandler = (payload: { ctx: Context; entity: any; field: string; value: any }) => any;
  export  type DataFieldCreateHandler = DataFieldHandler;
  export  type DataFieldUpdateHandler = DataFieldHandler;
  export  type DataFieldReplaceHandler = DataFieldHandler;
  export  type DataFieldRemoveHandler = DataFieldHandler;
  export interface Field {
    name: string;
    required?: boolean;
    optional?: boolean;
    columnName?: string;
    type?: string;
    primaryKey?: boolean;
    hidden?: boolean;
    readonly?: boolean;
    immutable?: boolean;
    onCreate?: DataFieldCreateHandler;
    onUpdate?: DataFieldUpdateHandler;
    onReplace?: DataFieldReplaceHandler;
    onRemove?: DataFieldRemoveHandler;
    permission: any;
    readPermission?: any;
    populate?: any;
    itemProperties?: any;
    set?: (value: any) => any;
    get?: (value: any) => any;
    validate?: (value: any) => any;
    default?: any;

    [key: string]: any;
  }
  export  type Schema = {
    getPrimaryKeyFromFields(fields: any[]): string;
    generateValidatorSchemaFromFields(fields: any[]): any;
    generateFieldValidatorSchema(field: any, options?: any): any;
  };

  export  interface DbService extends BaseService {}

  export interface QueryParams {
    [key: string]: any;
  }
  export  interface FindParams {
    [key: string]: any;
  }

  export  interface FilterParams {
    [key: string]: any;
  }

  export namespace Adapters {
    export interface Adapter {
      get hasNestedFieldSupport(): boolean;

      /**
       * Connect adapter to database
       */
      connect(): Promise<void>;

      /**
       * Disconnect adapter from database
       */
      disconnect(): Promise<void>;

      /**
       * Find all entities by filters.
       *
       * @param {Object} params
       * @returns {Promise<Array>}
       */
      find<R>(params: any): Promise<R[]>;
      /**
       * Find an entity by query & sort
       *
       * @param {Object} params
       * @returns {Promise<Object>}
       */
      findOne<R>(params: any): Promise<R>;

      /**
       * Find an entities by ID.
       *
       * @param {String} id
       * @returns {Promise<Object>} Return with the found document.
       *
       */
      findById<R>(id: string): Promise<R>;

      /**
       * Find any entities by IDs.
       *
       * @param {Array<String>} idList
       * @returns {Promise<Array>} Return with the found documents in an Array.
       *
       */
      findByIds<R>(idList: any[]): Promise<R[]>;
      /**
       * Find all entities by filters and returns a Stream.
       *
       * @param {Object} params
       * @returns {Promise<Stream>}
       */
      findStream<F extends FindParams>(params: F): Promise<Stream>;

      /**
       * Get count of filtered entites.
       * @param {Object} [filters={}]
       * @returns {Promise<Number>} Return with the count of documents.
       *
       */
      count<F extends FilterParams>(params: F): Promise<number>;

      /**
       * Insert an entity.
       *
       * @param {Object} entity
       * @returns {Promise<Object>} Return with the inserted document.
       *
       */
      insert<E, R>(entity: E): Promise<R>;

      /**
       * Insert many entities
       *
       * @param {Array<Object>} entities
       * @param {Object?} opts
       * @param {Boolean?} opts.returnEntities
       * @returns {Promise<Array<Object|any>>} Return with the inserted IDs or entities.
       *
       */
      insertMany<E, R>(entities: E[], opts?: { returnEntities?: boolean }): Promise<R[]>;

      /**
       * Update an entity by ID
       *
       * @param {String} id
       * @param {Object} changes
       * @returns {Promise<Object>} Return with the updated document.
       *
       */
      updateById<T, R>(id: string, changes: Partial<T>): Promise<R>;

      /**
       * Update many entities
       *
       * @param {Object} query
       * @param {Object} changes
       * @returns {Promise<Number>} Return with the count of modified documents.
       *
       */
      updateMany<Q extends QueryParams, T>(query: Q, changes: Partial<T>): Promise<number>;

      /**
       * Replace an entity by ID
       *
       * @param {String} id
       * @param {Object} entity
       * @returns {Promise<Object>} Return with the updated document.
       *
       */
      replaceById<E, R>(id: string, entity: E): Promise<R>;

      /**
       * Remove an entity by ID
       *
       * @param {String} id
       * @returns {Promise<Object>} Return with the removed document.
       *
       */
      removeById<T>(id: string): Promise<T>;

      /**
       * Remove entities which are matched by `query`
       *
       * @param {Object} query
       * @returns {Promise<Number>} Return with the count of deleted documents.
       *
       */
      removeMany<Q extends QueryParams>(query: Q): Promise<number>;

      /**
       * Clear all entities from collection
       *
       * @returns {Promise<Number>}
       */
      clear(): Promise<number>;

      /**
       * Convert DB entity to JSON object.
       *
       * @param {Object} entity
       * @returns {Object}
       */
      entityToJSON<E, J>(entity: E): J;

      /**
       * Create an index.
       *
       * @param {Object} def
       * @param {String|Array<String>|Object} def.fields
       * @param {String?} def.name
       * @param {String?} def.type The type can be optionally specified for PostgreSQL and MySQL
       * @param {Boolean?} def.unique
       * @param {Boolean?} def.sparse The `sparse` can be optionally specified for MongoDB and NeDB
       * @param {Number?} def.expireAfterSeconds The `expireAfterSeconds` can be optionally specified for MongoDB and NeDB
       * @returns {Promise<void>}
       */
      createIndex(def: any): Promise<void>;

      /**
       * Remove an index.
       *
       * @param {Object} def
       * @param {String|Array<String>|Object} def.fields
       * @param {String?} def.name
       * @returns {Promise<void>}
       */
      removeIndex(def: any): Promise<void>;
    }
    export abstract class BaseAdapter implements Adapter {
      constructor(options?: any);
      get hasNestedFieldSupport(): boolean;
      connect(): Promise<void>;
      disconnect(): Promise<void>;
      find<R>(params: any): Promise<R[]>;
      findOne<R>(params: any): Promise<R>;
      findById<R>(id: string): Promise<R>;
      findByIds<R>(idList: any[]): Promise<R[]>;
      findStream<F extends FindParams>(params: F): Promise<Stream>;
      count<F extends FilterParams>(params: F): Promise<number>;
      insert<E, R>(entity: E): Promise<R>;
      insertMany<E, R>(entities: E[], opts?: { returnEntities?: boolean }): Promise<R[]>;
      updateById<T, R>(id: string, changes: Partial<T>): Promise<R>;
      updateMany<Q extends QueryParams, T>(query: Q, changes: Partial<T>): Promise<number>;
      replaceById<E, R>(id: string, entity: E): Promise<R>;
      removeById<T>(id: string): Promise<T>;
      removeMany<Q extends QueryParams>(query: Q): Promise<number>;
      clear(): Promise<number>;
      entityToJSON<E, J>(entity: E): J;
      createIndex(def: any): Promise<void>;
      removeIndex(def: any): Promise<void>;
    }
    export class MongoDBAdapter extends BaseAdapter {
      constructor(opts?: any);
    }
    export class KnexAdapter extends BaseAdapter {
      constructor(opts?: any);
    }
    export class NeDBAdapter extends BaseAdapter {
      constructor(opts?: any);
    }
    export function resolve<T extends Adapter>(opt: any): T;
    export function register(name: string, value?: Adapter): void;
  }
  export namespace Errors {
    class EntityNotFoundError extends BaseErrors.MoleculerClientError {
      constructor(id: string);
    }
  }
  export  type DbServiceOptions = {
    [key: string]: any;
  };
  export function Service(options?: DbServiceOptions): DbService;
  export type generateFieldValidatorSchema = Schema["generateFieldValidatorSchema"];
  export type generateValidatorSchemaFromFields = Schema["generateValidatorSchemaFromFields"];
}
