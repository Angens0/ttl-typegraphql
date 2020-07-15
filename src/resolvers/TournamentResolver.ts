import { Tournament } from "../entity/Tournament";
import {
    Resolver,
    Mutation,
    Query,
    FieldResolver,
    Root,
    Arg,
    Int,
} from "type-graphql";
import { Player } from "../entity/Player";
import { Match } from "../entity/Match";
import { OrderOptions } from "../enums/OrderOptions";

@Resolver(() => Tournament)
export class TournamentResolver {
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
    async createTournament() {
        return await Tournament.createTournament();
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
