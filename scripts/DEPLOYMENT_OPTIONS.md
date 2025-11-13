# Docker Deployment Options

This project provides multiple Docker deployment scripts for different scenarios:

## Available Scripts

### 1. `docker-up.bash` - Initial Deployment

- **Purpose**: Full initial deployment of all services
- **Effect**: Builds and starts MongoDB, SocketIO, and the main app
- **Database**: Creates and initializes database with seed data
- **Use when**: First time setup or when you want a completely fresh start

### 2. `docker-redeploy.bash` - Redeploy App Only (Recommended for Development)

- **Purpose**: Redeploy application with latest code while preserving database
- **Effect**: Rebuilds and restarts only the app and socketio containers
- **Database**: **PRESERVED** - MongoDB container and data volume remain untouched
- **Use when**: You have code changes and want to deploy them without losing database data

### 3. `docker-down.bash` - Stop Services

- **Purpose**: Stop all services temporarily
- **Effect**: Stops containers but keeps volumes intact
- **Database**: **PRESERVED** - Data remains in volumes
- **Use when**: You want to stop services temporarily and restart later

### 4. `docker-cleanup.bash` - Full Cleanup

- **Purpose**: Complete cleanup including data removal
- **Effect**: Stops containers, removes containers, networks, and **VOLUMES**
- **Database**: **DELETED** - All data is removed
- **Use when**: You want to start completely fresh (testing, debugging issues)

## Workflow Recommendations

### Development Workflow

1. **Initial setup**: `./scripts/docker-up.bash`
2. **Make code changes**
3. **Redeploy**: `./scripts/docker-redeploy.bash` (preserves database)
4. **Repeat steps 2-3** as needed

### When to Use Full Cleanup

- Testing database initialization
- Debugging database-related issues
- Starting with completely fresh data
- Before switching to production mode

## Database Persistence

The MongoDB data is stored in a named Docker volume: `mongo-eproc-{username}-data`

- This volume persists between container restarts
- `docker-redeploy.bash` and `docker-down.bash` preserve this volume
- Only `docker-cleanup.bash` removes this volume

## Quick Reference

| Command                | Purpose        | Database      | Use Case       |
| ---------------------- | -------------- | ------------- | -------------- |
| `docker-up.bash`       | Initial deploy | Created       | First setup    |
| `docker-redeploy.bash` | Update app     | **Preserved** | Development    |
| `docker-down.bash`     | Stop services  | Preserved     | Temporary stop |
| `docker-cleanup.bash`  | Full cleanup   | **Deleted**   | Fresh start    |
