# brainwave

Application that supports the capture and follow up on thoughts and ideas ensuring that they're followed up on and ideally completed properly.

## Structure

Contains three projects (packages/shared, packages/backend and packages/frontend) to provide the full solution and deployment.

The shared portion simply provides the input/output support for the validation of the data. The inputs simply try and provide expected values that will be transformed depending on the configuration
being used. The output is guarenteed to have the expected data in the format required.

The backend focus will provide the API for access and operations on the data with the frontend providing the proper user interface that supports web and mobile access.

### Verdaccio

To help support the build and usage of the @brainwave/shared I recommend using verdaccio to provide a simple local repo to help test local development changes. Simply install it globally and follow their https://www.verdaccio.org/ instructions for the setup.

### Production Services

- https://console.kamatera.com/servers (server)
- https://www.namespro.ca/MyAccount.asp (DNS and email)
- https://console.cloud.google.com/auth/overview (google auth)

## Backend

The backend is deployed with only exposure for the API portion of the service which is used by the UI for proper, safe and secure data access and changes. For full details access ./src/utils/config.ts
for the full description and variables

### Dependencies

#### Production

| name                   | why                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| @brainwave/shared      | The data validation library for brainwave                                                   |
| bcryptjs               | Provides the crypt services needed for password management                                  |
| better-sqlite3/sqlite3 | Current method for storing data and deployment help                                         |
| cors                   | Ensure security within the web application                                                  |
| dotenv                 | Provide the consistent configuration setup to the service                                   |
| express                | Consistent and expected setup for the REST                                                  |
| jsonwebtoken           | Provides the security services to ensure access it managed                                  |
| ms                     | Support for the jsonwebtoken timing                                                         |
| node-cron              | Provides the configuration management and execution for scheduled (notification) activities |
| nodemailer             | Support library to help setup and send emails                                               |
| passport               | Provide third party authentication and user management (google)                             |
| pino/pino-pretty       | Provide consistent logging format and structure                                             |
| prisma                 | Provides the data management for the application without tying to a specific sql db         |
| swagger                | Give access to the endpoint apis for review, understanding and testing                      |
| zod                    | Provide support for processing .env with clear expected values and types                    |

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

VITE_API_URL=https://brainwave.aomdoa.ca/api
VITE_LOG_LEVEL=info

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
