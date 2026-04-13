// Utility to preload cursors on page load
export const preloadCursors = async (): Promise<void> => {
  const cursorPaths = [
    '/src/lib/cursors/default/idle.svg',
    '/src/lib/cursors/default/pointer.svg',
    '/src/lib/cursors/default/text.svg',
    '/src/lib/cursors/dark/idle.svg',
    '/src/lib/cursors/dark/pointer.svg',
    '/src/lib/cursors/dark/text.svg',
    '/src/lib/cursors/rosemary/idle.svg',
    '/src/lib/cursors/rosemary/pointer.svg',
    '/src/lib/cursors/rosemary/text.svg',
    '/src/lib/cursors/blue-apron/idle.svg',
    '/src/lib/cursors/blue-apron/pointer.svg',
    '/src/lib/cursors/blue-apron/text.svg',
    '/src/lib/cursors/truffle/idle.svg',
    '/src/lib/cursors/truffle/pointer.svg',
    '/src/lib/cursors/truffle/text.svg',
    '/src/lib/cursors/saffron/idle.svg',
    '/src/lib/cursors/saffron/pointer.svg',
    '/src/lib/cursors/saffron/text.svg',
    '/src/lib/cursors/sage/idle.svg',
    '/src/lib/cursors/sage/pointer.svg',
    '/src/lib/cursors/sage/text.svg',
    '/src/lib/cursors/lavender/idle.svg',
    '/src/lib/cursors/lavender/pointer.svg',
    '/src/lib/cursors/lavender/text.svg',
  ];

  const imagePromises = cursorPaths.map(
    (path) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = path;
      })
  );

  await Promise.all(imagePromises);
};
