/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint-disable consistent-return */
const BaseBlueprintGenerator = require('../generator-base-blueprint');
const writeFiles = require('./files').writeFiles;
const constants = require('../generator-constants');
const { CYPRESS } = require('../../jdl/jhipster/test-framework-types');

let useBlueprints;

module.exports = class extends BaseBlueprintGenerator {
  constructor(args, opts) {
    super(args, opts, { unique: 'namespace' });

    if (this.options.help) {
      return;
    }

    useBlueprints = !this.fromBlueprint && this.instantiateBlueprints('cypress');
  }

  // Public API method used by the getter and also by Blueprints
  _initializing() {
    return {
      validateFromCli() {
        this.checkInvocationFromCLI();
      },
    };
  }

  get initializing() {
    if (useBlueprints) return;
    return this._initializing();
  }

  // Public API method used by the getter and also by Blueprints
  _loading() {
    return {
      loadSharedConfig() {
        this.loadAppConfig();
        this.loadClientConfig();
        this.loadServerConfig();
        this.loadTranslationConfig();
      },
    };
  }

  get loading() {
    if (useBlueprints) return;
    return this._loading();
  }

  // Public API method used by the getter and also by Blueprints
  _preparing() {
    return {
      prepareForTemplates() {
        this.BUILD_DIR = this.getBuildDirectoryForBuildTool(this.buildTool);
        this.CLIENT_DIST_DIR = this.getResourceBuildDirectoryForBuildTool(this.buildTool) + constants.CLIENT_DIST_DIR;
      },
    };
  }

  get preparing() {
    if (useBlueprints) return;
    return this._preparing();
  }

  // Public API method used by the getter and also by Blueprints
  _default() {
    return super._missingPreDefault();
  }

  get default() {
    if (useBlueprints) return;
    return this._default();
  }

  // Public API method used by the getter and also by Blueprints
  _writing() {
    return {
      cleanup() {
        if (this.isJhipsterVersionLessThan('7.0.0-beta.1') && this.jhipsterConfig.cypressTests) {
          this.removeFile(`${this.TEST_SRC_DIR}/cypress/support/keycloak-oauth2.ts`);
          this.removeFile(`${this.TEST_SRC_DIR}/cypress/fixtures/users/user.json`);
        }
      },
      ...writeFiles(),
      ...super._missingPostWriting(),
    };
  }

  get writing() {
    if (useBlueprints) return;
    return this._writing();
  }

  _askForCypressCoverage() {
    if (
      this.jhipsterConfig.clientFramework === constants.SUPPORTED_CLIENT_FRAMEWORKS.ANGULAR &&
      this.jhipsterConfig.testFrameworks.includes(CYPRESS)
    ) {
      return this.prompt({
        type: 'confirm',
        name: 'cypressCoverage',
        message: 'Would you like to generate code coverage for Cypress tests? [Experimental]',
        default: false,
      }).then(answers => {
        this.cypressCoverage = this.jhipsterConfig.cypressCoverage = answers.cypressCoverage;
        return undefined;
      });
    }
  }

  get prompting() {
    return {
      askForCypressCoverage: this._askForCypressCoverage,
    };
  }

  _postWriting() {
    return {
      configureCoverage() {
        if (!this.cypressCoverage) return;
        this.packageJson.merge({
          devDependencies: {
            'istanbul-instrumenter-loader': this.configOptions.dependabotPackageJson.devDependencies['istanbul-instrumenter-loader'],
            'cross-env': this.configOptions.dependabotPackageJson.devDependencies['cross-env'],
            '@cypress/code-coverage': this.configOptions.dependabotPackageJson.devDependencies['@cypress/code-coverage'],
          },
          scripts: {
            'start-instr': 'cross-env INSTRUMENT=true npm run webapp:dev',
            'e2e:cypress:coverage': `npx ts-node ${this.CLIENT_TEST_SRC_DIR}cypress/cypress_coverage -b chrome`,
          },
        });
      },
    };
  }

  get postWriting() {
    if (useBlueprints) return;
    return this._postWriting();
  }
};
