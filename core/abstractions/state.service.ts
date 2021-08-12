export abstract class StateService {
    get: <T>(key: string) => Promise<T>;
    save: (key: string, obj: any) => Promise<any>;
    remove: (key: string) => Promise<any>;
    purge: () => Promise<any>;
}
