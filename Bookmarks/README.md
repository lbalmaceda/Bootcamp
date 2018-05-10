# scalability-lab05: Bookmarks System

Authors: @lbalmaceda @nicogarcia


## Setup
Create a file `.env` with the required environment variables. You can use `.env.local` as the starting point.

To create the required databased use the following commands:

```
CREATE DATABASE bookmarks;
CREATE ROLE bmuser WITH LOGIN PASSWORD 'password1'; 
GRANT ALL PRIVILEGES ON DATABASE bookmarks TO bmuser;
```

Alternatively, the above steps can be performed in the AWS dashboard when creating a new RDS instance.

Then run the following command to populate the DB with the required tables: 

```sh
export DATABASE_URL=postgres://user@database.com:5432/name && npm run migrate 
```

## Usage

### Add entries to the Database

Make sure the API server is running first:

```sh
node server.js
# OR
npm run start
```

Then make a new POST request to `SERVER_URL:PORT/api/bookmarks` passing a new bookmark with at least `url` and `name`.

```sh
curl -X POST \
  http://SERVER_URL:PORT/api/bookmarks \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json' \
  -H 'Postman-Token: d5d8830c-4438-4f39-9405-52dc6e3739b4' \
  -d '{
	"url":"https://google.com",
	"name":"google"
  }'
```


### Add items to the Queue

Items are added to the queue using the `scheduler` script. Each call would add all the existing database entries as new queue messages. Run it:

```sh
node lib/scheduler/scheduler.js
# OR
npm run start:task
```

> The script should be scheduled using a CRON like syntax so it checks periodically the database and adds the new items.

### Consume items from the Queue

Items are consumed as soon as added to the queue if a `worker` instance is running. Run it:

```sh
node lib/worker/worker.js
# OR
npm run start:worker
```

## TODO:

- [x] Add link checking logic to the worker.
- [ ] Add `CRON` sample command to the readme
- [ ] Improve the `API.listAll()` method to query sorting by "last updated" first or add a new method that does this, so it can be called from the scheduler.
- [ ] Notify the user when a link stops responding.