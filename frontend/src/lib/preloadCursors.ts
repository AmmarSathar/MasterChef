// Utility to preload cursors on page load
export const preloadCursors = async (): Promise<void> => {
  const cursorPaths = [
    '/assets/cursors/default/idle.svg',
    '/assets/cursors/default/pointer.svg',
    '/assets/cursors/default/text.svg',
    '/assets/cursors/dark/idle.svg',
    '/assets/cursors/dark/pointer.svg',
    '/assets/cursors/dark/text.svg',
    '/assets/cursors/rosemary/idle.svg',
    '/assets/cursors/rosemary/pointer.svg',
    '/assets/cursors/rosemary/text.svg',
    '/assets/cursors/blue-apron/idle.svg',
    '/assets/cursors/blue-apron/pointer.svg',
    '/assets/cursors/blue-apron/text.svg',
    '/assets/cursors/truffle/idle.svg',
    '/assets/cursors/truffle/pointer.svg',
    '/assets/cursors/truffle/text.svg',
    '/assets/cursors/saffron/idle.svg',
    '/assets/cursors/saffron/pointer.svg',
    '/assets/cursors/saffron/text.svg',
    '/assets/cursors/sage/idle.svg',
    '/assets/cursors/sage/pointer.svg',
    '/assets/cursors/sage/text.svg',
    '/assets/cursors/lavender/idle.svg',
    '/assets/cursors/lavender/pointer.svg',
    '/assets/cursors/lavender/text.svg',
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
