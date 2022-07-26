/**
 * cache option
 */
type CacheOptionsNormalized = false | FileCacheOptions | MemoryCacheOptions;

declare interface FileCacheOptions {
  /**
   * Allows to collect unused memory allocated during deserialization. This requires copying data into smaller buffers and has a performance cost.
   */
  allowCollectingMemory?: boolean;

  /**
   * Dependencies the build depends on (in multiple categories, default categories: 'defaultWebpack').
   */
  buildDependencies?: { [index: string]: string[] };

  /**
   * Base directory for the cache (defaults to node_modules/.cache/webpack).
   */
  cacheDirectory?: string;

  /**
   * Locations for the cache (defaults to cacheDirectory / name).
   */
  cacheLocation?: string;

  /**
   * Compression type used for the cache files.
   */
  compression?: false | 'gzip' | 'brotli';

  /**
   * Algorithm used for generation the hash (see node.js crypto package).
   */
  hashAlgorithm?: string;

  /**
   * Time in ms after which idle period the cache storing should happen.
   */
  idleTimeout?: number;

  /**
   * Time in ms after which idle period the cache storing should happen when larger changes has been detected (cumulative build time > 2 x avg cache store time).
   */
  idleTimeoutAfterLargeChanges?: number;

  /**
   * Time in ms after which idle period the initial cache storing should happen.
   */
  idleTimeoutForInitialStore?: number;

  /**
   * List of paths that are managed by a package manager and contain a version or hash in its path so all files are immutable.
   */
  immutablePaths?: (string | RegExp)[];

  /**
   * List of paths that are managed by a package manager and can be trusted to not be modified otherwise.
   */
  managedPaths?: (string | RegExp)[];

  /**
   * Time for which unused cache entries stay in the filesystem cache at minimum (in milliseconds).
   */
  maxAge?: number;

  /**
   * Number of generations unused cache entries stay in memory cache at minimum (0 = no memory cache used, 1 = may be removed after unused for a single compilation, ..., Infinity: kept forever). Cache entries will be deserialized from disk when removed from memory cache.
   */
  maxMemoryGenerations?: number;

  /**
   * Additionally cache computation of modules that are unchanged and reference only unchanged modules in memory.
   */
  memoryCacheUnaffected?: boolean;

  /**
   * Name for the cache. Different names will lead to different coexisting caches.
   */
  name?: string;

  /**
   * Track and log detailed timing information for individual cache items.
   */
  profile?: boolean;

  /**
   * When to store data to the filesystem. (pack: Store data when compiler is idle in a single file).
   */
  store?: 'pack';

  /**
   * Filesystem caching.
   */
  type: 'filesystem';

  /**
   * Version of the cache data. Different versions won't allow to reuse the cache and override existing content. Update the version when config changed in a way which doesn't allow to reuse cache. This will invalidate the cache.
   */
  version?: string;
}

declare interface MemoryCacheOptions {
  /**
   * Additionally cache computation of modules that are unchanged and reference only unchanged modules.
   */
  cacheUnaffected?: boolean;

  /**
   * Number of generations unused cache entries stay in memory cache at minimum (1 = may be removed after unused for a single compilation, ..., Infinity: kept forever).
   */
  maxGenerations?: number;

  /**
   * In memory caching.
   */
  type: 'memory';
}

/**
 * devServer option
 */
declare interface DevServer {
  [index: string]: any;
}

/**
 * entry option
 */
declare const TOMBSTONE: unique symbol;
declare const TRANSITIVE: unique symbol;
declare const TRANSITIVE_ONLY: unique symbol;
declare const CIRCULAR_CONNECTION: unique symbol;

type EntryNormalized =
  | (() => Promise<EntryStaticNormalized>)
  | EntryStaticNormalized;

declare interface EntryStaticNormalized {
  [index: string]: EntryDescriptionNormalized | string;
}

declare interface EntryDescriptionNormalized {
  /**
   * Enable/disable creating async chunks that are loaded on demand.
   */
  asyncChunks?: boolean;

  /**
   * Base uri for this entry.
   */
  baseUri?: string;

  /**
   * The method of loading chunks (methods included by default are 'jsonp' (web), 'import' (ESM), 'importScripts' (WebWorker), 'require' (sync node.js), 'async-node' (async node.js), but others might be added by plugins).
   */
  chunkLoading?: string | false;

  /**
   * The entrypoints that the current entrypoint depend on. They must be loaded when this entrypoint is loaded.
   */
  dependOn?: string[];

  /**
   * Specifies the filename of output files on disk. You must **not** specify an absolute path here, but the path may contain folders separated by '/'! The specified path is joined with the value of the 'output.path' option to determine the location on disk.
   */
  filename?: string | ((pathData: PathData, assetInfo?: AssetInfo) => string);

  /**
   * Module(s) that are loaded upon startup. The last one is exported.
   */
  import?: string[];

  /**
   * Specifies the layer in which modules of this entrypoint are placed.
   */
  layer?: null | string;

  /**
   * Options for library.
   */
  library?: LibraryOptions;

  /**
   * The 'publicPath' specifies the public URL address of the output files when referenced in a browser.
   */
  publicPath?: string | ((pathData: PathData, assetInfo?: AssetInfo) => string);

  /**
   * The name of the runtime chunk. If set a runtime chunk with this name is created or an existing entrypoint is used as runtime.
   */
  runtime?: string | false;

  /**
   * The method of loading WebAssembly Modules (methods included by default are 'fetch' (web/WebWorker), 'async-node' (node.js), but others might be added by plugins).
   */
  wasmLoading?: string | false;
}

declare interface PathData {
  chunkGraph?: ChunkGraph;
  hash?: string;
  hashWithLength?: (arg0: number) => string;
  chunk?: Chunk | ChunkPathData;
  module?: Module | ModulePathData;
  runtime?: RuntimeSpec;
  filename?: string;
  basename?: string;
  query?: string;
  contentHashType?: string;
  contentHash?: string;
  contentHashWithLength?: (arg0: number) => string;
  noChunkHash?: boolean;
  url?: string;
}

declare abstract class SortableSet<T> extends Set<T> {
  /**
   * Sort with a comparer function
   */
  sortWith(sortFn: (arg0: T, arg1: T) => number): void;

  sort(): SortableSet<T>;

  /**
   * Get data from cache
   */
  getFromCache<R>(fn: (arg0: SortableSet<T>) => R): R;

  /**
   * Get data from cache (ignoring sorting)
   */
  getFromUnorderedCache<R>(fn: (arg0: SortableSet<T>) => R): R;

  toJSON(): T[];

  /**
   * Iterates over values in the set.
   */
  [Symbol.iterator](): IterableIterator<T>;
}

type RuntimeSpec = undefined | string | SortableSet<string>;

declare interface SyntheticDependencyLocation {
  name: string;
  index?: number;
}

declare interface SourcePosition {
  line: number;
  column?: number;
}

declare interface RealDependencyLocation {
  start: SourcePosition;
  end?: SourcePosition;
  index?: number;
}

type DependencyLocation = SyntheticDependencyLocation | RealDependencyLocation;

declare interface ReferencedExport {
  /**
   * name of the referenced export
   */
  name: string[];

  /**
   * when false, referenced export can not be mangled, defaults to true
   */
  canMangle?: boolean;
}

type ConnectionState =
  | boolean
  | typeof TRANSITIVE_ONLY
  | typeof CIRCULAR_CONNECTION;

declare class Hash {
  constructor();

  /**
   * Update hash {@link https ://nodejs.org/api/crypto.html#crypto_hash_update_data_inputencoding}
   */
  update(data: string | Buffer, inputEncoding?: string): Hash;

  /**
   * Calculates the digest {@link https ://nodejs.org/api/crypto.html#crypto_hash_digest_encoding}
   */
  digest(encoding?: string): string | Buffer;
}

declare class Dependency {
  constructor();

  weak: boolean;
  optional: boolean;
  readonly type: string;
  readonly category: string;
  loc: DependencyLocation;

  setLoc(
    startLine?: any,
    startColumn?: any,
    endLine?: any,
    endColumn?: any
  ): void;

  getContext(): undefined | string;

  getResourceIdentifier(): null | string;

  couldAffectReferencingModule(): boolean | typeof TRANSITIVE;

  /**
   * Returns the referenced module and export
   */
  getReference(moduleGraph: ModuleGraph): never;

  /**
   * Returns list of exports referenced by this dependency
   */
  getReferencedExports(
    moduleGraph: ModuleGraph,
    runtime: RuntimeSpec
  ): (string[] | ReferencedExport)[];

  getCondition(
    moduleGraph: ModuleGraph
  ):
    | null
    | false
    | ((arg0: ModuleGraphConnection, arg1: RuntimeSpec) => ConnectionState);

  /**
   * Returns the exported names
   */
  getExports(moduleGraph: ModuleGraph): undefined | ExportsSpec;

  /**
   * Returns warnings
   */
  getWarnings(moduleGraph: ModuleGraph): WebpackError[];

  /**
   * Returns errors
   */
  getErrors(moduleGraph: ModuleGraph): WebpackError[];

  /**
   * Update the hash
   */
  updateHash(hash: Hash, context: UpdateHashContextDependency): void;

  /**
   * implement this method to allow the occurrence order plugin to count correctly
   */
  getNumberOfIdOccurrences(): number;

  getModuleEvaluationSideEffectsState(
    moduleGraph: ModuleGraph
  ): ConnectionState;

