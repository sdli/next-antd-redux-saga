function isServer() {
  return typeof window === 'undefined' || typeof document === 'undefined';
}

export default isServer;
