// GameStorage.ts
// 험블 객체 패턴 적용: 로컬 스토리지 접근을 캡슐화

export interface GameStorage<T> {
  load(): T | undefined;
  save(data: T): void;
  exists(): boolean;
  remove(): void;
}

export class GameLocalStorage<T> implements GameStorage<T> {
  constructor(private key: string) {}

  load(): T | undefined {
    try {
      const data = localStorage.getItem(this.key);
      if (!data) return undefined;
      return JSON.parse(data) as T;
    } catch {
      return undefined;
    }
  }

  save(data: T): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(data));
    } catch {
      // ignore
    }
  }

  exists(): boolean {
    return !!localStorage.getItem(this.key);
  }

  remove(): void {
    localStorage.removeItem(this.key);
  }
}
