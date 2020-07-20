import { Tournament } from "../entity/Tournament";
import {
    Resolver,
    Mutation,
    Query,
    FieldResolver,
    Root,
    Arg,
    ID,
} from "type-graphql";
import { Player } from "../entity/Player";
import { Season } from "../entity/Season";

@Resolver(() => Season)
export class SeasonResolver {
    @Query(() => [Season])
    async seasons() {
        return Season.find({});
    }

    @Query(() => Season)
    async season(@Arg("id") id: number) {
        const season = await Season.findOne(id);
        if (!season) {
            throw new Error("Season not found");
        }

        return season;
    }

    @Mutation(() => Season)
    async createSeason(
        @Arg("participantIds", () => [ID]) participantIds: number[]
    ) {
        return await Season.createSeason(participantIds);
    }

    @Mutation(() => Season)
    async finishSeason(@Arg("id", () => ID) id: number) {
        const season = await Season.findOne(id);
        if (!season) {
            throw new Error("Season not found");
        }

        return await season.finish();
    }

    @FieldResolver()
    async players(@Root() parent: Season): Promise<Player[]> {
        return await parent.players;
    }

    @FieldResolver()
    async tournaments(@Root() parent: Season): Promise<Tournament[]> {
        return await parent.tournaments;
    }
}
