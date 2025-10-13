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

## II. Deployment

Puck can be deployed to your local machine or to a targeted remote machine depending on the environment and intended purpose.

### a. Run Local Stack (Development)

You can run a local application using a mocked json database located in the data directory. To run this configuration run the following:

First Copy the test configs and install the packages

```bash
cp .env.local.example .env.local

npm install
```

Now spin up the EProc stack. By default it will create the Eproc App, Mongo and Socketio containers tagged with your user such as `mongo-puck-{USER}`

```bash
# make scripts executable
chmod 755 ./scripts/*

# run the stack
./scripts/docker-up.bash

# For the first time running the docker instance will ingest user data. To seed the database manually or reset default users with default passwords, you can run the script below:
# cd seeder
# npm install
# node seed-users.js
```

### b. Deploy Stack on a SB1 Machine (Test/Production)

For services to run correctly on a remote machine you need define the ip address.

1. ssh into the machine you want to deploy. This example I will use `sbvws02`

```bash
ssh 10.69.82.122

# if you are already connected to a machine and dont now the ipaddress check it with the following command:
ip -br -a
lo               UNKNOWN        127.0.0.1/8
ens192           UP             10.69.82.122/23
docker0          DOWN           172.17.0.1/16
virbr0           DOWN           192.168.122.1/24
```

In this case I am currently logged into `sbvws02` which is on `10.69.82.122`. Update envrionment variables and deploy the stack pointing to that ip address (ensure ports are the same as shown below)

```bash
export NEXT_PUBLIC_BASE_URL=http://10.69.82.122:5770
export NEXT_PUBLIC_SOCKET_BASE_URL=http://10.69.82.122
export NEXT_PUBLIC_SOCKET_PORT=5772
./scripts/docker-up.bash
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