  createIgnoredModule(context: string): Module;

  serialize(__0: { write: any }): void;

  deserialize(__0: { read: any }): void;

  module: any;
  readonly disconnect: any;
  static NO_EXPORTS_REFERENCED: string[][];
  static EXPORTS_OBJECT_REFERENCED: string[][];
  static TRANSITIVE: typeof TRANSITIVE;
}

declare interface UpdateHashContextDependency {
  chunkGraph: ChunkGraph;
  runtime: RuntimeSpec;
  runtimeTemplate?: RuntimeTemplate;
}

declare abstract class RuntimeTemplate {
  compilation: Compilation;
  outputOptions: OutputNormalized;
  requestShortener: RequestShortener;
  globalObject: string;
  contentHashReplacement: string;

  isIIFE(): undefined | boolean;

  isModule(): undefined | boolean;

  supportsConst(): undefined | boolean;

  supportsArrowFunction(): undefined | boolean;

  supportsOptionalChaining(): undefined | boolean;

  supportsForOf(): undefined | boolean;

  supportsDestructuring(): undefined | boolean;

  supportsBigIntLiteral(): undefined | boolean;

  supportsDynamicImport(): undefined | boolean;

  supportsEcmaScriptModuleSyntax(): undefined | boolean;

  supportTemplateLiteral(): undefined | boolean;

  returningFunction(returnValue?: any, args?: string): string;

  basicFunction(args?: any, body?: any): string;

  concatenation(...args: (string | { expr: string })[]): string;

  expressionFunction(expression?: any, args?: string): string;

  emptyFunction(): 'x => {}' | 'function() {}';

  destructureArray(items?: any, value?: any): string;

  destructureObject(items?: any, value?: any): string;

  iife(args?: any, body?: any): string;

  forEach(variable?: any, array?: any, body?: any): string;

  /**
   * Add a comment
   */
  comment(__0: {
    /**
     * request string used originally
     */
    request?: string;
    /**
     * name of the chunk referenced
     */
    chunkName?: string;
    /**
     * reason information of the chunk
     */
    chunkReason?: string;
    /**
     * additional message
     */
    message?: string;
    /**
     * name of the export
     */
    exportName?: string;
  }): string;

  throwMissingModuleErrorBlock(__0: {
    /**
     * request string used originally
     */
    request?: string;
  }): string;

  throwMissingModuleErrorFunction(__0: {
    /**
     * request string used originally
     */
    request?: string;
  }): string;

  missingModule(__0: {
    /**
     * request string used originally
     */
    request?: string;
  }): string;

  missingModuleStatement(__0: {
    /**
     * request string used originally
     */
    request?: string;
  }): string;

  missingModulePromise(__0: {
    /**
     * request string used originally
     */
    request?: string;
  }): string;

  weakError(__0: {
    /**
     * the chunk graph
     */
    chunkGraph: ChunkGraph;
    /**
     * the module
     */
    module: Module;
    /**
     * the request that should be printed as comment
     */
    request: string;
    /**
     * expression to use as id expression
     */
    idExpr?: string;
    /**
     * which kind of code should be returned
     */
    type: 'promise' | 'expression' | 'statements';
  }): string;

  moduleId(__0: {
    /**
     * the module
     */
    module: Module;
    /**
     * the chunk graph
     */
    chunkGraph: ChunkGraph;
    /**
     * the request that should be printed as comment
     */
    request: string;
    /**
     * if the dependency is weak (will create a nice error message)
     */
    weak?: boolean;
  }): string;

  moduleRaw(__0: {
    /**
     * the module
     */
    module: Module;
    /**
     * the chunk graph
     */
    chunkGraph: ChunkGraph;
    /**
     * the request that should be printed as comment
     */
    request: string;
    /**
     * if the dependency is weak (will create a nice error message)
     */
    weak?: boolean;
    /**
     * if set, will be filled with runtime requirements
     */
    runtimeRequirements: Set<string>;
  }): string;

  moduleExports(__0: {
    /**
     * the module
     */
    module: Module;
    /**
     * the chunk graph
     */
    chunkGraph: ChunkGraph;
    /**
     * the request that should be printed as comment
     */
    request: string;
    /**
     * if the dependency is weak (will create a nice error message)
     */
    weak?: boolean;
    /**
     * if set, will be filled with runtime requirements
     */
    runtimeRequirements: Set<string>;
  }): string;

  moduleNamespace(__0: {
    /**
     * the module
     */
    module: Module;
    /**
     * the chunk graph
     */
    chunkGraph: ChunkGraph;
    /**
     * the request that should be printed as comment
     */
    request: string;
    /**
     * if the current module is in strict esm mode
     */
    strict?: boolean;
    /**
     * if the dependency is weak (will create a nice error message)
     */
    weak?: boolean;
    /**
     * if set, will be filled with runtime requirements
     */
    runtimeRequirements: Set<string>;
  }): string;

  moduleNamespacePromise(__0: {
    /**
     * the chunk graph
     */
    chunkGraph: ChunkGraph;
    /**
     * the current dependencies block
     */
    block?: AsyncDependenciesBlock;
    /**
     * the module
     */
    module: Module;
    /**
     * the request that should be printed as comment
     */
    request: string;
    /**
     * a message for the comment
     */
    message: string;
    /**
     * if the current module is in strict esm mode
     */
    strict?: boolean;
    /**
     * if the dependency is weak (will create a nice error message)
     */
    weak?: boolean;
    /**
     * if set, will be filled with runtime requirements
     */
    runtimeRequirements: Set<string>;
  }): string;

  runtimeConditionExpression(__0: {
    /**
     * the chunk graph
     */
    chunkGraph: ChunkGraph;
    /**
     * runtime for which this code will be generated
     */
    runtime?: RuntimeSpec;
    /**
     * only execute the statement in some runtimes
     */
    runtimeCondition?: string | boolean | SortableSet<string>;
    /**
     * if set, will be filled with runtime requirements
     */
    runtimeRequirements: Set<string>;
  }): string;

  importStatement(__0: {
    /**
     * whether a new variable should be created or the existing one updated
     */
    update?: boolean;
    /**
     * the module
     */
    module: Module;
    /**
     * the chunk graph
     */
    chunkGraph: ChunkGraph;
    /**
     * the request that should be printed as comment
     */
    request: string;
    /**
     * name of the import variable
     */
    importVar: string;
    /**
     * module in which the statement is emitted
     */
    originModule: Module;
    /**
     * true, if this is a weak dependency
     */
    weak?: boolean;
    /**
     * if set, will be filled with runtime requirements
     */
    runtimeRequirements: Set<string>;
  }): [string, string];

  exportFromImport(__0: {
    /**
     * the module graph
     */
    moduleGraph: ModuleGraph;
    /**
     * the module
     */
    module: Module;
    /**
     * the request
     */
    request: string;
    /**
     * the export name
     */
    exportName: string | string[];
    /**
     * the origin module
     */
    originModule: Module;
    /**
     * true, if location is safe for ASI, a bracket can be emitted
     */
    asiSafe?: boolean;
    /**
     * true, if expression will be called
     */
    isCall: boolean;
    /**
     * when false, call context will not be preserved
     */
    callContext: boolean;
    /**
     * when true and accessing the default exports, interop code will be generated
     */
    defaultInterop: boolean;
    /**
     * the identifier name of the import variable
     */
    importVar: string;
    /**
     * init fragments will be added here
     */
    initFragments: InitFragment<any>[];
    /**
     * runtime for which this code will be generated
     */
    runtime: RuntimeSpec;
    /**
     * if set, will be filled with runtime requirements
     */
    runtimeRequirements: Set<string>;
  }): string;

  blockPromise(__0: {
    /**
     * the async block
     */
    block: AsyncDependenciesBlock;
    /**
     * the message
     */
    message: string;
    /**
     * the chunk graph
     */
    chunkGraph: ChunkGraph;
    /**
     * if set, will be filled with runtime requirements
     */
    runtimeRequirements: Set<string>;
  }): string;

  asyncModuleFactory(__0: {
    /**
     * the async block
     */
    block: AsyncDependenciesBlock;
    /**
     * the chunk graph
     */
    chunkGraph: ChunkGraph;
    /**
     * if set, will be filled with runtime requirements
     */
    runtimeRequirements: Set<string>;
    /**
     * request string used originally
     */
    request?: string;
  }): string;

  syncModuleFactory(__0: {
    /**
     * the dependency
     */
    dependency: Dependency;
    /**
     * the chunk graph
     */
    chunkGraph: ChunkGraph;
    /**
     * if set, will be filled with runtime requirements
     */
    runtimeRequirements: Set<string>;
    /**
     * request string used originally
     */
    request?: string;
  }): string;

  defineEsModuleFlagStatement(__0: {
    /**
     * the name of the exports object
     */
    exportsArgument: string;
    /**
     * if set, will be filled with runtime requirements
     */
    runtimeRequirements: Set<string>;
  }): string;

  assetUrl(__0: {
    /**
     * the module
     */
    module: Module;
    /**
     * the public path
     */
    publicPath: string;
    /**
     * runtime
     */
    runtime?: RuntimeSpec;
    /**
     * the code generation results
     */
    codeGenerationResults: CodeGenerationResults;
  }): string;
}

declare class WebpackError extends Error {
  /**
   * Creates an instance of WebpackError.
   */
  constructor(message?: string);

