import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany,
    BaseEntity,
    OneToMany,
    ManyToOne,
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { Player } from "./Player";
import { Game } from "./Game";
import { Tournament } from "./Tournament";

@ObjectType()
@Entity()
export class Match extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column({ default: false })
    isStarted: boolean;

    @Field()
    @Column({ default: false })
    isFinished: boolean;

    @Field()
    @Column({ default: false })
    isWalkover: boolean;

    @Field(() => [Tournament])
    @ManyToOne(() => Tournament, tournament => tournament.matches)
    tournament: Promise<Tournament>;

    @Field(() => [Player])
    @ManyToMany(() => Player, player => player.matches)
    players: Promise<Player[]>;

    @Field(() => [Game])
    @OneToMany(() => Game, game => game.match)
    games: Promise<Game[]>;

    static async createMatch(
        players: [Player, Player],
        tournament: Tournament
    ): Promise<Match> {
        const match = await Match.create({}).save();
        match.players = Promise.resolve(players);
        match.tournament = Promise.resolve(tournament);

        return await match.save();
    }

    async start(): Promise<Match> {
        this.isStarted = true;
        await Game.createGame(this);
        await this.save();

        return this;
    }
}
