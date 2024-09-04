export class ServiceLocator{
    private static services: Map<string,any> = new Map();

    static register<T>(name:string, service:T):void{
        this.services.set(name,service);
    }

    static get<T>(name:string):T{
        return this.services.get(name);
    }
}