import "reflect-metadata";
import { ApolloServer } from "apollo-server";
import { createConnection } from "typeorm";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./resolvers/UserResolver";
import { PlayerResolver } from "./resolvers/PlayerResolver";
import { MatchResolver } from "./resolvers/MatchResolver";
import { PointResolver } from "./resolvers/PointResolver";
import { GameResolver } from "./resolvers/GameResolver";

const PORT = process.env.PORT || 7000;

const main = async () => {
    await createConnection();

    const schema = await buildSchema({
        resolvers: [
            UserResolver,
            PlayerResolver,
            MatchResolver,
            GameResolver,
            PointResolver,
        ],
    });

    const server = new ApolloServer({
        schema,
    });

    const { url } = await server.listen({ port: PORT });
    console.log(`Server is running. GraphQL Playground available at ${url}`);
};

main();
