# ChainGraph Authentication Service

ChainGraph API Key authentication service

## Yarn

```
# Install nodemon typescript for dev
yarn --ignore-optional global add ts-node-dev typescript

# Install project dependencies
yarn install

# Development server with reload
yarn dev

```

## Docker

```
# Build the image
docker build -t chaingraph_auth .

# Start a container
docker run -p 3000:3000 -d chaingraph_auth

# Get container ID
docker ps

# Print app output
docker logs <container id>
```

## Contributing

Read the [contributing guidelines](https://docs.chaingraph.io/contributing) for details.
