import {
    Resolver,
    Query,
    Arg,
    ID,
    Mutation,
    FieldResolver,
    Root,
} from "type-graphql";
import { Game } from "../entity/Game";
import { Match } from "../entity/Match";
import { Point } from "../entity/Point";

@Resolver(() => Game)
export class GameResolver {
    @Query(() => Game)
    async query(@Arg("id", () => ID) id: number): Promise<Game> {
        return await Game.findOne(id);
    }

    @Mutation(() => Game)
    async createGame(@Arg("match", () => ID) matchId: number): Promise<Game> {
        return await Game.create({ match: { id: matchId } }).save();
    }

    @FieldResolver(() => Match)
    async match(@Root() parent: Game): Promise<Match> {
        return (await Game.findOne(parent.id, { relations: ["match"] })).match;
    }

    @FieldResolver(() => [Point])
    async points(@Root() parent: Game): Promise<Point[]> {
        return (await Game.findOne(parent.id, { relations: ["points"] }))
            .points;
    }
}
