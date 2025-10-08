# Data

This is a dedicated folder for server only access

Find procs:

```
docker exec mongo-eproc-taro mongosh eproc -u r00t -p r00t --authenticationDatabase admin --eval "db.procs.find({}, {title: 1, slug: 1, owner: 1, _id: 0}).pretty()"
```

import proc:

```
docker exec -i mongo-eproc-taro \
  mongoimport \
  --db eproc \
  --collection procs \
  -u r00t -p r00t --authenticationDatabase admin \
  --jsonArray \
  --drop \
  < ./data/exampleproc.json
```
