export class Environment {
  private static instance: Environment | null = null;
  private _apiUrl = 'http://localhost:8080/api/v1/';

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