  details: any;
  module: Module;
  loc: DependencyLocation;
  hideStack: boolean;
  chunk: Chunk;
  file: string;

  serialize(__0: { write: any }): void;

  deserialize(__0: { read: any }): void;

  /**
   * Create .stack property on a target object
   */
  static captureStackTrace(
    targetObject: object,
    constructorOpt?: Function
  ): void;

  /**
   * Optional override for formatting stack traces
   */
  static prepareStackTrace?: (
    err: Error,
    stackTraces: NodeJS.CallSite[]
  ) => any;
  static stackTraceLimit: number;
}

declare interface ExportsSpec {
  /**
   * exported names, true for unknown exports or null for no exports
   */
  exports: null | true | (string | ExportSpec)[];

  /**
   * when exports = true, list of unaffected exports
   */
  excludeExports?: Set<string>;

  /**
   * list of maybe prior exposed, but now hidden exports
   */
  hideExports?: Set<string>;

  /**
   * when reexported: from which module
   */
  from?: ModuleGraphConnection;

  /**
   * when reexported: with which priority
   */
  priority?: number;

  /**
   * can the export be renamed (defaults to true)
   */
  canMangle?: boolean;

  /**
   * are the exports terminal bindings that should be checked for export star conflicts
   */
  terminalBinding?: boolean;

  /**
   * module on which the result depends on
   */
  dependencies?: Module[];
}

declare interface DependencyConstructor {
  new(...args: any[]): Dependency;
}

declare abstract class DependenciesBlock {
  dependencies: Dependency[];
  blocks: AsyncDependenciesBlock[];
  parent: DependenciesBlock;

  getRootBlock(): DependenciesBlock;

  /**
   * Adds a DependencyBlock to DependencyBlock relationship.
   * This is used for when a Module has a AsyncDependencyBlock tie (for code-splitting)
   */
  addBlock(block: AsyncDependenciesBlock): void;

  addDependency(dependency: Dependency): void;

  removeDependency(dependency: Dependency): void;

  /**
   * Removes all dependencies and blocks
   */
  clearDependenciesAndBlocks(): void;

  updateHash(hash: Hash, context: UpdateHashContextDependency): void;

  serialize(__0: { write: any }): void;

  deserialize(__0: { read: any }): void;
}

declare class Module extends DependenciesBlock {
  constructor(type: string, context?: string, layer?: string);

  type: string;
  context: null | string;
  layer: null | string;
  needId: boolean;
  debugId: number;
  resolveOptions: ResolveOptionsWebpackOptions;
  factoryMeta?: object;
  useSourceMap: boolean;
  useSimpleSourceMap: boolean;
  buildMeta: BuildMeta;
  buildInfo: Record<string, any>;
  presentationalDependencies?: Dependency[];
  codeGenerationDependencies?: Dependency[];
  id: string | number;
  readonly hash: string;
  readonly renderedHash: string;
  profile: null | ModuleProfile;
  index: number;
  index2: number;
  depth: number;
  issuer: null | Module;
  readonly usedExports: null | boolean | SortableSet<string>;
  readonly optimizationBailout: (
    | string
    | ((requestShortener: RequestShortener) => string)
    )[];
  readonly optional: boolean;

  addChunk(chunk?: any): boolean;

  removeChunk(chunk?: any): void;

  isInChunk(chunk?: any): boolean;

  isEntryModule(): boolean;

  getChunks(): Chunk[];

  getNumberOfChunks(): number;

  readonly chunksIterable: Iterable<Chunk>;

  isProvided(exportName: string): null | boolean;

  readonly exportsArgument: string;
  readonly moduleArgument: string;

  getExportsType(
    moduleGraph: ModuleGraph,
    strict: boolean
  ): 'namespace' | 'default-only' | 'default-with-named' | 'dynamic';

  addPresentationalDependency(presentationalDependency: Dependency): void;

  addCodeGenerationDependency(codeGenerationDependency: Dependency): void;

  addWarning(warning: WebpackError): void;

  getWarnings(): undefined | Iterable<WebpackError>;

  getNumberOfWarnings(): number;

  addError(error: WebpackError): void;

  getErrors(): undefined | Iterable<WebpackError>;

  getNumberOfErrors(): number;

  /**
   * removes all warnings and errors
   */
  clearWarningsAndErrors(): void;

  isOptional(moduleGraph: ModuleGraph): boolean;

  isAccessibleInChunk(
    chunkGraph: ChunkGraph,
    chunk: Chunk,
    ignoreChunk?: Chunk
  ): boolean;

  isAccessibleInChunkGroup(
    chunkGraph: ChunkGraph,
    chunkGroup: ChunkGroup,
    ignoreChunk?: Chunk
  ): boolean;

  hasReasonForChunk(
    chunk: Chunk,
    moduleGraph: ModuleGraph,
    chunkGraph: ChunkGraph
  ): boolean;

  hasReasons(moduleGraph: ModuleGraph, runtime: RuntimeSpec): boolean;

  needBuild(
    context: NeedBuildContext,
    callback: (arg0?: null | WebpackError, arg1?: boolean) => void
  ): void;

  needRebuild(
    fileTimestamps: Map<string, null | number>,
    contextTimestamps: Map<string, null | number>
  ): boolean;

  invalidateBuild(): void;

  identifier(): string;

  readableIdentifier(requestShortener: RequestShortener): string;

  build(
    options: WebpackOptionsNormalized,
    compilation: Compilation,
    resolver: ResolverWithOptions,
    fs: InputFileSystem,
    callback: (arg0?: WebpackError) => void
  ): void;

  getSourceTypes(): Set<string>;

  source(
    dependencyTemplates: DependencyTemplates,
    runtimeTemplate: RuntimeTemplate,
    type?: string
  ): Source;

  size(type?: string): number;

  libIdent(options: LibIdentOptions): null | string;

  nameForCondition(): null | string;

  getConcatenationBailoutReason(
    context: ConcatenationBailoutReasonContext
  ): undefined | string;

  getSideEffectsConnectionState(moduleGraph: ModuleGraph): ConnectionState;

  codeGeneration(context: CodeGenerationContext): CodeGenerationResult;

  chunkCondition(chunk: Chunk, compilation: Compilation): boolean;

  hasChunkCondition(): boolean;

  /**
   * Assuming this module is in the cache. Update the (cached) module with
   * the fresh module from the factory. Usually updates internal references
   * and properties.
   */
  updateCacheModule(module: Module): void;

  /**
   * Module should be unsafe cached. Get data that's needed for that.
   * This data will be passed to restoreFromUnsafeCache later.
   */
  getUnsafeCacheData(): object;

  /**
   * Assuming this module is in the cache. Remove internal references to allow freeing some memory.
   */
  cleanupForCache(): void;

  originalSource(): null | Source;

  addCacheDependencies(
    fileDependencies: LazySet<string>,
    contextDependencies: LazySet<string>,
    missingDependencies: LazySet<string>,
    buildDependencies: LazySet<string>
  ): void;

  readonly hasEqualsChunks: any;
  readonly isUsed: any;
  readonly errors: any;
  readonly warnings: any;
  used: any;
}

declare class ModuleGraphConnection {
  constructor(
    originModule: null | Module,
    dependency: null | Dependency,
    module: Module,
    explanation?: string,
    weak?: boolean,
    condition?:
      | false
      | ((arg0: ModuleGraphConnection, arg1: RuntimeSpec) => ConnectionState)
  );

  originModule: null | Module;
  resolvedOriginModule: null | Module;
  dependency: null | Dependency;
  resolvedModule: Module;
  module: Module;
  weak: boolean;
  conditional: boolean;
  condition: (
    arg0: ModuleGraphConnection,
    arg1: RuntimeSpec
  ) => ConnectionState;
  explanations: Set<string>;

  clone(): ModuleGraphConnection;

  addCondition(
    condition: (
      arg0: ModuleGraphConnection,
      arg1: RuntimeSpec
    ) => ConnectionState
  ): void;

  addExplanation(explanation: string): void;

  readonly explanation: string;
  active: void;

  isActive(runtime: RuntimeSpec): boolean;

  isTargetActive(runtime: RuntimeSpec): boolean;

  getActiveState(runtime: RuntimeSpec): ConnectionState;

  setActive(value: boolean): void;

  static addConnectionStates: (
    a: ConnectionState,
    b: ConnectionState
  ) => ConnectionState;
  static TRANSITIVE_ONLY: typeof TRANSITIVE_ONLY;
  static CIRCULAR_CONNECTION: typeof CIRCULAR_CONNECTION;
}

declare class ModuleGraph {
  constructor();

  setParents(
    dependency: Dependency,
    block: DependenciesBlock,
    module: Module,
    indexInBlock?: number
  ): void;

  getParentModule(dependency: Dependency): Module;

  getParentBlock(dependency: Dependency): DependenciesBlock;

  getParentBlockIndex(dependency: Dependency): number;

  setResolvedModule(
    originModule: Module,
    dependency: Dependency,
    module: Module
  ): void;

  updateModule(dependency: Dependency, module: Module): void;

  removeConnection(dependency: Dependency): void;

  addExplanation(dependency: Dependency, explanation: string): void;

  cloneModuleAttributes(sourceModule: Module, targetModule: Module): void;

  removeModuleAttributes(module: Module): void;

  removeAllModuleAttributes(): void;

  moveModuleConnections(
    oldModule: Module,
    newModule: Module,
    filterConnection: (arg0: ModuleGraphConnection) => boolean
  ): void;

