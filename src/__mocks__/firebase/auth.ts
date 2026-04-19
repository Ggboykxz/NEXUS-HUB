export const auth = {
  onAuthStateChanged: (callback: any) => {
    (auth as any).onAuthStateChangedCallback = callback;
    return () => {};
  },
};
