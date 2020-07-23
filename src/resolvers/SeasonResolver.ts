import { Tournament } from "../entity/Tournament";
import {
    Resolver,
    Mutation,
    Query,
    FieldResolver,
    Root,
    Arg,
    ID,
    Authorized,
} from "type-graphql";
import { Season } from "../entity/Season";
import { SeasonPlayerScore } from "../entity/SeasonPlayerScore";
import { UserRole } from "../entity/User";

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

    @Authorized([UserRole.ADMIN])
    @Mutation(() => Season)
    async createSeason(
        @Arg("participantIds", () => [ID]) participantIds: number[]
    ) {
        return await Season.createSeason(participantIds);
    }

    @Authorized([UserRole.ADMIN])
    @Mutation(() => Season)
    async finishSeason(@Arg("id", () => ID) id: number) {
        const season = await Season.findOne(id);
        if (!season) {
            throw new Error("Season not found");
        }

        return await season.finish();
    }

    @FieldResolver()
    async seasonPlayerScores(
        @Root() parent: Season
    ): Promise<SeasonPlayerScore[]> {
        return await parent.seasonPlayerScores;
    }

    @FieldResolver()
    async tournaments(@Root() parent: Season): Promise<Tournament[]> {
        return await parent.tournaments;
    }
}