  copyOutgoingModuleConnections(
    oldModule: Module,
    newModule: Module,
    filterConnection: (arg0: ModuleGraphConnection) => boolean
  ): void;

  addExtraReason(module: Module, explanation: string): void;

  getResolvedModule(dependency: Dependency): Module;

  getConnection(dependency: Dependency): undefined | ModuleGraphConnection;

  getModule(dependency: Dependency): Module;

  getOrigin(dependency: Dependency): Module;

  getResolvedOrigin(dependency: Dependency): Module;

  getIncomingConnections(module: Module): Iterable<ModuleGraphConnection>;

  getOutgoingConnections(module: Module): Iterable<ModuleGraphConnection>;

  getIncomingConnectionsByOriginModule(
    module: Module
  ): Map<undefined | Module, ReadonlyArray<ModuleGraphConnection>>;

  getOutgoingConnectionsByModule(
    module: Module
  ): undefined | Map<undefined | Module, ReadonlyArray<ModuleGraphConnection>>;

  getProfile(module: Module): null | ModuleProfile;

  setProfile(module: Module, profile: null | ModuleProfile): void;

  getIssuer(module: Module): null | Module;

  setIssuer(module: Module, issuer: null | Module): void;

  setIssuerIfUnset(module: Module, issuer: null | Module): void;

  getOptimizationBailout(
    module: Module
  ): (string | ((requestShortener: RequestShortener) => string))[];

  getProvidedExports(module: Module): null | true | string[];

  isExportProvided(
    module: Module,
    exportName: string | string[]
  ): null | boolean;

  getExportsInfo(module: Module): ExportsInfo;

  getExportInfo(module: Module, exportName: string): ExportInfo;

  getReadOnlyExportInfo(module: Module, exportName: string): ExportInfo;

  getUsedExports(
    module: Module,
    runtime: RuntimeSpec
  ): null | boolean | SortableSet<string>;

  getPreOrderIndex(module: Module): number;

  getPostOrderIndex(module: Module): number;

  setPreOrderIndex(module: Module, index: number): void;

  setPreOrderIndexIfUnset(module: Module, index: number): boolean;

  setPostOrderIndex(module: Module, index: number): void;

  setPostOrderIndexIfUnset(module: Module, index: number): boolean;

  getDepth(module: Module): number;

  setDepth(module: Module, depth: number): void;

  setDepthIfLower(module: Module, depth: number): boolean;

  isAsync(module: Module): boolean;

  setAsync(module: Module): void;

  getMeta(thing?: any): Object;

  getMetaIfExisting(thing?: any): Object;

  freeze(cacheStage?: string): void;

  unfreeze(): void;

  cached<T extends any[], V>(
    fn: (moduleGraph: ModuleGraph, ...args: T) => V,
    ...args: T
  ): V;

  setModuleMemCaches(
    moduleMemCaches: Map<Module, WeakTupleMap<any, any>>
  ): void;

  dependencyCacheProvide(dependency: Dependency, ...args: any[]): any;

  static getModuleGraphForModule(
    module: Module,
    deprecateMessage: string,
    deprecationCode: string
  ): ModuleGraph;

  static setModuleGraphForModule(
    module: Module,
    moduleGraph: ModuleGraph
  ): void;

  static clearModuleGraphForModule(module: Module): void;

  static ModuleGraphConnection: typeof ModuleGraphConnection;
}

declare interface ModulePathData {
  id: string | number;
  hash: string;
  hashWithLength?: (arg0: number) => string;
}

declare class Chunk {
  constructor(name?: string, backCompat?: boolean);

  id: null | string | number;
  ids: null | (string | number)[];
  debugId: number;
  name: string;
  idNameHints: SortableSet<string>;
  preventIntegration: boolean;
  filenameTemplate:
    | null
    | string
    | ((arg0: PathData, arg1?: AssetInfo) => string);
  cssFilenameTemplate:
    | null
    | string
    | ((arg0: PathData, arg1?: AssetInfo) => string);
  runtime: RuntimeSpec;
  files: Set<string>;
  auxiliaryFiles: Set<string>;
  rendered: boolean;
  hash?: string;
  contentHash: Record<string, string>;
  renderedHash?: string;
  chunkReason?: string;
  extraAsync: boolean;
  readonly entryModule?: Module;

  hasEntryModule(): boolean;

  addModule(module: Module): boolean;

  removeModule(module: Module): void;

  getNumberOfModules(): number;

  readonly modulesIterable: Iterable<Module>;

  compareTo(otherChunk: Chunk): 0 | 1 | -1;

  containsModule(module: Module): boolean;

  getModules(): Module[];

  remove(): void;

  moveModule(module: Module, otherChunk: Chunk): void;

  integrate(otherChunk: Chunk): boolean;

  canBeIntegrated(otherChunk: Chunk): boolean;

  isEmpty(): boolean;

  modulesSize(): number;

  size(options?: ChunkSizeOptions): number;

  integratedSize(otherChunk: Chunk, options: ChunkSizeOptions): number;

  getChunkModuleMaps(filterFn: (m: Module) => boolean): ChunkModuleMaps;

  hasModuleInGraph(
    filterFn: (m: Module) => boolean,
    filterChunkFn?: (c: Chunk, chunkGraph: ChunkGraph) => boolean
  ): boolean;

  getChunkMaps(realHash: boolean): ChunkMaps;

  hasRuntime(): boolean;

  canBeInitial(): boolean;

  isOnlyInitial(): boolean;

  getEntryOptions(): undefined | EntryOptions;

  addGroup(chunkGroup: ChunkGroup): void;

  removeGroup(chunkGroup: ChunkGroup): void;

  isInGroup(chunkGroup: ChunkGroup): boolean;

  getNumberOfGroups(): number;

  readonly groupsIterable: Iterable<ChunkGroup>;

  disconnectFromGroups(): void;

  split(newChunk: Chunk): void;

  updateHash(hash: Hash, chunkGraph: ChunkGraph): void;

  getAllAsyncChunks(): Set<Chunk>;

  getAllInitialChunks(): Set<Chunk>;

  getAllReferencedChunks(): Set<Chunk>;

  getAllReferencedAsyncEntrypoints(): Set<Entrypoint>;

  hasAsyncChunks(): boolean;

  getChildIdsByOrders(
    chunkGraph: ChunkGraph,
    filterFn?: (c: Chunk, chunkGraph: ChunkGraph) => boolean
  ): Record<string, (string | number)[]>;

  getChildrenOfTypeInOrder(
    chunkGraph: ChunkGraph,
    type: string
  ): { onChunks: Chunk[]; chunks: Set<Chunk> }[];

  getChildIdsByOrdersMap(
    chunkGraph: ChunkGraph,
    includeDirectChildren?: boolean,
    filterFn?: (c: Chunk, chunkGraph: ChunkGraph) => boolean
  ): Record<string | number, Record<string, (string | number)[]>>;
}

declare interface ChunkPathData {
  id: string | number;
  name?: string;
  hash: string;
  hashWithLength?: (arg0: number) => string;
  contentHash?: Record<string, string>;
  contentHashWithLength?: Record<string, (length: number) => string>;
}

declare class ChunkGraph {
  constructor(moduleGraph: ModuleGraph, hashFunction?: string | typeof Hash);

  moduleGraph: ModuleGraph;

  connectChunkAndModule(chunk: Chunk, module: Module): void;

  disconnectChunkAndModule(chunk: Chunk, module: Module): void;

  disconnectChunk(chunk: Chunk): void;

  attachModules(chunk: Chunk, modules: Iterable<Module>): void;

  attachRuntimeModules(chunk: Chunk, modules: Iterable<RuntimeModule>): void;

  attachFullHashModules(chunk: Chunk, modules: Iterable<RuntimeModule>): void;

  attachDependentHashModules(
    chunk: Chunk,
    modules: Iterable<RuntimeModule>
  ): void;

  replaceModule(oldModule: Module, newModule: Module): void;

  isModuleInChunk(module: Module, chunk: Chunk): boolean;

  isModuleInChunkGroup(module: Module, chunkGroup: ChunkGroup): boolean;

  isEntryModule(module: Module): boolean;

  getModuleChunksIterable(module: Module): Iterable<Chunk>;

  getOrderedModuleChunksIterable(
    module: Module,
    sortFn: (arg0: Chunk, arg1: Chunk) => 0 | 1 | -1
  ): Iterable<Chunk>;

  getModuleChunks(module: Module): Chunk[];

  getNumberOfModuleChunks(module: Module): number;

  getModuleRuntimes(module: Module): RuntimeSpecSet;

  getNumberOfChunkModules(chunk: Chunk): number;

  getNumberOfChunkFullHashModules(chunk: Chunk): number;

  getChunkModulesIterable(chunk: Chunk): Iterable<Module>;

  getChunkModulesIterableBySourceType(
    chunk: Chunk,
    sourceType: string
  ): undefined | Iterable<Module>;

  setChunkModuleSourceTypes(
    chunk: Chunk,
    module: Module,
    sourceTypes: Set<string>
  ): void;

  getChunkModuleSourceTypes(chunk: Chunk, module: Module): Set<string>;

  getModuleSourceTypes(module: Module): Set<string>;

  getOrderedChunkModulesIterable(
    chunk: Chunk,
    comparator: (arg0: Module, arg1: Module) => 0 | 1 | -1
  ): Iterable<Module>;

