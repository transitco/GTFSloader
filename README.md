
# GTFSloader

Tool to upload and download GTFS files with a MongoDB database

## Endpoints

* Import GTFS from a zipfile to the database

```bash
curl --request POST \
  --url http://localhost:3000/import_gtfs
```

* Download GTFS from the database as a zipfile

```bash
* curl --request GET \
  --url http://localhost:3000/export_gtfs
```

## Contribute

You are welcome to contribute either directly via GitHub Pull Request or via Gerrit:
<https://review.gerrithub.io/q/project:transitco/GTFSloader+status:open>

Intial setup to use Gerrit:
```pip install git-review```

Create a change:

1. ```git checkout -b BRANCH_NAME```
2. Modify your files
3. ```git add .```
4. ```git commit -m "MESSAGE"```
5. **```git review```**

Modify an existing change:

1. **```git review -d CHANGE_ID```**
2. Modify your files
3. ```git add .```
4. **```git commit --amend```**
5. **```git review```**
