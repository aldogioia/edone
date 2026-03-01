export class Environment {
  private static instance: Environment | null = null;
  private _apiUrl = 'http://192.168.1.10:8080/api/v1/';

  private constructor() {}

  public static getInstance(): Environment {
    if (!Environment.instance) {
      Environment.instance = new Environment();
    }
    return Environment.instance;
  }

  get apiUrl(): string {
    return this._apiUrl;
  }
}