  getOrderedChunkModulesIterableBySourceType(
    chunk: Chunk,
    sourceType: string,
    comparator: (arg0: Module, arg1: Module) => 0 | 1 | -1
  ): undefined | Iterable<Module>;

  getChunkModules(chunk: Chunk): Module[];

  getOrderedChunkModules(
    chunk: Chunk,
    comparator: (arg0: Module, arg1: Module) => 0 | 1 | -1
  ): Module[];

  getChunkModuleIdMap(
    chunk: Chunk,
    filterFn: (m: Module) => boolean,
    includeAllChunks?: boolean
  ): Record<string | number, (string | number)[]>;

  getChunkModuleRenderedHashMap(
    chunk: Chunk,
    filterFn: (m: Module) => boolean,
    hashLength?: number,
    includeAllChunks?: boolean
  ): Record<string | number, Record<string | number, string>>;

  getChunkConditionMap(
    chunk: Chunk,
    filterFn: (c: Chunk, chunkGraph: ChunkGraph) => boolean
  ): Record<string | number, boolean>;

  hasModuleInGraph(
    chunk: Chunk,
    filterFn: (m: Module) => boolean,
    filterChunkFn?: (c: Chunk, chunkGraph: ChunkGraph) => boolean
  ): boolean;

  compareChunks(chunkA: Chunk, chunkB: Chunk): 0 | 1 | -1;

  getChunkModulesSize(chunk: Chunk): number;

  getChunkModulesSizes(chunk: Chunk): Record<string, number>;

  getChunkRootModules(chunk: Chunk): Module[];

  getChunkSize(chunk: Chunk, options?: ChunkSizeOptions): number;

  getIntegratedChunksSize(
    chunkA: Chunk,
    chunkB: Chunk,
    options?: ChunkSizeOptions
  ): number;

  canChunksBeIntegrated(chunkA: Chunk, chunkB: Chunk): boolean;

  integrateChunks(chunkA: Chunk, chunkB: Chunk): void;

  upgradeDependentToFullHashModules(chunk: Chunk): void;

  isEntryModuleInChunk(module: Module, chunk: Chunk): boolean;

  connectChunkAndEntryModule(
    chunk: Chunk,
    module: Module,
    entrypoint?: Entrypoint
  ): void;

  connectChunkAndRuntimeModule(chunk: Chunk, module: RuntimeModule): void;

  addFullHashModuleToChunk(chunk: Chunk, module: RuntimeModule): void;

  addDependentHashModuleToChunk(chunk: Chunk, module: RuntimeModule): void;

  disconnectChunkAndEntryModule(chunk: Chunk, module: Module): void;

  disconnectChunkAndRuntimeModule(chunk: Chunk, module: RuntimeModule): void;

  disconnectEntryModule(module: Module): void;

  disconnectEntries(chunk: Chunk): void;

  getNumberOfEntryModules(chunk: Chunk): number;

  getNumberOfRuntimeModules(chunk: Chunk): number;

  getChunkEntryModulesIterable(chunk: Chunk): Iterable<Module>;

  getChunkEntryDependentChunksIterable(chunk: Chunk): Iterable<Chunk>;

  hasChunkEntryDependentChunks(chunk: Chunk): boolean;

  getChunkRuntimeModulesIterable(chunk: Chunk): Iterable<RuntimeModule>;

  getChunkRuntimeModulesInOrder(chunk: Chunk): RuntimeModule[];

  getChunkFullHashModulesIterable(
    chunk: Chunk
  ): undefined | Iterable<RuntimeModule>;

  getChunkFullHashModulesSet(
    chunk: Chunk
  ): undefined | ReadonlySet<RuntimeModule>;

  getChunkDependentHashModulesIterable(
    chunk: Chunk
  ): undefined | Iterable<RuntimeModule>;

  getChunkEntryModulesWithChunkGroupIterable(
    chunk: Chunk
  ): Iterable<[Module, undefined | Entrypoint]>;

  getBlockChunkGroup(depBlock: AsyncDependenciesBlock): ChunkGroup;

  connectBlockAndChunkGroup(
    depBlock: AsyncDependenciesBlock,
    chunkGroup: ChunkGroup
  ): void;

  disconnectChunkGroup(chunkGroup: ChunkGroup): void;

  getModuleId(module: Module): string | number;

  setModuleId(module: Module, id: string | number): void;

  getRuntimeId(runtime: string): string | number;

  setRuntimeId(runtime: string, id: string | number): void;

  hasModuleHashes(module: Module, runtime: RuntimeSpec): boolean;

  getModuleHash(module: Module, runtime: RuntimeSpec): string;

  getRenderedModuleHash(module: Module, runtime: RuntimeSpec): string;

  setModuleHashes(
    module: Module,
    runtime: RuntimeSpec,
    hash: string,
    renderedHash: string
  ): void;

  addModuleRuntimeRequirements(
    module: Module,
    runtime: RuntimeSpec,
    items: Set<string>,
    transferOwnership?: boolean
  ): void;

  addChunkRuntimeRequirements(chunk: Chunk, items: Set<string>): void;

  addTreeRuntimeRequirements(chunk: Chunk, items: Iterable<string>): void;

  getModuleRuntimeRequirements(
    module: Module,
    runtime: RuntimeSpec
  ): ReadonlySet<string>;

  getChunkRuntimeRequirements(chunk: Chunk): ReadonlySet<string>;

  getModuleGraphHash(
    module: Module,
    runtime: RuntimeSpec,
    withConnections?: boolean
  ): string;

  getModuleGraphHashBigInt(
    module: Module,
    runtime: RuntimeSpec,
    withConnections?: boolean
  ): bigint;

  getTreeRuntimeRequirements(chunk: Chunk): ReadonlySet<string>;

  static getChunkGraphForModule(
    module: Module,
    deprecateMessage: string,
    deprecationCode: string
  ): ChunkGraph;

  static setChunkGraphForModule(module: Module, chunkGraph: ChunkGraph): void;

  static clearChunkGraphForModule(module: Module): void;

  static getChunkGraphForChunk(
    chunk: Chunk,
    deprecateMessage: string,
    deprecationCode: string
  ): ChunkGraph;

  static setChunkGraphForChunk(chunk: Chunk, chunkGraph: ChunkGraph): void;

  static clearChunkGraphForChunk(chunk: Chunk): void;
}

declare abstract class ChunkGroup {
  groupDebugId: number;
  options: ChunkGroupOptions;
  chunks: Chunk[];
  origins: OriginRecord[];
  index: number;

  /**
   * when a new chunk is added to a chunkGroup, addingOptions will occur.
   */
  addOptions(options: ChunkGroupOptions): void;

  /**
   * returns the name of current ChunkGroup
   * sets a new name for current ChunkGroup
   */
  name?: string;

  /**
   * get a uniqueId for ChunkGroup, made up of its member Chunk debugId's
   */
  readonly debugId: string;

  /**
   * get a unique id for ChunkGroup, made up of its member Chunk id's
   */
  readonly id: string;

  /**
   * Performs an unshift of a specific chunk
   */
  unshiftChunk(chunk: Chunk): boolean;

  /**
   * inserts a chunk before another existing chunk in group
   */
  insertChunk(chunk: Chunk, before: Chunk): boolean;

  /**
   * add a chunk into ChunkGroup. Is pushed on or prepended
   */
  pushChunk(chunk: Chunk): boolean;

  replaceChunk(oldChunk: Chunk, newChunk: Chunk): boolean;

  removeChunk(chunk: Chunk): boolean;

  isInitial(): boolean;

  addChild(group: ChunkGroup): boolean;

  getChildren(): ChunkGroup[];

  getNumberOfChildren(): number;

  readonly childrenIterable: SortableSet<ChunkGroup>;

  removeChild(group: ChunkGroup): boolean;

  addParent(parentChunk: ChunkGroup): boolean;

  getParents(): ChunkGroup[];

  getNumberOfParents(): number;

  hasParent(parent: ChunkGroup): boolean;

  readonly parentsIterable: SortableSet<ChunkGroup>;

  removeParent(chunkGroup: ChunkGroup): boolean;

  addAsyncEntrypoint(entrypoint: Entrypoint): boolean;

  readonly asyncEntrypointsIterable: SortableSet<ChunkGroup>;

  getBlocks(): any[];

  getNumberOfBlocks(): number;

  hasBlock(block?: any): boolean;

  readonly blocksIterable: Iterable<AsyncDependenciesBlock>;

  addBlock(block: AsyncDependenciesBlock): boolean;

  addOrigin(module: Module, loc: DependencyLocation, request: string): void;

  getFiles(): string[];

  remove(): void;

  sortItems(): void;

  /**
   * Sorting predicate which allows current ChunkGroup to be compared against another.
   * Sorting values are based off of number of chunks in ChunkGroup.
   */
  compareTo(chunkGraph: ChunkGraph, otherGroup: ChunkGroup): 0 | 1 | -1;

  getChildrenByOrders(
    moduleGraph: ModuleGraph,
    chunkGraph: ChunkGraph
  ): Record<string, ChunkGroup[]>;

  /**
   * Sets the top-down index of a module in this ChunkGroup
   */
  setModulePreOrderIndex(module: Module, index: number): void;

  /**
   * Gets the top-down index of a module in this ChunkGroup
   */
  getModulePreOrderIndex(module: Module): number;

  /**
   * Sets the bottom-up index of a module in this ChunkGroup
   */
  setModulePostOrderIndex(module: Module, index: number): void;

