import "@testing-library/jest-dom";

if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
  value: () => ({
    getExtension: () => null,
    clearRect: () => {},
    fillRect: () => {},
    putImageData: () => {},
    drawImage: () => {},
    createImageData: () => ({}),
    getImageData: () => ({ data: [] }),
    measureText: () => ({ width: 0 }),
    setTransform: () => {},
    resetTransform: () => {},
    scale: () => {},
    rotate: () => {},
    translate: () => {},
    transform: () => {},
    save: () => {},
    restore: () => {},
    beginPath: () => {},
    closePath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    stroke: () => {},
    fill: () => {},
    rect: () => {},
    clip: () => {},
    arc: () => {},
    fillText: () => {},
    strokeText: () => {},
  }),
});

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
