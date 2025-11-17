# Socket server

This service runs to provide presence and live redline events

# To Build and Re-deploy container

Note: User is your localhost username like `alnonzoa`

```bash
# stop container
docker stop socket-eproc-taro
docker rm socket-eproc-taro
# rebuild
cd src/server/socketio && docker build -t socket-eproc .
cd /to/project/root
# redeploy to the network
# Or optionally target it to run in a specific docker network. to determine run:
# docker network ls
docker run -d --name socket-eproc-taro -p 5772:5772 socket-eproc

docker logs socket-eproc-taro
```
