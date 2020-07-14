import { Tournament } from "../entity/Tournament";
import { Resolver, Mutation, Query, FieldResolver, Root } from "type-graphql";
import { Player } from "../entity/Player";
import { Match } from "../entity/Match";

@Resolver(() => Tournament)
export class TournamentResolver {
    @Query(() => [Tournament])
    async tournaments(): Promise<Tournament[]> {
        return await Tournament.find();
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
