import { Tournament } from "../entity/Tournament";
import {
    Resolver,
    Mutation,
    Query,
    FieldResolver,
    Root,
    Arg,
    Int,
    Subscription,
    PubSub,
    PubSubEngine,
} from "type-graphql";
import { Player } from "../entity/Player";
import { Match } from "../entity/Match";
import { OrderOptions } from "../enums/OrderOptions";

@Resolver(() => Tournament)
export class TournamentResolver {
    @Subscription({
        topics: "TOURNAMENTS",
    })
    tournamentStart(@Root() tournament: Tournament): Tournament {
        return tournament;
    }

    @Query(() => [Tournament])
    async tournaments(
        @Arg("take", () => Int, { defaultValue: 10 })
        take: number,
        @Arg("skip", () => Int, { defaultValue: 0 })
        skip: number,
        @Arg("order", () => OrderOptions, {
            defaultValue: OrderOptions.DESC,
        })
        order: OrderOptions
    ): Promise<Tournament[]> {
        return await Tournament.find({
            order: {
                id: order,
            },
            skip,
            take,
        });
    }

    @Query(() => Tournament, { nullable: true })
    async activeTournament(): Promise<Tournament> | null {
        return await Tournament.getActiveTournament();
    }

    @Mutation(() => Tournament)
    async createTournament(@PubSub() pubSub: PubSubEngine) {
        const tournament = await Tournament.createTournament();

        await pubSub.publish("TOURNAMENTS", tournament);

        return tournament;
    }

    @FieldResolver()
    async players(@Root() parent: Tournament): Promise<Player[]> {
        return await parent.players;
    }

    @FieldResolver()
    async matches(@Root() parent: Tournament): Promise<Match[]> {
        return await parent.matches;
    }
}
