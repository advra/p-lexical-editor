# Eproc

## Notes

Eproc is a .... It is developed using nvm lts version `v20.19.5`.

## I. Getting Started

Make sure you are on the correct nodejs version for this build. Run the following:

```
nvm install v20.19.5
nvm use v20.19.5

# Note the use option will not persist when opening a new terminal session.
# You must run nvm use or run the following to set a default
nvm default v20.19.5
```

## II. First Time Setup

After cloning this application install the packages:

```
npm install
```

### a. Running locally

You can run a local application using a mocked json database located in the data directory. To run this configuration run the following:

### Running Against Mongo Instance Locally

A. EProc App
Spin up your own docker container instance. By default it will create a docker container named `mongo-puck-{USER}`
First Copy the test configs and run you app then run the docker

```bash
cp .env.local.example .env.local

./scripts/docker-up.bash

# For the first time running the docker instance there will be no data. To seed the database with users and data
# run the script below
cd seeder
npm install
node seed-users.js
```

### III. Seeded Data

User and seeded data can be found in the /seeder/seed-users.js. Below is a table of pre-seeded users:

```
const rawUsers = [
  { username: 'admin', password: 'Admin123!', roles: ['admin'] },
  { username: 'user', password: 'User123!', roles: ['operator'] },
  { username: 'viewer', password: 'Viewer123!', roles: ['viewer'] },
];
```

### IV. Troubleshooting

a. package install issues

If you run into any issues try to manually clear the nextjs cache and any installed packages:

```
rm -rf .next node_modules package-lock.json

# Then try running the app again from II. First Time Setup
```

b. Empty database

If you go into mongo and see it is not seeded you can manually seed it running this script. This will run the seeder container which would seed the mongodb container on first startup. If this fails you can manually seed the data.

```bash
NODE_ENV=development node seeder/seed-users.js
```

### V. Cleanup

You can permanently clear your local deploy running the following script.

```bash
./scripts/docker-cleanup.bash
```
