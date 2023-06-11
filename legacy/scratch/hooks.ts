/**

export type Metadata = Record<string, unknown>;


export abstract class BaseTask<
  TInput extends ZodTypeAny = ZodTypeAny,
  TOutput extends ZodTypeAny = ZodTypeAny
> {

// ...

  private _preHooks: ((input?: types.ParsedData<TInput>) => void | Promise<void>, metadata: types.Metadata)[] = [];
  private _postHooks: ((result: types.ParsedData<TOutput>, metadata: types.Metadata) => void | Promise<void>)[] = [];


  public registerPreHook(hook: (input?: types.ParsedData<TInput>) => void | Promise<void>): this {
    this._preHooks.push(hook);
    return this;
  }

  public registerPostHook(hook: (result: types.ParsedData<TOutput>) => void | Promise<void>): this {
    this._postHooks.push(hook);
    return this;
  }

public async callWithMetadata(
    input?: types.ParsedData<TInput>,
    options: { dryRun?: boolean } = {}
  ): Promise<{result: types.ParsedData<TOutput> | undefined, metadata: types.Metadata}> {
    const metadata: types.Metadata = {};

    if (options.dryRun) {
      return console.log( '// TODO: implement' )
    }

    for (const hook of this._preHooks) {
      await hook(input);
    }

    const result = await this._call(input);

    for (const hook of this._postHooks) {
      await hook(result, metadata);
    }

    return {result, metadata};
  }
}

**/
