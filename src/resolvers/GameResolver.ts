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
        const match = await Match.findOne(matchId);
        if (!match) {
            throw new Error("Match not found");
        }

        const game = new Game();
        game.match = Promise.resolve(match);

        return await game.save();
    }

    @FieldResolver(() => Match)
    async match(@Root() parent: Game): Promise<Match> {
        return await parent.match;
    }

    @FieldResolver(() => [Point])
    async points(@Root() parent: Game): Promise<Point[]> {
        return await parent.points;
    }
}