  /**
   * Gets the bottom-up index of a module in this ChunkGroup
   */
  getModulePostOrderIndex(module: Module): number;

  checkConstraints(): void;

  getModuleIndex: (module: Module) => number;
  getModuleIndex2: (module: Module) => number;
}

type AssetInfo = KnownAssetInfo & Record<string, any>;

declare interface KnownAssetInfo {
  /**
   * true, if the asset can be long term cached forever (contains a hash)
   */
  immutable?: boolean;

  /**
   * whether the asset is minimized
   */
  minimized?: boolean;

  /**
   * the value(s) of the full hash used for this asset
   */
  fullhash?: string | string[];

  /**
   * the value(s) of the chunk hash used for this asset
   */
  chunkhash?: string | string[];

  /**
   * the value(s) of the module hash used for this asset
   */
  modulehash?: string | string[];

  /**
   * the value(s) of the content hash used for this asset
   */
  contenthash?: string | string[];

  /**
   * when asset was created from a source file (potentially transformed), the original filename relative to compilation context
   */
  sourceFilename?: string;

  /**
   * size in bytes, only set after asset has been emitted
   */
  size?: number;

  /**
   * true, when asset is only used for development and doesn't count towards user-facing assets
   */
  development?: boolean;

  /**
   * true, when asset ships data for updating an existing application (HMR)
   */
  hotModuleReplacement?: boolean;

  /**
   * true, when asset is javascript and an ESM
   */
  javascriptModule?: boolean;

  /**
   * object of pointers to other assets, keyed by type of relation (only points from parent to child)
   */
  related?: Record<string, string | string[]>;
}

declare interface LibraryOptions {
  /**
   * Add a comment in the UMD wrapper.
   */
  auxiliaryComment?: string | LibraryCustomUmdCommentObject;

  /**
   * Specify which export should be exposed as library.
   */
  export?: string | string[];

  /**
   * The name of the library (some types allow unnamed libraries too).
   */
  name?: string | string[] | LibraryCustomUmdObject;

  /**
   * Type of library (types included by default are 'var', 'module', 'assign', 'assign-properties', 'this', 'window', 'self', 'global', 'commonjs', 'commonjs2', 'commonjs-module', 'commonjs-static', 'amd', 'amd-require', 'umd', 'umd2', 'jsonp', 'system', but others might be added by plugins).
   */
  type: string;

  /**
   * If `output.libraryTarget` is set to umd and `output.library` is set, setting this to true will name the AMD module.
   */
  umdNamedDefine?: boolean;
}

declare interface LibraryCustomUmdCommentObject {
  /**
   * Set comment for `amd` section in UMD.
   */
  amd?: string;

  /**
   * Set comment for `commonjs` (exports) section in UMD.
   */
  commonjs?: string;

  /**
   * Set comment for `commonjs2` (module.exports) section in UMD.
   */
  commonjs2?: string;

  /**
   * Set comment for `root` (global variable) section in UMD.
   */
  root?: string;
}

declare interface LibraryCustomUmdObject {
  /**
   * Name of the exposed AMD library in the UMD.
   */
  amd?: string;

  /**
   * Name of the exposed commonjs export in the UMD.
   */
  commonjs?: string;

  /**
   * Name of the property exposed globally by a UMD library.
   */
  root?: string | string[];
}

/**
 * resolve option
 */
declare interface ResolveOptionsWebpackOptions {
  /**
   * Redirect module requests.
   */
  alias?:
    | {
    /**
     * New request.
     */
    alias: string | false | string[];
    /**
     * Request to be redirected.
     */
    name: string;
    /**
     * Redirect only exact matching request.
     */
    onlyModule?: boolean;
  }[]
    | { [index: string]: string | false | string[] };

  /**
   * Fields in the description file (usually package.json) which are used to redirect requests inside the module.
   */
  aliasFields?: (string | string[])[];

  /**
   * Extra resolve options per dependency category. Typical categories are "commonjs", "amd", "esm".
   */
  byDependency?: { [index: string]: ResolveOptionsWebpackOptions };

  /**
   * Enable caching of successfully resolved requests (cache entries are revalidated).
   */
  cache?: boolean;

  /**
   * Predicate function to decide which requests should be cached.
   */
  cachePredicate?: (request: ResolveRequest) => boolean;

  /**
   * Include the context information in the cache identifier when caching.
   */
  cacheWithContext?: boolean;

  /**
   * Condition names for exports field entry point.
   */
  conditionNames?: string[];

  /**
   * Filenames used to find a description file (like a package.json).
   */
  descriptionFiles?: string[];

  /**
   * Enforce the resolver to use one of the extensions from the extensions option (User must specify requests without extension).
   */
  enforceExtension?: boolean;

  /**
   * Field names from the description file (usually package.json) which are used to provide entry points of a package.
   */
  exportsFields?: string[];

  /**
   * An object which maps extension to extension aliases.
   */
  extensionAlias?: { [index: string]: string | string[] };

  /**
   * Extensions added to the request when trying to find the file.
   */
  extensions?: string[];

  /**
   * Redirect module requests when normal resolving fails.
   */
  fallback?:
    | {
    /**
     * New request.
     */
    alias: string | false | string[];
    /**
     * Request to be redirected.
     */
    name: string;
    /**
     * Redirect only exact matching request.
     */
    onlyModule?: boolean;
  }[]
    | { [index: string]: string | false | string[] };

  /**
   * Filesystem for the resolver.
   */
  fileSystem?: InputFileSystem;

  /**
   * Treats the request specified by the user as fully specified, meaning no extensions are added and the mainFiles in directories are not resolved (This doesn't affect requests from mainFields, aliasFields or aliases).
   */
  fullySpecified?: boolean;

  /**
   * Field names from the description file (usually package.json) which are used to provide internal request of a package (requests starting with # are considered as internal).
   */
  importsFields?: string[];

  /**
   * Field names from the description file (package.json) which are used to find the default entry point.
   */
  mainFields?: (string | string[])[];

  /**
   * Filenames used to find the default entry point if there is no description file or main field.
   */
  mainFiles?: string[];

  /**
   * Folder names or directory paths where to find modules.
   */
  modules?: string[];

  /**
   * Plugins for the resolver.
   */
  plugins?: (ResolvePluginInstance | '...')[];

  /**
   * Prefer to resolve server-relative URLs (starting with '/') as absolute paths before falling back to resolve in 'resolve.roots'.
   */
  preferAbsolute?: boolean;

  /**
   * Prefer to resolve module requests as relative request and fallback to resolving as module.
   */
  preferRelative?: boolean;

  /**
   * Custom resolver.
   */
  resolver?: Resolver;

  /**
   * A list of resolve restrictions. Resolve results must fulfill all of these restrictions to resolve successfully. Other resolve paths are taken when restrictions are not met.
   */
  restrictions?: (string | RegExp)[];

  /**
   * A list of directories in which requests that are server-relative URLs (starting with '/') are resolved.
   */
  roots?: string[];

  /**
   * Enable resolving symlinks to the original location.
   */
  symlinks?: boolean;

  /**
   * Enable caching of successfully resolved requests (cache entries are not revalidated).
   */
  unsafeCache?: boolean | { [index: string]: any };

  /**
   * Use synchronous filesystem calls for the resolver.
   */
  useSyncFileSystemCalls?: boolean;
}

/**
 * model option
 */
declare interface ModuleOptionsNormalized {
  /**
   * An array of rules applied by default for modules.
   */
  defaultRules?: (RuleSetRule | '...')[];

  /**
   * Specify options for each generator.
   */
  generator?: GeneratorOptionsByModuleType;

  /**
   * Don't parse files matching. It's matched against the full resolved request.
   */
  noParse?: string | Function | RegExp | (string | Function | RegExp)[];

  /**
   * Specify options for each parser.
   */
  parser?: ParserOptionsByModuleType;

  /**
   * An array of rules applied for modules.
   */
  rules?: (RuleSetRule | '...')[];

  /**
   * Cache the resolving of module requests.
   */
  unsafeCache?: boolean | Function;
}

declare interface RuleSetRule {
  /**
   * Match on import assertions of the dependency.
   */
  assert?: { [index: string]: RuleSetConditionOrConditions };

  /**
   * Match the child compiler name.
   */
  compiler?:
    | string
    | RegExp
    | ((value: string) => boolean)
    | RuleSetLogicalConditions
    | RuleSetCondition[];

  /**
   * Match dependency type.
   */
  dependency?:
    | string
    | RegExp
    | ((value: string) => boolean)
    | RuleSetLogicalConditions
    | RuleSetCondition[];

  /**
   * Match values of properties in the description file (usually package.json).
   */
  descriptionData?: { [index: string]: RuleSetConditionOrConditions };

  /**
   * Enforce this rule as pre or post step.
   */
  enforce?: 'pre' | 'post';

  /**
   * Shortcut for resource.exclude.
   */
  exclude?:
    | string
    | RegExp
    | ((value: string) => boolean)
    | RuleSetLogicalConditionsAbsolute
    | RuleSetConditionAbsolute[];

  /**
   * The options for the module generator.
   */
  generator?: { [index: string]: any };

  /**
   * Shortcut for resource.include.
   */
  include?:
    | string
    | RegExp
    | ((value: string) => boolean)
    | RuleSetLogicalConditionsAbsolute
    | RuleSetConditionAbsolute[];

