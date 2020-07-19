import { Resolver, Query, InputType, Field, Mutation, Arg } from "type-graphql";
import { User, UserRole } from "../entity/User";
import { hash } from "bcryptjs";

@InputType()
class CreateUserInput {
    @Field()
    name: string;

    @Field()
    password: string;

    @Field(() => UserRole, { defaultValue: UserRole.TABLE })
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
        const hashedPassword = await hash(data.password, 10);

        return await User.create({ ...data, password: hashedPassword }).save();
    }
}
