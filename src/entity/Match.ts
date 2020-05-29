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
import { Point } from "./Point";

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

    async addPoint(winner: Player): Promise<Point> {
        if (!this.isStarted) {
            throw new Error("The Match is not started");
        }

        if (this.isFinished) {
            throw new Error("The Match is finished");
        }

        const game = await this.getActiveGame();
        const loser = (await this.players).find(
            player => player.id !== winner.id
        );

        return await Point.createPoint(winner, loser, game);
    }

    async getActiveGame(): Promise<Game> {
        const games = await this.games;
        const activeGame = games.find(game => !game.isFinished);
        if (!activeGame) {
            throw new Error("Game not found");
        }

        return activeGame;
    }
}
