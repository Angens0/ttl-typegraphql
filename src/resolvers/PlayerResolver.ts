import {
    Resolver,
    Query,
    Mutation,
    Arg,
    InputType,
    Field,
    ID,
} from "type-graphql";
import { Player } from "../entity/Player";

@InputType()
class CreatePlayerInput {
    @Field()
    firstName: string;

    @Field()
    lastName: string;

    @Field()
    birthDate: Date;
}

@Resolver()
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
}
