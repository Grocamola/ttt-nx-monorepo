import { getJestProjectsAsync } from '@nx/jest';

export default async () => ({
  projects: await getJestProjectsAsync(),
  maxWorkers: 2,
  testTimeout: 30000,
});
