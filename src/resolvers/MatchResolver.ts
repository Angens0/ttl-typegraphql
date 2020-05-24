import { ID, Mutation, Arg, Resolver } from "type-graphql";
import { Match } from "../entity/Match";
import { Player } from "../entity/Player";

@Resolver()
export class MatchResolver {
    @Mutation(() => Match)
    async createMatch(@Arg("players", () => [ID]) data: string[]) {
        if (data.length !== 2) {
            throw new Error("2 Players are needed to create match");
        }

        const players: Player[] = [];
        for (let id of data) {
            const player = await Player.findOne(id);
            if (!player) {
                throw new Error("Player not found");
            }

            players.push(player);
        }

        const match = await Match.create({
            players,
        }).save();

        return match;
    }
}
