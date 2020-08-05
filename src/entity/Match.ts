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
import { MatchPlayerScore } from "./MatchPlayerScore";
import { randomInt } from "../utils/randomInt";
import { User } from "./User";
import { EntityState } from "../enums/EntityState";

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
    @Column({ default: EntityState.NOT_STARTED })
    state: EntityState;

    @Field()
    @Column({ default: false })
    isWalkover: boolean;

    @Field(() => [MatchPlayerScore])
    @OneToMany(
        () => MatchPlayerScore,
        matchPlayerScore => matchPlayerScore.match
    )
    scores: Promise<MatchPlayerScore[]>;

    @Field(() => User, { nullable: true })
    @ManyToOne(() => User, user => user.matches)
    table: Promise<User>;

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

        const switchSides = !!randomInt(0, 1);
        if (switchSides) {
            [players[0], players[1]] = [players[1], players[0]];
        }

        match.players = Promise.resolve(players);
        match.tournament = Promise.resolve(tournament);

        const toServe = randomInt(0, 1);

        for (let i = 0; i < players.length; i++) {
            const mps = new MatchPlayerScore();
            mps.isServing = i === toServe;
            mps.player = Promise.resolve(players[i]);
            mps.match = Promise.resolve(match);
            await mps.save();
        }

        return await match.save();
    }

    async start(table: User): Promise<Match> {
        if (this.state !== EntityState.NOT_STARTED) {
            throw new Error("Match already started");
        }

        if (!table.isTable()) {
            throw new Error("Table not found");
        }

        this.state = EntityState.ONGOING;
        this.table = Promise.resolve(table);
        await Game.createGame(this);
        await this.save();

        return this;
    }

    async finish(
        winner: Player,
        loser: Player,
        isWalkover = false
    ): Promise<Match> {
        this.state = EntityState.FINISHED;
        this.isWalkover = isWalkover;
        this.winner = Promise.resolve(winner);
        this.loser = Promise.resolve(loser);

        await this.save();

        const tournament = await this.tournament;
        await tournament.submitFinishedMatch();

        return this;
    }

    async addPoint(winner: Player, table: User): Promise<Point> {
        if (this.state !== EntityState.ONGOING) {
            throw new Error("The Match is not started");
        }

        if (table.id !== (await this.table).id) {
            throw new Error("Wrong table");
        }

        const game = await this.getActiveGame();
        const players = await this.players;
        const loser = players.find(player => player.id !== winner.id);

        let winnerScore: MatchPlayerScore;
        let loserScore: MatchPlayerScore;
        const scores = await this.scores;

        for (const score of scores) {
            (await score.player).id === winner.id
                ? (winnerScore = score)
                : (loserScore = score);
        }

        const point = await Point.createPoint(
            winnerScore.isServing ? winner : loser,
            winner,
            loser,
            game
        );
        winnerScore.pointWonCount++;
        await winnerScore.save();

        // finish game if conditions are met
        if (
            winnerScore.pointWonCount >= MIN_POINTS_WIN_GAME &&
            winnerScore.pointWonCount - loserScore.pointWonCount >=
                MIN_POINTS_DIFF_WIN_GAME
        ) {
            await game.finish(winner, loser);
            winnerScore.gameWonCount++;
            await winnerScore.save();

            // finish match if conditions are met, create new game otherwise
            const gamesToWinMatch = Math.ceil(MATCH_BEST_OF / 2);
            if (winnerScore.gameWonCount >= gamesToWinMatch) {
                this.finish(winner, loser);
            } else {
                winnerScore.pointWonCount = 0;
                await winnerScore.save();
                loserScore.pointWonCount = 0;
                await loserScore.save();
                await Game.createGame(this);

                // service when new game starts
                const prevGamePoints = await game.points;
                const prevPointZeroService = await prevGamePoints[0].service;
                for (const score of scores) {
                    score.isServing =
                        (await score.player).id !== prevPointZeroService.id;
                    await score.save();
                }
            }
        } else {
            // service when game continues
            const sumOfPoints =
                winnerScore.pointWonCount + loserScore.pointWonCount;
            if (sumOfPoints > 20 || sumOfPoints % 2 === 0) {
                // switch service
                for (const score of scores) {
                    score.isServing = !score.isServing;
                    await score.save();
                }
            }
        }

        console.log(
            `${winner.firstName} ${winner.lastName} ${winnerScore.gameWonCount} | ${winnerScore.pointWonCount} : ${loserScore.pointWonCount} | ${loserScore.gameWonCount} ${loser.firstName} ${loser.lastName}`
        );

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
