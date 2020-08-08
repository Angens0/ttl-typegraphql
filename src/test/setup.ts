import "reflect-metadata";
import { createConnection, getConnection } from "typeorm";

beforeAll(async () => {
    if (!process.env.JWT_KEY) {
        throw new Error("JWT_KEY is required!");
    }

    await createConnection({
        type: "postgres",
        host: process.env.TEST_DB_HOST,
        port: parseInt(process.env.TEST_DB_PORT),
        username: process.env.TEST_DB_USERNAME,
        password: process.env.TEST_DB_PASSWORD,
        database: process.env.TEST_DB_DATABASE,
        synchronize: true,
        logging: false,
        entities: ["src/entity/**/*.ts"],
        migrations: ["src/migration/**/*.ts"],
        subscribers: ["src/subscriber/**/*.ts"],
        cli: {
            entitiesDir: "src/entity",
            migrationsDir: "src/migration",
            subscribersDir: "src/subscriber",
        },
    });
});

afterAll(async () => {
    await getConnection().close();
});
