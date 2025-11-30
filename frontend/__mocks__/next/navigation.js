const useRouter = () => ({
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
  back: jest.fn(),
  forward: jest.fn(),
  reload: jest.fn(),
});
const usePathname = () => '/';
const useSearchParams = () => ({ get: jest.fn() });

module.exports = {
  useRouter,
  usePathname,
  useSearchParams,
  __esModule: true,
  default: { useRouter, usePathname, useSearchParams },
};