  /**
   * Match the issuer of the module (The module pointing to this module).
   */
  issuer?:
    | string
    | RegExp
    | ((value: string) => boolean)
    | RuleSetLogicalConditionsAbsolute
    | RuleSetConditionAbsolute[];

  /**
   * Match layer of the issuer of this module (The module pointing to this module).
   */
  issuerLayer?:
    | string
    | RegExp
    | ((value: string) => boolean)
    | RuleSetLogicalConditions
    | RuleSetCondition[];

  /**
   * Specifies the layer in which the module should be placed in.
   */
  layer?: string;

  /**
   * Shortcut for use.loader.
   */
  loader?: string;

  /**
   * Match module mimetype when load from Data URI.
   */
  mimetype?:
    | string
    | RegExp
    | ((value: string) => boolean)
    | RuleSetLogicalConditions
    | RuleSetCondition[];

  /**
   * Only execute the first matching rule in this array.
   */
  oneOf?: RuleSetRule[];

  /**
   * Shortcut for use.options.
   */
  options?: string | { [index: string]: any };

  /**
   * Options for parsing.
   */
  parser?: { [index: string]: any };

  /**
   * Match the real resource path of the module.
   */
  realResource?:
    | string
    | RegExp
    | ((value: string) => boolean)
    | RuleSetLogicalConditionsAbsolute
    | RuleSetConditionAbsolute[];

  /**
   * Options for the resolver.
   */
  resolve?: ResolveOptionsWebpackOptions;

  /**
   * Match the resource path of the module.
   */
  resource?:
    | string
    | RegExp
    | ((value: string) => boolean)
    | RuleSetLogicalConditionsAbsolute
    | RuleSetConditionAbsolute[];

  /**
   * Match the resource fragment of the module.
   */
  resourceFragment?:
    | string
    | RegExp
    | ((value: string) => boolean)
    | RuleSetLogicalConditions
    | RuleSetCondition[];

  /**
   * Match the resource query of the module.
   */
  resourceQuery?:
    | string
    | RegExp
    | ((value: string) => boolean)
    | RuleSetLogicalConditions
    | RuleSetCondition[];

  /**
   * Match and execute these rules when this rule is matched.
   */
  rules?: RuleSetRule[];

  /**
   * Match module scheme.
   */
  scheme?:
    | string
    | RegExp
    | ((value: string) => boolean)
    | RuleSetLogicalConditions
    | RuleSetCondition[];

  /**
   * Flags a module as with or without side effects.
   */
  sideEffects?: boolean;

  /**
   * Shortcut for resource.test.
   */
  test?:
    | string
    | RegExp
    | ((value: string) => boolean)
    | RuleSetLogicalConditionsAbsolute
    | RuleSetConditionAbsolute[];

  /**
   * Module type to use for the module.
   */
  type?: string;

  /**
   * Modifiers applied to the module when rule is matched.
   */
  use?:
    | string
    | RuleSetUseItem[]
    | ((data: {
    resource: string;
    realResource: string;
    resourceQuery: string;
    issuer: string;
    compiler: string;
  }) => RuleSetUseItem[])
    | {
    /**
     * Unique loader options identifier.
     */
    ident?: string;
    /**
     * Loader name.
     */
    loader?: string;
    /**
     * Loader options.
     */
    options?: string | { [index: string]: any };
  }
    | ((data: object) =>
    | string
    | {
    /**
     * Unique loader options identifier.
     */
    ident?: string;
    /**
     * Loader name.
     */
    loader?: string;
    /**
     * Loader options.
     */
    options?: string | { [index: string]: any };
  }
    | __TypeWebpackOptions
    | RuleSetUseItem[]);
}

type RuleSetUseItem =
  | string
  | {
  /**
   * Unique loader options identifier.
   */
  ident?: string;
  /**
   * Loader name.
   */
  loader?: string;
  /**
   * Loader options.
   */
  options?: string | { [index: string]: any };
}
  | __TypeWebpackOptions;

type __TypeWebpackOptions = (data: object) =>
  | string
  | {
  /**
   * Unique loader options identifier.
   */
  ident?: string;
  /**
   * Loader name.
   */
  loader?: string;
  /**
   * Loader options.
   */
  options?: string | { [index: string]: any };
}
  | __TypeWebpackOptions
  | RuleSetUseItem[];

/**
 * output option
 */
declare interface OutputNormalized {
  /**
   * The filename of asset modules as relative path inside the 'output.path' directory.
   */
  assetModuleFilename?:
    | string
    | ((pathData: PathData, assetInfo?: AssetInfo) => string);

  /**
   * Enable/disable creating async chunks that are loaded on demand.
   */
  asyncChunks?: boolean;

  /**
   * Add charset attribute for script tag.
   */
  charset?: boolean;

  /**
   * Specifies the filename template of output files of non-initial chunks on disk. You must **not** specify an absolute path here, but the path may contain folders separated by '/'! The specified path is joined with the value of the 'output.path' option to determine the location on disk.
   */
  chunkFilename?:
    | string
    | ((pathData: PathData, assetInfo?: AssetInfo) => string);

  /**
   * The format of chunks (formats included by default are 'array-push' (web/WebWorker), 'commonjs' (node.js), 'module' (ESM), but others might be added by plugins).
   */
  chunkFormat?: string | false;

  /**
   * Number of milliseconds before chunk request expires.
   */
  chunkLoadTimeout?: number;

  /**
   * The method of loading chunks (methods included by default are 'jsonp' (web), 'import' (ESM), 'importScripts' (WebWorker), 'require' (sync node.js), 'async-node' (async node.js), but others might be added by plugins).
   */
  chunkLoading?: string | false;

  /**
   * The global variable used by webpack for loading of chunks.
   */
  chunkLoadingGlobal?: string;

  /**
   * Clean the output directory before emit.
   */
  clean?: boolean | CleanOptions;

  /**
   * Check if to be emitted file already exists and have the same content before writing to output filesystem.
   */
  compareBeforeEmit?: boolean;

  /**
   * This option enables cross-origin loading of chunks.
   */
  crossOriginLoading?: false | 'anonymous' | 'use-credentials';

  /**
   * Specifies the filename template of non-initial output css files on disk. You must **not** specify an absolute path here, but the path may contain folders separated by '/'! The specified path is joined with the value of the 'output.path' option to determine the location on disk.
   */
  cssChunkFilename?:
    | string
    | ((pathData: PathData, assetInfo?: AssetInfo) => string);

  /**
   * Specifies the filename template of output css files on disk. You must **not** specify an absolute path here, but the path may contain folders separated by '/'! The specified path is joined with the value of the 'output.path' option to determine the location on disk.
   */
  cssFilename?:
    | string
    | ((pathData: PathData, assetInfo?: AssetInfo) => string);

  /**
   * Similar to `output.devtoolModuleFilenameTemplate`, but used in the case of duplicate module identifiers.
   */
  devtoolFallbackModuleFilenameTemplate?: string | Function;

  /**
   * Filename template string of function for the sources array in a generated SourceMap.
   */
  devtoolModuleFilenameTemplate?: string | Function;

  /**
   * Module namespace to use when interpolating filename template string for the sources array in a generated SourceMap. Defaults to `output.library` if not set. It's useful for avoiding runtime collisions in sourcemaps from multiple webpack projects built as libraries.
   */
  devtoolNamespace?: string;

  /**
   * List of chunk loading types enabled for use by entry points.
   */
  enabledChunkLoadingTypes?: string[];

  /**
   * List of library types enabled for use by entry points.
   */
  enabledLibraryTypes?: string[];

  /**
   * List of wasm loading types enabled for use by entry points.
   */
  enabledWasmLoadingTypes?: string[];

  /**
   * The abilities of the environment where the webpack generated code should run.
   */
  environment?: Environment;

  /**
   * Specifies the filename of output files on disk. You must **not** specify an absolute path here, but the path may contain folders separated by '/'! The specified path is joined with the value of the 'output.path' option to determine the location on disk.
   */
  filename?: string | ((pathData: PathData, assetInfo?: AssetInfo) => string);

  /**
   * An expression which is used to address the global object/scope in runtime code.
   */
  globalObject?: string;

  /**
   * Digest type used for the hash.
   */
  hashDigest?: string;

  /**
   * Number of chars which are used for the hash.
   */
  hashDigestLength?: number;

  /**
   * Algorithm used for generation the hash (see node.js crypto package).
   */
  hashFunction?: string | typeof Hash;

  /**
   * Any string which is added to the hash to salt it.
   */
  hashSalt?: string;

  /**
   * The filename of the Hot Update Chunks. They are inside the output.path directory.
   */
  hotUpdateChunkFilename?: string;

  /**
   * The global variable used by webpack for loading of hot update chunks.
   */
  hotUpdateGlobal?: string;

  /**
   * The filename of the Hot Update Main File. It is inside the 'output.path' directory.
   */
  hotUpdateMainFilename?: string;

  /**
   * Wrap javascript code into IIFE's to avoid leaking into global scope.
   */
  iife?: boolean;

  /**
   * The name of the native import() function (can be exchanged for a polyfill).
   */
  importFunctionName?: string;

  /**
   * The name of the native import.meta object (can be exchanged for a polyfill).
   */
  importMetaName?: string;

  /**
   * Options for library.
   */
  library?: LibraryOptions;

  /**
   * Output javascript files as module source type.
   */
  module?: boolean;

  /**
   * The output directory as **absolute path** (required).
   */
  path?: string;

