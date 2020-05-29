import {
    ID,
    Mutation,
    Arg,
    Resolver,
    Query,
    FieldResolver,
    Root,
} from "type-graphql";
import { Match } from "../entity/Match";
import { Player } from "../entity/Player";
import { Point } from "../entity/Point";

@Resolver(() => Match)
export class MatchResolver {
    @Query(() => [Match])
    async matches(): Promise<Match[]> {
        return await Match.find();
    }

    @Mutation(() => Match)
    async startMatch(
        @Arg("matchId", () => ID) matchId: number
    ): Promise<Match> {
        const match = await Match.findOne(matchId);
        if (!match) {
            throw new Error("Match not found");
        }

        return await match.start();
    }

    @Mutation(() => Point)
    async addPoint(
        @Arg("matchId", () => ID) matchId: number,
        @Arg("winnerId", () => ID) winnerId: number
    ): Promise<Point> {
        const match = await Match.findOne(matchId);
        if (!match) {
            throw new Error("Match not found");
        }

        const winner = await Player.findOne(winnerId);
        if (!winner) {
            throw new Error("Player not found");
        }

        return await match.addPoint(winner);
    }

    @Mutation(() => Match)
    async createMatch(@Arg("players", () => [ID]) data: string[]) {
        if (data.length !== 2) {
            throw new Error("2 Players are needed to create match");
        }

        const players: Player[] = [];
        for (let id of data) {
            const player = await Player.findOne(id);
            if (!player) {
                throw new Error("Player not found");
            }

            players.push(player);
        }

        const match = await Match.create({
            players: Promise.resolve(players),
        }).save();

        return match;
    }

    @FieldResolver()
    async players(@Root() parent: Match): Promise<Player[]> {
        return await parent.players;
    }

    @FieldResolver({ nullable: true })
    async winner(@Root() parent: Match): Promise<Player> {
        return await parent.winner;
    }

    @FieldResolver({ nullable: true })
    async loser(@Root() parent: Match): Promise<Player> {
        return await parent.loser;
    }
}
