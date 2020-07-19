import {
    Resolver,
    Query,
    InputType,
    Field,
    Mutation,
    Arg,
    Authorized,
} from "type-graphql";
import { User, UserRole } from "../entity/User";
import { hash, compare } from "bcryptjs";
import { sign } from "jsonwebtoken";

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
    @Authorized([UserRole.ADMIN, UserRole.TABLE])
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

    @Mutation(() => String, { nullable: true })
    async signIn(
        @Arg("login", () => String) login: string,
        @Arg("password", () => String) password: string
    ): Promise<String> {
        const user = await User.findOne({ name: login });
        if (!user) {
            throw new Error("Invalid login or password");
        }

        const isPasswordValid = await compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error("Invalid login or password");
        }

        const token = sign(
            {
                id: user.id,
                login: user.name,
                role: user.role,
            },
            process.env.JWT_KEY
        );

        return token;
    }
}
