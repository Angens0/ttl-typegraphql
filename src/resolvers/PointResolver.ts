import {
    Resolver,
    FieldResolver,
    Root,
    Mutation,
    Arg,
    ID,
    Query,
} from "type-graphql";
import { Point } from "../entity/Point";
import { Player } from "../entity/Player";
import { Game } from "../entity/Game";

@Resolver(() => Point)
export class PointResolver {
    @Query(() => Point)
    async point(@Arg("id", () => ID) id: number): Promise<Point> {
        return await Point.findOne(id);
    }

    @Mutation(() => Point)
    async createPoint(
        @Arg("winner", () => ID) winnerId: number,
        @Arg("loser", () => ID) loserId: number,
        @Arg("game", () => ID) gameId: number
    ): Promise<Point> {
        const winner = await Player.findOne(winnerId);
        const loser = await Player.findOne(loserId);
        if (!winner && !loser) {
            throw new Error("Player not found");
        }
        const game = await Game.findOne(gameId);
        if (!game) {
            throw new Error("Game not found");
        }

        const point = new Point();
        point.winner = Promise.resolve(winner);
        point.loser = Promise.resolve(loser);
        point.game = Promise.resolve(game);

        return await point.save();
    }

    @FieldResolver(() => Player)
    async winner(@Root() parent: Point): Promise<Player> {
        return await parent.winner;
    }

    @FieldResolver(() => Player)
    async loser(@Root() parent: Point): Promise<Player> {
        return await parent.loser;
    }

    @FieldResolver(() => Game)
    async game(@Root() parent: Point): Promise<Game> {
        return await parent.game;
    }
}
