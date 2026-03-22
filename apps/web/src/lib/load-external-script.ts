const scriptCache = new Map<string, Promise<void>>();

export function loadExternalScript(src: string) {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Scripts can only be loaded in the browser.'));
  }

  const existingScript = document.querySelector(`script[src="${src}"]`) as
    | HTMLScriptElement
    | null;

  if (existingScript?.dataset.loaded === 'true') {
    return Promise.resolve();
  }

  const cachedPromise = scriptCache.get(src);

  if (cachedPromise) {
    return cachedPromise;
  }

  const promise = new Promise<void>((resolve, reject) => {
    const script = existingScript ?? document.createElement('script');

    script.src = src;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = () => {
      scriptCache.delete(src);
      reject(new Error(`Failed to load ${src}`));
    };

    if (!existingScript) {
      document.head.appendChild(script);
    }
  });

  scriptCache.set(src, promise);
  return promise;
}
