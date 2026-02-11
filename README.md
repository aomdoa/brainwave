# brainwave

Application that supports the capture and follow up on thoughts and ideas ensuring that they're followed up on and ideally completed properly.

## Structure

The current plan is break the project into two separate applications one focused on the REST service and data access with the interface separately provided.

## .env

| name | default | description                         |
| ---- | ------- | ----------------------------------- |
| PORT | 5005    | The port the service will listen on |

## Dependencies

### Production

| name    | why                                                                      |
| ------- | ------------------------------------------------------------------------ |
| cors    | Ensure security within the web application                               |
| dotenv  | Provide the consistent configuration setup to the service                |
| express | Consistent and expected setup for the REST                               |
| zod     | Provide support for processing .env with clear expected values and types |

### Development

| name       | why                                                                                                               |
| ---------- | ----------------------------------------------------------------------------------------------------------------- |
| typescript | Provides a cleaner method for the development of the service ensuring the API and UI are clearer                  |
| eslint     | Keep the code consistent in the form and setup and ensuring that I follow that properly throughout                |
| jest       | Validate what can be tested within the key methods and interactions to help protect edge cases and future updates |
| prettier   | Support the eslint with more focus on the layout and structure of the code                                        |
| cspell     | Find the typos to add a sparkle to the development                                                                |

### Development Environment

| name | why                                                                                    |
| ---- | -------------------------------------------------------------------------------------- |
| fpm  | Provide a method to package the project for deployment into multiple environment types |

## TODO

- WIP - update the configuration to use dotenv
- add the .service and port management for access
- update the routing to redirect based on url
- correct the rpm to properly create user for deployment
- initial simple data access
- REST for the idea
- create the simple ui for the access into the service
- add proper logging
- complete the README
