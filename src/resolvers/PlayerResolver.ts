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
    async matches(@Root() { id }: Player): Promise<Match[]> {
        return (
            await Player.findOne(id, {
                relations: ["matches"],
            })
        ).matches;
    }
}
