import * as dotenv from 'dotenv';
dotenv.config();

interface Config {
    mongoURI: string;
}

const config: Config = {
    mongoURI: `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@localhost:27017/${process.env.MONGO_INITDB_DATABASE}?authSource=admin`
};

export default config; 