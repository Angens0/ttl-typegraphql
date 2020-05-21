import { Resolver, Query, InputType, Field, Mutation, Arg } from "type-graphql";
import { User } from "../entity/User";

@InputType()
class CreateUserInput {
    @Field()
    firstName: string;

    @Field()
    lastName: string;

    @Field()
    age: number;
}

@Resolver()
export class UserResolver {
    @Query(() => [User])
    users(): Promise<User[]> {
        return User.find();
    }

    @Mutation(() => User)
    async createUser(
        @Arg("data", () => CreateUserInput) data: CreateUserInput
    ): Promise<User> {
        const user = await User.create(data).save();
        return user;
    }
}
