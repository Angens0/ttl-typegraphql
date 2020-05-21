import "reflect-metadata";
import { ApolloServer } from "apollo-server";
import { createConnection } from "typeorm";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./resolvers/UserResolver";

const PORT = process.env.PORT || 7000;

const main = async () => {
    await createConnection();

    const schema = await buildSchema({
        resolvers: [UserResolver],
    });

    const server = new ApolloServer({
        schema,
    });

    const { url } = await server.listen({ port: PORT });
    console.log(`Server is running. GraphQL Playground available at ${url}`);
};

main();
