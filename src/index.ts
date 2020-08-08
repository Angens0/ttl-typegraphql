import "reflect-metadata";
import { EventEmitter } from "events";
import { ApolloServer } from "apollo-server-express";
import * as http from "http";
import * as express from "express";
import * as expressJwt from "express-jwt";
import { verify } from "jsonwebtoken";
import { createConnection } from "typeorm";
import { buildSchema, registerEnumType } from "type-graphql";
import { UserResolver } from "./resolvers/UserResolver";
import { PlayerResolver } from "./resolvers/PlayerResolver";
import { MatchResolver } from "./resolvers/MatchResolver";
import { PointResolver } from "./resolvers/PointResolver";
import { GameResolver } from "./resolvers/GameResolver";
import { TournamentResolver } from "./resolvers/TournamentResolver";
import { OrderOptions } from "./enums/OrderOptions";
import { UserRole, User } from "./entity/User";
import { customAuthChecker } from "./auth/customAuthChecker";
import { EntityState } from "./enums/EntityState";
import { SeasonResolver } from "./resolvers/SeasonResolver";

// TODO: test (react + apolllo DEV(?))
// https://stackoverflow.com/questions/8313628/node-js-request-how-to-emitter-setmaxlisteners
EventEmitter.defaultMaxListeners = 100;

const PORT = process.env.PORT || 7000;

const main = async () => {
    if (!process.env.JWT_KEY) {
        throw new Error("JWT_KEY is required!");
    }

    await createConnection({
        type: "postgres",
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
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

    const app = express();
    app.use(
        express.json(),
        expressJwt({
            secret: process.env.JWT_KEY,
            algorithms: ["HS256"],
            credentialsRequired: false,
        })
    );

    registerEnumType(OrderOptions, {
        name: "OrderOptions",
    });

    registerEnumType(UserRole, {
        name: "UserRole",
    });

    registerEnumType(EntityState, {
        name: "EntityState",
    });

    const schema = await buildSchema({
        resolvers: [
            UserResolver,
            PlayerResolver,
            MatchResolver,
            GameResolver,
            PointResolver,
            TournamentResolver,
            SeasonResolver,
        ],
        authChecker: customAuthChecker,
    });

    const apolloServer = new ApolloServer({
        schema,
        context: ({ req, connection }) => {
            if (req?.user) {
                return { user: req.user };
            }

            if (connection?.context?.accessToken) {
                const { accessToken } = connection.context;
                const decodedToken = verify(
                    accessToken,
                    process.env.JWT_KEY
                ) as User;
                return { userId: decodedToken.id };
            }

            return {};
        },
    });

    apolloServer.applyMiddleware({ app, path: "/graphql" });
    const httpServer = http.createServer(app);
    apolloServer.installSubscriptionHandlers(httpServer);

    httpServer.listen(PORT, () => {
        console.log(`Server is running on port: ${PORT}`);
    });
};

main();
