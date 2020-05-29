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

const MIN_POINTS_WIN_GAME = 11;
const MIN_POINTS_DIFF_WIN_GAME = 2;
const MATCH_BEST_OF = 5;

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

    @Field(() => Player, { nullable: true })
    @ManyToOne(() => Player)
    winner: Promise<Player>;

    @Field(() => Player, { nullable: true })
    @ManyToOne(() => Player)
    loser: Promise<Player>;

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

    async finish(
        winner: Player,
        loser: Player,
        isWalkover = false
    ): Promise<Match> {
        this.isFinished = true;
        this.isWalkover = isWalkover;
        this.winner = Promise.resolve(winner);
        this.loser = Promise.resolve(loser);

        return await this.save();
    }

    async addPoint(winner: Player): Promise<Point> {
        if (!this.isStarted) {
            throw new Error("The Match is not started");
        }

        if (this.isFinished) {
            throw new Error("The Match is finished");
        }

        const game = await this.getActiveGame();
        const players = await this.players;
        const loser = players.find(player => player.id !== winner.id);
        const point = await Point.createPoint(winner, loser, game);

        const gameScore = await game.getScore();
        const winnerScore = gameScore[winner.id];
        const loserScore = gameScore[loser.id];

        if (
            winnerScore >= MIN_POINTS_WIN_GAME &&
            winnerScore - loserScore >= MIN_POINTS_DIFF_WIN_GAME
        ) {
            await game.finish(winner, loser);

            const matchScore = await this.matchScore();
            const gamesToWinMatch = Math.ceil(MATCH_BEST_OF / 2);
            if (matchScore[winner.id] >= gamesToWinMatch) {
                this.finish(winner, loser);
                console.log("MATCH FINISHED!");
            } else {
                await Game.createGame(this);
                console.log("CREATING NEW GAME");
            }
        }

        console.log("Game score: ", gameScore);
        console.log("Match score: ", await this.matchScore());

        return point;
    }

    async matchScore(): Promise<{ [playerId: string]: number }> {
        const players = await this.players;
        const games = await this.games;
        const finishedGames = games.filter(game => game.isFinished);

        const score = {};
        score[players[0].id] = 0;
        score[players[1].id] = 0;

        for (let game of finishedGames) {
            const winner = await game.winner;
            if (!winner) {
                throw new Error("Game winner not found");
            }

            ++score[winner.id];
        }

        return score;
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
