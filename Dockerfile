FROM mongo:latest

# Create directory for MongoDB data
RUN mkdir -p /data/db

# Expose MongoDB port
EXPOSE 27017

# Set environment variables
ENV MONGO_INITDB_ROOT_USERNAME=${MONGO_INITDB_ROOT_USERNAME}
ENV MONGO_INITDB_ROOT_PASSWORD=${MONGO_INITDB_ROOT_PASSWORD}
ENV MONGO_INITDB_DATABASE=${MONGO_INITDB_DATABASE}

# Create volume for data persistence
VOLUME /data/db

# Start MongoDB
CMD ["mongod"] 