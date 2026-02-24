# brainwave

Application that supports the capture and follow up on thoughts and ideas ensuring that they're followed up on and ideally completed properly.

## Structure

Contains two prjects (packages/backend and packages/frontend) to provide the full solution and deployment. The backend focus will provide the API for access and operations on the data with the frontend providing the proper user interface that supports web and mobile access.

### Verdaccio

To help support the build and usage of the @brainwave/shared I recommend using verdaccio to provide a simple local repo to help test local development changes. Simply install it globally and follow their https://www.verdaccio.org/ instructions for the setup.

## Backend

The backend is deployed with only exposure for the API portion of the service which is used by the UI for proper, safe and secure data access and changes.

### Configuration (.env)

Example can be found in packages/backend/config/brainwave.env

| name                | default                     | description                                                                             |
| ------------------- | --------------------------- | --------------------------------------------------------------------------------------- |
| PORT                | 5005                        | The port the service will listen on                                                     |
| LOG_LEVEL           | info                        | The level of logging to share for storage (error, info, debug)                          |
| NODE_ENV            | production                  | Specify the current mode the service is being used in. Either production or development |
| DATABASE_URL        | file:/opt/brainwave/prod.db | The service/location to use for the data storage                                        |
| PASSWORD_MIN_LENGTH | 12                          | The minimum length of passwords for the users                                           |

### Dependencies

#### Production

| name                   | why                                                                      |
| ---------------------- | ------------------------------------------------------------------------ |
| bcryptjs               | Provides the crypt services needed for password management               |
| better-sqlite3/sqlite3 | Current method for storing data and deployment help                      |
| cors                   | Ensure security within the web application                               |
| dotenv                 | Provide the consistent configuration setup to the service                |
| express                | Consistent and expected setup for the REST                               |
| jsonwebtoken           | Provides the security services to ensure access it managed               |
| ms                     | Support for the jsonwebtoken timing                                      |
| pino/pino-pretty       | Provide consistent logging format and structure                          |
| zod                    | Provide support for processing .env with clear expected values and types |

#### Development

| name                          | why                                                                                                               |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| @types/\*                     | Provide the type descriptions for the dependencies                                                                |
| cspell                        | Find the typos to add a sparkle to the development                                                                |
| eslint/eslint-config-prettier | Keep the code consistent in the form and setup and ensuring that I follow that properly throughout                |
| jest                          | Validate what can be tested within the key methods and interactions to help protect edge cases and future updates |
| prettier                      | Support the eslint with more focus on the layout and structure of the code                                        |
| rimraf                        | OS independent tidying during the builds and releases                                                             |
| typescript/ts\*               | Provides a cleaner method for the development of the service ensuring the API and UI are clearer                  |

#### Development Environment

| name | why                                                                                    |
| ---- | -------------------------------------------------------------------------------------- |
| fpm  | Provide a method to package the project for deployment into multiple environment types |

## Frontend

Use the features of vue and vite to provide a clean mobile friendly application that users can register into and provide their brainwaves for management and notifications.

### Configuration

TODO

### Dependencies

#### Production

| name  | why                                                                              |
| ----- | -------------------------------------------------------------------------------- |
| axios | Provides the integration to the REST backend                                     |
| vue   | Provides the full solution for the application development, deployment and usage |

#### Development

| name       | why                                                                  |
| ---------- | -------------------------------------------------------------------- |
| @types/\*  | All the types needed for the validation and development support      |
| rimraf     | OS independent tidying during the builds and releases                |
| typescript | Provides a cleaner method for the development of the user experience |
| vite       | Provides the build infrastructure for the application                |

#### Development Environment
