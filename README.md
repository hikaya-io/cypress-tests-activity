# Activty Cypress E2E Test

This repo contains [**Activity**](https://github.com/hikaya-io/activity) automated test cases written in [Cypress](https://www.cypress.io/).

## Setup

To setup the test env clone the repo and then install Cypress plus other node module using the below command.

```bash
$ npm install
```

## Running tests

The tests can be executed using the [Test Runner](https://www.cypress.io/features)
To starte the Test Runner runn the following command

```bash
$ npx cypress open
```

This command open Cypress and you can run a specific test or all the test.
To run the test headlessly run the follpwing command.

```bash
$ npx cypress run
```

**_NB_**: After the test complete a video recording of the test is generated in the `videos` directory

**Note**
The envirom variables file `cypress.env.json` has not been commited. You can create the following variable store in this file

```
{
    "un_qa_org": "",          # username for a user with django admin access
    "pw_qa_org": "",          # password for a user with django admin access
    "api_key_mailslurp": "",  # [Mailslurp](https://www.mailslurp.com/) api key
    "mailslurp_inbox": ""     # Mailslurp inbox id
}
```
