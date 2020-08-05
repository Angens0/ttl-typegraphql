import { ObjectType, Field, ID } from "type-graphql";
import {
    Entity,
    PrimaryGeneratedColumn,
    BaseEntity,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    Column,
    ManyToOne,
} from "typeorm";
import { Player } from "./Player";
import { Match } from "./Match";
import { Season } from "./Season";
import { seasonScorePerPlace } from "../utils/seasonScorePerPlace";
import { EntityState } from "../enums/EntityState";

type ScoreResult = {
    player: Player;
    score: number;
};

@ObjectType()
@Entity()
export class Tournament extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column({ default: EntityState.NOT_STARTED })
    state: EntityState;

    @Field(() => Season)
    @ManyToOne(() => Season, season => season.tournaments)
    season: Promise<Season>;

    @Field(() => [Match])
    @OneToMany(() => Match, match => match.tournament)
    matches: Promise<Match[]>;

    @Field()
    @CreateDateColumn()
    createdAt: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt: Date;

    static async getActiveTournament(): Promise<Tournament> | null {
        const tournament = await Tournament.findOne({
            state: EntityState.ONGOING,
        });
        if (!tournament) {
            return null;
        }

        return tournament;
    }

    static async createTournament(): Promise<Tournament> {
        if (await Tournament.getActiveTournament()) {
            throw new Error("Only one tournament can be active");
        }

        const season = await Season.getOngoingSeason();
        if (!season) {
            throw new Error("Season not found");
        }
        const players = await season.getPlayers();

        const tournament = await Tournament.create({}).save();
        tournament.season = Promise.resolve(season);
        await tournament.save();

        const playerPairs = Tournament.getAllPlayerPairs(players);

        const matchPromises = playerPairs.map(pair =>
            Match.createMatch(pair, tournament)
        );
        await Promise.all(matchPromises);

        await tournament.start();

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

    async start(): Promise<Tournament> {
        this.state = EntityState.ONGOING;

        return await this.save();
    }

    async finish(): Promise<Tournament> {
        this.state = EntityState.FINISHED;
        await this.save();

        // add season points
        const season = await this.season;
        const results = await this.getScoreTable();
        for (let i = 0; i < results.length; i++) {
            const pointsIncrease = seasonScorePerPlace(i + 1);
            if (pointsIncrease <= 0) {
                break;
            }

            season.increasePlayerScore(results[i].player, pointsIncrease);
        }

        return this;
    }

    async getScoreTable(): Promise<ScoreResult[]> {
        const matches = await this.matches;
        const players = await (await this.season).getPlayers();

        // initialize temporary object with scores
        const scores = players.reduce(
            (prev, curr) => ({
                ...prev,
                [curr.id]: 0,
            }),
            {}
        );

        // preload winner and loser of each match (required for sorting)
        const preloadedMatchWinnersAndLosers: {
            winner: Player;
            loser: Player;
        }[] = [];
        for (const match of matches) {
            preloadedMatchWinnersAndLosers.push({
                winner: await match.winner,
                loser: await match.loser,
            });
        }

        // increment player's score for each win
        for (const preloaded of preloadedMatchWinnersAndLosers) {
            scores[preloaded.winner.id]++;
        }

        // compare based on score; if score of both players is equal, better is one who won direct match
        const compare = (a: ScoreResult, b: ScoreResult) => {
            if (b.score === a.score) {
                for (const preloaded of preloadedMatchWinnersAndLosers) {
                    if (
                        a.player.id === preloaded.winner.id &&
                        b.player.id === preloaded.loser.id
                    ) {
                        return -1;
                    }
                    if (
                        b.player.id === preloaded.winner.id &&
                        a.player.id === preloaded.loser.id
                    ) {
                        return 1;
                    }
                }
            }

            return b.score - a.score;
        };

        const scoreTable: ScoreResult[] = players
            .map(player => ({
                player,
                score: scores[player.id],
            }))
            .sort((a, b) => compare(a, b));

        return scoreTable;
    }

    async submitFinishedMatch() {
        const matches = await this.matches;
        if (matches.every(match => match.state === EntityState.FINISHED)) {
            await this.finish();
        }
    }
}
