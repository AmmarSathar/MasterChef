// Utility to preload cursors on page load
export const preloadCursors = async (): Promise<void> => {
  const cursorPaths = [
    // Light mode cursors
    '/src/lib/cursors/default/idle.svg',
    '/src/lib/cursors/default/pointer.svg',
    '/src/lib/cursors/default/text.svg',
    // Dark mode cursors
    '/src/lib/cursors/dark/idle.svg',
    '/src/lib/cursors/dark/pointer.svg',
    '/src/lib/cursors/dark/text.svg',
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
