import { Resolver, Query, InputType, Field, Mutation, Arg } from "type-graphql";
import { User, UserRole } from "../entity/User";

@InputType()
class CreateUserInput {
    @Field()
    name: string;

    @Field()
    password: string;

    @Field()
    role: UserRole;
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
        return await User.create(data).save();
    }
}
