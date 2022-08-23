import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { execa } from 'execa';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const vue2Packages = {
  vue: '^2.7.8',
  vite: '^2.5.1',
  'vue-template-compiler': '^2.7.8',
  'vite-plugin-vue2': '^2.0.2',
  '@vitejs/plugin-vue2-jsx': '^1.0.3'
};

const vue3Packages = {
  vue: '^3.2.37',
  vite: '^3.0.0',
  '@vitejs/plugin-vue': '^3.0.0',
  '@vitejs/plugin-vue-jsx': '^2.0.0'
};

const vue2DevDependeciesDifferences = [
  'vue',
  'vite',
  'vue-template-compiler',
  'vite-plugin-vue2',
  '@vitejs/plugin-vue2-jsx'
];

const vue3DevDependeciesDifferences = [
  'vue',
  'vite',
  '@vitejs/plugin-vue',
  '@vitejs/plugin-vue-jsx'
];

// Package file read.
const packageSource = resolve(__dirname, '../package.json');

const packageFile = readFileSync(packageSource);

const packageData = JSON.parse(packageFile.toString());

/**
 * Switch between dependencies based on Vue version.
 *
 * @param {string} version - Vue version.
 * @param {string} fromPackages -  List of packages to change from.
 * @param {string} toPackages - List of packages to change to.
 */
async function switchVersionDependencies(version, fromPackages, toPackages) {
  for (const dep of vue2DevDependeciesDifferences) {
    if (version === 3 && dep in packageData.devDependencies) {
      delete packageData.devDependencies[dep];
    }
  }

  for (const dep of vue3DevDependeciesDifferences) {
    if (version === 2 && dep in packageData.devDependencies) {
      delete packageData.devDependencies[dep];
    }
  }

  Object.keys(fromPackages).forEach(
    (key) => delete packageData.dependencies[key]
  );

  Object.assign(packageData.dependencies, toPackages);

  const packageString = JSON.stringify(packageData, null, 2);
  writeFileSync(packageSource, packageString, +'\n');

  await execa('pnpm', ['install', '--no-fronzen-lockfile'], {
    stdio: 'inherit'
  });
  await execa('pnpm', ['vue-demi-fix'], { stdio: 'inherit' });

  console.log(
    `Switched vue dependencies from ${fromPackages} to ${toPackages}`
  );
}

/**
 * Switch between devDependencies based on Vue version.
 *
 * @param {string} version - Vue version.
 * @param {string} fromPackages -  List of packages to change from.
 * @param {string} toPackages - List of packages to change to.
 */
async function switchVersionDevDependencies(version, fromPackages, toPackages) {
  for (const dep of vue2DevDependeciesDifferences) {
    if (version === 3 && dep in packageData.devDependencies) {
      delete packageData.devDependencies[dep];
    }
  }

  for (const dep of vue3DevDependeciesDifferences) {
    if (version === 2 && dep in packageData.devDependencies) {
      delete packageData.devDependencies[dep];
    }
  }

  Object.keys(fromPackages).forEach(
    (key) => delete packageData.devDependencies[key]
  );

  Object.assign(packageData.devDependencies, toPackages);

  const packageString = JSON.stringify(packageData, null, 2);
  writeFileSync(packageSource, packageString + '\n');

  await execa('rm', ['-rf', 'node_modules/', 'pnpm-lock.yaml'], {
    stdio: 'inherit'
  });
  await execa('pnpm', ['i', '--no-frozen-lockfile'], {
    stdio: 'inherit'
  });
  await execa('pnpm', ['vue-demi-fix'], { stdio: 'inherit' });
}

/**
 * Provides Vue version to switch depenedencies to.
 *
 * @param {string} version - Vue version.
 * @returns {Promise} an empty promise when execution commands have been completed.
 */
async function useVueVersions(version) {
  if (version === 3) {
    await switchVersionDevDependencies(version, vue2Packages, vue3Packages);
  } else if (version === 2) {
    await switchVersionDevDependencies(version, vue3Packages, vue2Packages);
  }
}

const version = Number(process.argv[2]) || 3;

useVueVersions(version);