  /**
   * Include comments with information about the modules.
   */
  pathinfo?: boolean | 'verbose';

  /**
   * The 'publicPath' specifies the public URL address of the output files when referenced in a browser.
   */
  publicPath?: string | ((pathData: PathData, assetInfo?: AssetInfo) => string);

  /**
   * This option enables loading async chunks via a custom script type, such as script type="module".
   */
  scriptType?: false | 'module' | 'text/javascript';

  /**
   * The filename of the SourceMaps for the JavaScript files. They are inside the 'output.path' directory.
   */
  sourceMapFilename?: string;

  /**
   * Prefixes every line of the source in the bundle with this string.
   */
  sourcePrefix?: string;

  /**
   * Handles error in module loading correctly at a performance cost. This will handle module error compatible with the EcmaScript Modules spec.
   */
  strictModuleErrorHandling?: boolean;

  /**
   * Handles exceptions in module loading correctly at a performance cost (Deprecated). This will handle module error compatible with the Node.js CommonJS way.
   */
  strictModuleExceptionHandling?: boolean;

  /**
   * Use a Trusted Types policy to create urls for chunks.
   */
  trustedTypes?: TrustedTypes;

  /**
   * A unique name of the webpack build to avoid multiple webpack runtimes to conflict when using globals.
   */
  uniqueName?: string;

  /**
   * The method of loading WebAssembly Modules (methods included by default are 'fetch' (web/WebWorker), 'async-node' (node.js), but others might be added by plugins).
   */
  wasmLoading?: string | false;

  /**
   * The filename of WebAssembly modules as relative path inside the 'output.path' directory.
   */
  webassemblyModuleFilename?: string;

  /**
   * The method of loading chunks (methods included by default are 'jsonp' (web), 'import' (ESM), 'importScripts' (WebWorker), 'require' (sync node.js), 'async-node' (async node.js), but others might be added by plugins).
   */
  workerChunkLoading?: string | false;

  /**
   * The method of loading WebAssembly Modules (methods included by default are 'fetch' (web/WebWorker), 'async-node' (node.js), but others might be added by plugins).
   */
  workerWasmLoading?: string | false;
}

/**
 * externals option
 */
type Externals =
  | string
  | RegExp
  | ExternalItem[]
  | (ExternalItemObjectKnown & ExternalItemObjectUnknown)
  | ((
  data: ExternalItemFunctionData,
  callback: (
    err?: Error,
    result?: string | boolean | string[] | { [index: string]: any }
  ) => void
) => void)
  | ((data: ExternalItemFunctionData) => Promise<ExternalItemValue>);

type ExternalItem =
  | string
  | RegExp
  | (ExternalItemObjectKnown & ExternalItemObjectUnknown)
  | ((
  data: ExternalItemFunctionData,
  callback: (
    err?: Error,
    result?: string | boolean | string[] | { [index: string]: any }
  ) => void
) => void)
  | ((data: ExternalItemFunctionData) => Promise<ExternalItemValue>);

declare interface ExternalItemObjectKnown {
  /**
   * Specify externals depending on the layer.
   */
  byLayer?:
    | { [index: string]: ExternalItem }
    | ((layer: null | string) => ExternalItem);
}

declare interface ExternalItemObjectUnknown {
  [index: string]: ExternalItemValue;
}

type ExternalItemValue = string | boolean | string[] | { [index: string]: any };

declare interface ExternalItemFunctionData {
  /**
   * The directory in which the request is placed.
   */
  context?: string;

  /**
   * Contextual information.
   */
  contextInfo?: ModuleFactoryCreateDataContextInfo;

  /**
   * The category of the referencing dependencies.
   */
  dependencyType?: string;

  /**
   * Get a resolve function with the current resolver options.
   */
  getResolve?: (
    options?: ResolveOptionsWebpackOptions
  ) =>
    | ((
    context: string,
    request: string,
    callback: (err?: Error, result?: string) => void
  ) => void)
    | ((context: string, request: string) => Promise<string>);

  /**
   * The request as written by the user in the require/import expression/statement.
   */
  request?: string;
}

/**
 * infrastructureLogging option
 */
declare interface InfrastructureLogging {
  /**
   * Only appends lines to the output. Avoids updating existing output e. g. for status messages. This option is only used when no custom console is provided.
   */
  appendOnly?: boolean;

  /**
   * Enables/Disables colorful output. This option is only used when no custom console is provided.
   */
  colors?: boolean;

  /**
   * Custom console used for logging.
   */
  console?: Console;

  /**
   * Enable debug logging for specific loggers.
   */
  debug?:
    | string
    | boolean
    | RegExp
    | FilterItemTypes[]
    | ((value: string) => boolean);

  /**
   * Log level.
   */
  level?: "none" | "error" | "warn" | "info" | "log" | "verbose";

  /**
   * Stream used for logging output. Defaults to process.stderr. This option is only used when no custom console is provided.
   */
  stream?: NodeJS.WritableStream;
}

/**
 * Normalized webpack options object.
 */
declare interface WebpackOptionsNormalized {
  /**
   * Set the value of `require.amd` and `define.amd`. Or disable AMD support.
   */
  amd?: false | { [index: string]: any };

  /**
   * Report the first error as a hard error instead of tolerating it.
   */
  bail?: boolean;

  /**
   * Cache generated modules and chunks to improve performance for multiple incremental builds.
   */
  cache?: CacheOptionsNormalized;

  /**
   * The base directory (absolute path!) for resolving the `entry` option. If `output.pathinfo` is set, the included pathinfo is shortened to this directory.
   */
  context?: string;

  /**
   * References to other configurations to depend on.
   */
  dependencies?: string[];

  /**
   * Options for the webpack-dev-server.
   */
  devServer?: DevServer;

  /**
   * A developer tool to enhance debugging (false | eval | [inline-|hidden-|eval-][nosources-][cheap-[module-]]source-map).
   */
  devtool?: string | false;

  /**
   * The entry point(s) of the compilation.
   */
  entry?: EntryNormalized;

  /**
   * Enables/Disables experiments (experimental features with relax SemVer compatibility).
   */
  experiments?: ExperimentsNormalized;

  /**
   * Specify dependencies that shouldn't be resolved by webpack, but should become dependencies of the resulting bundle. The kind of the dependency depends on `output.libraryTarget`.
   */
  externals?: Externals;

  /**
   * Enable presets of externals for specific targets.
   */
  externalsPresets?: ExternalsPresets;

  /**
   * Specifies the default type of externals ('amd*', 'umd*', 'system' and 'jsonp' depend on output.libraryTarget set to the same value).
   */
  externalsType?:
    | 'import'
    | 'var'
    | 'module'
    | 'assign'
    | 'this'
    | 'window'
    | 'self'
    | 'global'
    | 'commonjs'
    | 'commonjs2'
    | 'commonjs-module'
    | 'commonjs-static'
    | 'amd'
    | 'amd-require'
    | 'umd'
    | 'umd2'
    | 'jsonp'
    | 'system'
    | 'promise'
    | 'script'
    | 'node-commonjs';

  /**
   * Ignore specific warnings.
   */
  ignoreWarnings?: ((
    warning: WebpackError,
    compilation: Compilation
  ) => boolean)[];

  /**
   * Options for infrastructure level logging.
   */
  infrastructureLogging?: InfrastructureLogging;

  /**
   * Custom values available in the loader context.
   */
  loader?: Loader;

  /**
   * Enable production optimizations or development hints.
   */
  mode?: 'none' | 'development' | 'production';

  /**
   * Options affecting the normal modules (`NormalModuleFactory`).
   */
  module?: ModuleOptionsNormalized;

  /**
   * Name of the configuration. Used when loading multiple configurations.
   */
  name?: string;

  /**
   * Include polyfills or mocks for various node stuff.
   */
  node?: NodeWebpackOptions;

  /**
   * Enables/Disables integrated optimizations.
   */
  optimization?: Optimization;

  /**
   * Normalized options affecting the output of the compilation. `output` options tell webpack how to write the compiled files to disk.
   */
  output?: OutputNormalized;

  /**
   * The number of parallel processed modules in the compilation.
   */
  parallelism?: number;

  /**
   * Configuration for web performance recommendations.
   */
  performance?: false | PerformanceOptions;

  /**
   * Add additional plugins to the compiler.
   */
  plugins?: (
    | ((this: Compiler, compiler: Compiler) => void)
    | WebpackPluginInstance
    )[];

  /**
   * Capture timing information for each module.
   */
  profile?: boolean;

  /**
   * Store compiler state to a json file.
   */
  recordsInputPath?: string | false;

  /**
   * Load compiler state from a json file.
   */
  recordsOutputPath?: string | false;

  /**
   * Options for the resolver.
   */
  resolve?: ResolveOptionsWebpackOptions;

  /**
   * Options for the resolver when resolving loaders.
   */
  resolveLoader?: ResolveOptionsWebpackOptions;

  /**
   * Options affecting how file system snapshots are created and validated.
   */
  snapshot?: SnapshotOptions;

  /**
   * Stats options object or preset name.
   */
  stats?: StatsValue;

  /**
   * Environment to build for. An array of environments to build for all of them when possible.
   */
  target?: string | false | string[];

  /**
   * Enter watch mode, which rebuilds on file change.
   */
  watch?: boolean;

  /**
   * Options for the watcher.
   */
  watchOptions?: WatchOptions;
}
