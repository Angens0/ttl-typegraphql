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
    Authorized,
    Ctx,
} from "type-graphql";
import { Match } from "../entity/Match";
import { Player } from "../entity/Player";
import { Point } from "../entity/Point";
import { SubscriptionTopics } from "../enums/SubscriptionTopics";
import { MatchPlayerScore } from "../entity/MatchPlayerScore";
import { UserRole, User } from "../entity/User";
import { Context } from "vm";

@Resolver(() => Match)
export class MatchResolver {
    @Subscription({
        topics: SubscriptionTopics.MATCH_UPDATE,
    })
    matchUpdate(@Root() match: Match): Match {
        return match;
    }

    @Query(() => [Match])
    async matches(): Promise<Match[]> {
        return await Match.find();
    }

    @Query(() => [Match])
    async ongoingMatches(): Promise<Match[]> {
        return await Match.getOngoingMatches();
    }

    @Query(() => Match, { nullable: true })
    async match(@Arg("matchId", () => ID) matchId: number): Promise<Match> {
        return await Match.findOne(matchId);
    }

    @Authorized([UserRole.ADMIN, UserRole.TABLE])
    @Mutation(() => Match)
    async startMatch(
        @Arg("matchId", () => ID) matchId: number,
        @Ctx() ctx: Context,
        @PubSub() pubSub: PubSubEngine
    ): Promise<Match> {
        const match = await Match.findOne(matchId);
        if (!match) {
            throw new Error("Match not found");
        }

        const user = await User.findOne(ctx.user.id);
        await match.start(user);

        await pubSub.publish(SubscriptionTopics.MATCH_UPDATE, match);

        return match;
    }

    @Authorized([UserRole.TABLE])
    @Mutation(() => Point)
    async addPoint(
        @Arg("matchId", () => ID) matchId: number,
        @Arg("winnerId", () => ID) winnerId: number,
        @Ctx() ctx: Context,
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

        const user = await User.findOne(ctx.user.id);
        const point = await match.addPoint(winner, user);

        await pubSub.publish(SubscriptionTopics.MATCH_UPDATE, match);

        return point;
    }

    // @Mutation(() => Match)
    // async createMatch(
    //     @Arg("players", () => [ID]) data: string[],
    //     @PubSub() pubSub: PubSubEngine
    // ) {
    //     if (data.length !== 2) {
    //         throw new Error("2 Players are needed to create match");
    //     }

    //     const players: Player[] = [];
    //     for (let id of data) {
    //         const player = await Player.findOne(id);
    //         if (!player) {
    //             throw new Error("Player not found");
    //         }

    //         players.push(player);
    //     }

    //     const match = await Match.create({
    //         players: Promise.resolve(players),
    //     }).save();

    //     await pubSub.publish(SubscriptionTopics.MATCH_UPDATE, match);

    //     return match;
    // }

    @FieldResolver()
    async scores(@Root() parent: Match): Promise<MatchPlayerScore[]> {
        return await parent.scores;
    }

    @FieldResolver()
    async table(@Root() parent: Match): Promise<User> {
        return await parent.table;
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
