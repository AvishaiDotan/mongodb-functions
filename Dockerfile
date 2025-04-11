# Use the official MongoDB image
FROM mongo:latest

# Set environment variables
ENV MONGO_INITDB_ROOT_USERNAME=admin
ENV MONGO_INITDB_ROOT_PASSWORD=password
ENV MONGO_INITDB_DATABASE=app


# Expose MongoDB port
EXPOSE 27017

# Create a directory for MongoDB data
VOLUME /data/db

# Command to run MongoDB with data directory
CMD ["mongod", "--dbpath", "/data/db"]
