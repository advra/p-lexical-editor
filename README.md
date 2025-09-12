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
```bash
cp .env.local.example .env.local 
npm run dev
```

### b. Running against Mongo
TBD

### III. Troubleshooting
If you run into any issues try to manually clear the nextjs cache and any installed packages: 
```
rm -rf .next node_modules package-lock.json

# Then try running the app again from II. First Time Setup
```
