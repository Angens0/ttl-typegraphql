import { ObjectType, Field, ID } from "type-graphql";
import {
    Entity,
    PrimaryGeneratedColumn,
    BaseEntity,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToMany,
    JoinTable,
    Column,
} from "typeorm";
import { Player } from "./Player";
import { Match } from "./Match";

@ObjectType()
@Entity()
export class Tournament extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column({ default: true })
    isStarted: boolean;

    @Field()
    @Column({ default: false })
    isFinished: boolean;

    @Field(() => [Player])
    @ManyToMany(() => Player, player => player.tournaments)
    @JoinTable()
    players: Promise<Player[]>;

    @Field(() => [Match])
    @OneToMany(() => Match, match => match.tournament)
    matches: Promise<Match[]>;

    @Field()
    @CreateDateColumn()
    createdAt: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt: Date;

    static async createTournament(): Promise<Tournament> {
        const players = await Player.find();

        const tournament = await Tournament.create({}).save();
        tournament.players = Promise.resolve(players);
        await tournament.save();

        const playerPairs = Tournament.getAllPlayerPairs(players);

        const matchPromises = playerPairs.map(pair =>
            Match.createMatch(pair, tournament)
        );
        await Promise.all(matchPromises);

        return tournament;
    }

    static getAllPlayerPairs(players: Player[]): [Player, Player][] {
        const pairs: [Player, Player][] = [];

        for (let i = 0; i < players.length - 1; i++) {
            for (let j = i + 1; j < players.length; j++) {
                pairs.push([players[i], players[j]]);
            }
        }

        return pairs;
    }

    async finish(): Promise<Tournament> {
        this.isFinished = true;

        return await this.save();
    }

    async submitFinishedMatch() {
        const matches = await this.matches;
        if (matches.every(match => match.isFinished)) {
            await this.finish();
        }
    }
}
