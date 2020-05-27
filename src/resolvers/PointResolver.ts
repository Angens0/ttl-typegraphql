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
        return await Point.create({
            winner: { id: winnerId },
            loser: { id: loserId },
            game: { id: gameId },
        }).save();
    }

    @FieldResolver(() => Player)
    async winner(@Root() parent: Point): Promise<Player> {
        return (await Point.findOne(parent.id, { relations: ["winner"] }))
            .winner;
    }

    @FieldResolver(() => Player)
    async loser(@Root() parent: Point): Promise<Player> {
        return (await Point.findOne(parent.id, { relations: ["loser"] })).loser;
    }

    @FieldResolver(() => Game)
    async game(@Root() parent: Point): Promise<Game> {
        return (await Point.findOne(parent.id, { relations: ["game"] })).game;
    }
}
