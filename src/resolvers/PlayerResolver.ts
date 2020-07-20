import {
    Resolver,
    Query,
    Mutation,
    Arg,
    InputType,
    Field,
    ID,
    FieldResolver,
    Root,
} from "type-graphql";
import { Player } from "../entity/Player";
import { Match } from "../entity/Match";
import { Point } from "../entity/Point";
import { Game } from "../entity/Game";
import { Season } from "../entity/Season";

@InputType()
class CreatePlayerInput {
    @Field()
    firstName: string;

    @Field()
    lastName: string;

    @Field()
    birthDate: Date;
}

@Resolver(() => Player)
export class PlayerResolver {
    @Query(() => [Player])
    players(): Promise<Player[]> {
        return Player.find();
    }

    @Query(() => Player)
    player(@Arg("id", () => ID) id: number): Promise<Player> {
        return Player.findOne(id);
    }

    @Mutation(() => Player)
    createPlayer(@Arg("data") data: CreatePlayerInput): Promise<Player> {
        return Player.create(data).save();
    }

    @FieldResolver()
    async seasons(@Root() parent: Player): Promise<Season[]> {
        return await parent.seasons;
    }

    @FieldResolver()
    async matches(@Root() parent: Player): Promise<Match[]> {
        return await parent.matches;
    }

    @FieldResolver()
    async wonPoints(@Root() parent: Player): Promise<Point[]> {
        return await parent.wonPoints;
    }

    @FieldResolver()
    async lostPoints(@Root() parent: Player): Promise<Point[]> {
        return await parent.lostPoints;
    }

    @FieldResolver()
    async wonGames(@Root() parent: Player): Promise<Game[]> {
        return await parent.wonGames;
    }

    @FieldResolver()
    async lostGames(@Root() parent: Player): Promise<Game[]> {
        return await parent.lostGames;
    }

    @FieldResolver()
    async wonMatches(@Root() parent: Player): Promise<Match[]> {
        return await parent.wonMatches;
    }

    @FieldResolver()
    async lostMatches(@Root() parent: Player): Promise<Match[]> {
        return await parent.lostMatches;
    }
}
