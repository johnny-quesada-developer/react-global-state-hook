/**
* @param {StateSetter<IState>} setter - add a new value to the state
* @returns {Promise<void>} result - resolves when update_batches finished
*/
export type StateSetter<IState> = (
  setter: Partial<IState> | ((state: IState) => Partial<IState>)
) => Promise<void>;

/**
* This is the structure required by the API actions in order to be able to capture action parameters and inject state setter into actions.
*/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IAction<IState> = <IResult>(...params: any[]) => (setter: StateSetter<IState>, currentState: IState) => Promise<unknown> | IResult;

/**
* Configuration of you API
*/
export interface IActionCollection<IState> {
  [key: string]: IAction<IState>;
}

/**
* This is the API result of the hook (if you passed an API as a parameter)
*/
export type ActionCollectionResult<IActions> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key in keyof IActions]: <IResult>(...params: any[]) => any | IResult;
};

/**
* Hook result, if you passed an API as a parameter it will be returned in the second position of the hook invoke.
*/
export type IHookResult<
  IState,
  IActions extends IActionCollection<IState> | null = null,
  IApi extends ActionCollectionResult<IActions> | null = IActions extends null ? null : ActionCollectionResult<IActions>
> = IApi extends null
  ? StateSetter<IState>
  : IActions extends IActionCollection<IState>
  ? IApi extends ActionCollectionResult<IActions>
    ? IApi
    : StateSetter<IState>
  : StateSetter<IState>;

/**
* This is a class to create global-store objects
* @template IState
* @param {IState} state - Initial state,
* @template IActions
* @param {IActions} actions - An specific api to restrict the use of the state,
* this will disable the default return of the state-setter of the hook, and instead will return the API
* @param {string} persistStoreAs - A name if you want to persist the state of the store in localstorage
* */
export interface IGlobalState<
  IState, IActions extends IActionCollection<IState> | null = null
> {
  /**
  * Returns a global hook that will share information across components by subscribing them to a specific store.
  * @return [currentState, GlobalState.IHookResult<IState, IActions, IApi>]
  */
  getHook: <IApi extends IActions extends ActionCollectionResult<IActions> ? ActionCollectionResult<IActions> : null>() => () => [
    IState,
    IHookResult<IState, IActions, IApi>,
  ];

  /**
  * This is an access to the subscribers queue and to the current state of a specific store...
  * THIS IS NOT A REACT-HOOK, so you could use it everywhere example other hooks, and services.
  * @return [currentState, GlobalState.IHookResult<IState, IActions, IApi>]
  */
  getHookDecoupled: <IApi extends IActions extends ActionCollectionResult<IActions> ? ActionCollectionResult<IActions> : null>() => () => [
    () => IState,
    IHookResult<IState, IActions, IApi>,
  ];
}
