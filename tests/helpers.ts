export function fetchJson(res: Response): Promise<unknown> {
  return res.json();
}

export function request(path: string, init?: RequestInit): Request {
  return new Request(`http://localhost${path}`, init);
}
