import {
    ID,
    Mutation,
    Arg,
    Resolver,
    Query,
    FieldResolver,
    Root,
    PubSub,
    PubSubEngine,
    Subscription,
} from "type-graphql";
import { Match } from "../entity/Match";
import { Player } from "../entity/Player";
import { Point } from "../entity/Point";

@Resolver(() => Match)
export class MatchResolver {
    @Subscription({
        topics: "MATCHES",
    })
    matchUpdate(@Root() match: Match): Match {
        return match;
    }

    @Query(() => [Match])
    async matches(): Promise<Match[]> {
        return await Match.find();
    }

    @Mutation(() => Match)
    async startMatch(
        @Arg("matchId", () => ID) matchId: number,
        @PubSub() pubSub: PubSubEngine
    ): Promise<Match> {
        const match = await Match.findOne(matchId);
        if (!match) {
            throw new Error("Match not found");
        }

        await match.start();

        await pubSub.publish("MATCHES", match);

        return match;
    }

    @Mutation(() => Point)
    async addPoint(
        @Arg("matchId", () => ID) matchId: number,
        @Arg("winnerId", () => ID) winnerId: number,
        @PubSub() pubSub: PubSubEngine
    ): Promise<Point> {
        winnerId = Number(winnerId);
        const match = await Match.findOne(matchId);
        if (!match) {
            throw new Error("Match not found");
        }

        const matchPlayers = await match.players;

        const winner = matchPlayers.find(player => player.id === winnerId);
        if (!winner) {
            throw new Error("Player not found");
        }

        const point = await match.addPoint(winner);

        await pubSub.publish("MATCHES", match);

        return point;
    }

    @Mutation(() => Match)
    async createMatch(
        @Arg("players", () => [ID]) data: string[],
        @PubSub() pubSub: PubSubEngine
    ) {
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

        await pubSub.publish("MATCHES", match);

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
