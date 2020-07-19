import { AuthChecker } from "type-graphql";
import { User } from "../entity/User";

export const customAuthChecker: AuthChecker<{ user: User }> = (
    { context },
    roles
) => {
    if (!context.user) {
        return false;
    }

    return roles.includes(context.user.role);
};
